import { useCallback, useEffect, useState } from 'react'
import { formatMoney } from '../data/currency.js'
import { fetchOrder, formatPlacedAt, listOrders, normalizeOrderNo } from '../data/orders.js'
import { StatusBadge } from './OrderStatus.jsx'

/**
 * Orders view — every order placed under this Showcase login (the server
 * returns the 50 most recent SHOWCASE- orders), plus a "Find an order" lookup by
 * order number. Equivalent of the shop's "My orders" + "Track order".
 *
 * onShowOrder(order) opens the detail view with an already-loaded order.
 * onAuthLost() returns to sign-in on a 401. onLoaded(list) lets the app reuse
 * the list for "Previous orders".
 */
export default function OrdersView({ onShowOrder, onAuthLost, onLoaded, onBack }) {
  // 'loading' | 'ready' | 'error'
  const [state, setState] = useState('loading')
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [findError, setFindError] = useState('')
  const [finding, setFinding] = useState(false)
  const [opening, setOpening] = useState('')

  const load = useCallback(async () => {
    setState('loading')
    setError('')
    try {
      const list = await listOrders()
      setOrders(list)
      setState('ready')
      onLoaded?.(list)
    } catch (e) {
      if (e?.authRequired) {
        onAuthLost?.()
        return
      }
      setError(e?.message || 'Could not load orders')
      setState('error')
    }
  }, [onAuthLost, onLoaded])

  useEffect(() => {
    load()
  }, [load])

  const open = useCallback(
    async (orderNo, fromSearch = false) => {
      if (fromSearch) setFinding(true)
      else setOpening(orderNo)
      setFindError('')
      try {
        const o = await fetchOrder(orderNo)
        if (!o) throw Object.assign(new Error('Order not found'), { status: 404 })
        onShowOrder?.(o)
      } catch (e) {
        if (e?.authRequired) {
          onAuthLost?.()
          return
        }
        const msg = e?.status === 404 ? 'Order not found' : e?.message || 'Could not load the order'
        if (fromSearch) setFindError(msg)
        else setError(msg)
      } finally {
        setFinding(false)
        setOpening('')
      }
    },
    [onShowOrder, onAuthLost],
  )

  const handleFind = (e) => {
    e.preventDefault()
    const no = normalizeOrderNo(query)
    if (!no) {
      setFindError('Enter a valid order number, e.g. SHOWCASE-20261110-001.')
      return
    }
    setQuery(no)
    open(no, true)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Showcase</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900">Orders</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] text-stone-500">
            All orders placed under this Showcase login are listed here, including those placed by
            colleagues who share the account.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-stone-900 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-stone-700"
        >
          Back to showcase
        </button>
      </div>

      {/* Find an order */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">
          Find an order
        </h2>
        <form onSubmit={handleFind} className="mt-3 flex flex-col gap-2.5 sm:flex-row" noValidate>
          <label htmlFor="find-order-no" className="sr-only">
            Order number
          </label>
          <input
            id="find-order-no"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (findError) setFindError('')
            }}
            placeholder="e.g. SHOWCASE-20261110-001"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={findError ? 'true' : undefined}
            aria-describedby={findError ? 'find-order-error' : undefined}
            className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-[13px] text-stone-800 placeholder-stone-400 outline-none transition focus:border-stone-900"
          />
          <button
            type="submit"
            disabled={finding}
            className="rounded-full bg-[#e07a3a] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#b7410e] disabled:opacity-50"
          >
            {finding ? 'Searching…' : 'Find order'}
          </button>
        </form>
        {findError && (
          <p id="find-order-error" role="alert" className="mt-2 text-[12px] font-medium text-[#b7410e]">
            {findError}
          </p>
        )}
      </div>

      {/* List */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">
            Recent orders
          </h2>
          {state === 'ready' && (
            <button
              type="button"
              onClick={load}
              className="text-[12px] font-medium text-[#b7410e] underline underline-offset-2 transition hover:text-[#e07a3a]"
            >
              Refresh
            </button>
          )}
        </div>

        {state === 'loading' && (
          <p className="py-8 text-center text-[13px] text-stone-400" role="status">
            Loading orders…
          </p>
        )}

        {state === 'error' && (
          <div className="py-8 text-center" role="alert">
            <p className="text-[13px] text-stone-600">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-full bg-stone-900 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-stone-700"
            >
              Retry
            </button>
          </div>
        )}

        {state === 'ready' && error && (
          <p role="alert" className="mt-3 text-[12px] font-medium text-[#b7410e]">
            {error}
          </p>
        )}

        {state === 'ready' && orders.length === 0 && (
          <p className="py-8 text-center text-[13px] text-stone-500">
            No orders yet. Orders you confirm from the cart will appear here.
          </p>
        )}

        {state === 'ready' && orders.length > 0 && (
          <ul className="mt-3 divide-y divide-stone-100">
            {orders.map((o) => (
              <li key={o.orderNo}>
                <button
                  type="button"
                  onClick={() => open(o.orderNo)}
                  disabled={opening === o.orderNo}
                  aria-label={`Open order ${o.orderNo}`}
                  className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-lg px-2 py-3 text-left transition hover:bg-[#faf9f6] disabled:opacity-60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-stone-900">{o.orderNo}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {formatPlacedAt(o.createdAt)}
                      {o.company ? ` · ${o.company}` : ''} · {o.lineCount || 0}{' '}
                      {o.lineCount === 1 ? 'line' : 'lines'} · {o.itemCount || 0}{' '}
                      {o.itemCount === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-stone-900">
                    {formatMoney(o.total, o.currency)}
                  </span>
                  <StatusBadge status={o.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
