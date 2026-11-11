import { useEffect, useRef, useState } from 'react'
import { currencySymbol, formatAmount } from '../data/currency.js'
import { canCancel, formatPlacedAt, safeImageUrl } from '../data/orders.js'
import { statusKey } from '../data/orderStatus.js'
import { StatusBadge, StatusProgress } from './OrderStatus.jsx'
import ShipmentTracking from './ShipmentTracking.jsx'

const DISPATCHED = ['shipped', 'in_transit', 'delivered']

/**
 * Order view — the confirmed order.
 *
 * It uses the showcase's own visual language (same warm neutral palette, same
 * card and table treatment) but only shows the products that were ordered:
 * basic product information, the chosen colour, the size and the quantity.
 *
 * `order` is the server order from /api/showcase/orders: prices, line totals
 * and the total were computed on the server and are shown as is.
 * `justPlaced` is true right after checkout; `onRefresh` re-fetches the order
 * so status changes made by staff appear.
 * `onCancel` cancels the order (only offered while it is pending/processing, i.e.
 * before dispatch); it resolves to { message } or throws with the server message.
 * The server enforces the same rule; the button is only a convenience.
 */
export default function OrderView({
  order,
  productsById,
  onBack,
  onPrint,
  onRefresh,
  refreshing = false,
  refreshError = '',
  justPlaced = false,
  onOpenOrders,
  onCancel,
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelNotice, setCancelNotice] = useState('')
  const keepButtonRef = useRef(null)
  const cancelButtonRef = useRef(null)

  // Move focus into the inline confirmation when it opens.
  useEffect(() => {
    if (confirmingCancel) keepButtonRef.current?.focus()
  }, [confirmingCancel])

  if (!order) return null

  const cancellable = !!onCancel && canCancel(order.status)
  const dispatched = DISPATCHED.includes(statusKey(order.status))

  const closeConfirm = () => {
    setConfirmingCancel(false)
    // Return focus to the trigger if it is still on the page.
    requestAnimationFrame(() => cancelButtonRef.current?.focus())
  }

  const handleConfirmCancel = async () => {
    setCancelling(true)
    setCancelError('')
    setCancelNotice('')
    try {
      const result = await onCancel()
      if (result) setCancelNotice(result.message || 'Your order has been cancelled.')
      setConfirmingCancel(false)
    } catch (e) {
      setCancelError(e?.message || 'Could not cancel the order')
      setConfirmingCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  const items = Array.isArray(order.items) ? order.items : []
  const total = Number(order.total) || 0
  const units = Number(order.itemCount) || items.reduce((n, i) => n + (Number(i.quantity) || 0), 0)
  const orderSym = currencySymbol(order.currency || items[0]?.currency)
  const contact = order.contact || {}

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      {/* Order header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
              {justPlaced ? 'Order confirmed' : 'Order'}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">{order.orderNo}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1.5 text-[13px] text-stone-500">
              Placed {formatPlacedAt(order.createdAt)} · {items.length} {items.length === 1 ? 'product' : 'products'} ·{' '}
              {units} {units === 1 ? 'unit' : 'units'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 print:hidden">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            )}
            {cancellable && (
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => {
                  setCancelError('')
                  setCancelNotice('')
                  setConfirmingCancel(true)
                }}
                disabled={cancelling || confirmingCancel}
                aria-expanded={confirmingCancel}
                aria-controls="cancel-order-confirm"
                className="rounded-full border border-red-300 px-4 py-2 text-[13px] font-medium text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Cancel order
              </button>
            )}
            {onOpenOrders && (
              <button
                type="button"
                onClick={onOpenOrders}
                className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
              >
                All orders
              </button>
            )}
            <button
              type="button"
              onClick={onPrint}
              className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-stone-900 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-stone-700"
            >
              Back to showcase
            </button>
          </div>
        </div>

        {/* Order status */}
        <div className="mt-6 border-t border-stone-100 pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
              Order status
            </h2>
            <p className="text-[11px] text-stone-400" aria-live="polite">
              {order.statusUpdatedAt ? `Last updated ${formatPlacedAt(order.statusUpdatedAt)}` : ''}
            </p>
          </div>
          {confirmingCancel && cancellable && (
            <div
              id="cancel-order-confirm"
              role="group"
              aria-labelledby="cancel-order-confirm-title"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 print:hidden"
              onKeyDown={(e) => {
                if (e.key === 'Escape' && !cancelling) closeConfirm()
              }}
            >
              <p id="cancel-order-confirm-title" className="text-[13px] font-bold text-red-800">
                Cancel order {order.orderNo}?
              </p>
              <p className="mt-1 text-[12px] text-red-700">
                The order has not been dispatched yet, so it can still be cancelled. This cannot be undone.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="rounded-full bg-red-700 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel order'}
                </button>
                <button
                  ref={keepButtonRef}
                  type="button"
                  onClick={closeConfirm}
                  disabled={cancelling}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900 disabled:opacity-50"
                >
                  Keep order
                </button>
              </div>
            </div>
          )}
          {cancelNotice && (
            <p role="status" className="mt-3 text-[12px] font-medium text-stone-700">
              {cancelNotice}
            </p>
          )}
          {cancelError && (
            <p role="alert" className="mt-3 text-[12px] font-medium text-[#b7410e]">
              {cancelError}
            </p>
          )}
          <div className="mt-4">
            <StatusProgress status={order.status} />
          </div>
          {onCancel && dispatched && (
            <p className="mt-3 text-[12px] text-stone-500 print:hidden">
              This order has already been dispatched, so it can no longer be cancelled online. Please
              contact us if you need help.
            </p>
          )}
          <div className="mt-5">
            <ShipmentTracking shipments={order.shipments} />
          </div>
          {refreshError && (
            <p role="alert" className="mt-3 text-[12px] font-medium text-[#b7410e]">
              {refreshError}
            </p>
          )}
        </div>

        {/* Project workflow — general process note, not the order status */}
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
          Project workflow
        </p>
        <ol
          className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-stone-500"
          aria-label="Project workflow (general process, not the order status)"
        >
          {[
            ['1', 'Confirm products'],
            ['2', 'Finalize artwork'],
            ['3', 'HRT approves samples'],
            ['4', 'Arrange production'],
            ['5', 'Warehouse intake inspection'],
          ].map(([n, label]) => (
            <li key={n} className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e07a3a]/12 text-[10px] font-bold text-[#b7410e]">
                {n}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {/* Contact */}
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-stone-100 pt-4 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Contact', contact.name],
            ['Email', contact.email],
            ['Phone', contact.phone],
            ['Company', contact.company],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-stone-400">{label}</dt>
              <dd className="break-words font-medium text-stone-800">{value || '—'}</dd>
            </div>
          ))}
          {order.notes ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-stone-400">Notes</dt>
              <dd className="whitespace-pre-line break-words font-medium text-stone-800">{order.notes}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {/* Ordered products */}
      <h2 className="mt-9 text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">
        Ordered products
      </h2>

      <ul className="mt-4 space-y-4">
        {items.map((it, i) => {
          // Descriptive extras (spec, materials…) come from the live catalogue
          // when the product still exists; prices always come from the order.
          const product = productsById[it.productId] || {}
          const sym = currencySymbol(it.currency)
          const unit = Number(it.unitPrice) || 0
          const line = Number(it.lineTotal ?? unit * it.quantity) || 0
          const spec = product.spec
          const materials = product.materials
          const priceIncludes = product.priceIncludes
          const image = safeImageUrl(it.image)
          const fallbackImage = safeImageUrl(product.image)
          return (
            <li
              key={`${it.productId}-${it.colorIndex ?? ''}-${it.size ?? ''}-${i}`}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,31,58,0.04)]"
            >
              <div className="flex gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2efe9] p-1">
                  {image || fallbackImage ? (
                    <img
                      src={image || fallbackImage}
                      alt={it.name}
                      className="h-full w-full object-contain"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        // Fall back to the product's main photo if the colour
                        // image is unavailable.
                        if (fallbackImage && e.currentTarget.getAttribute('src') !== fallbackImage) {
                          e.currentTarget.src = fallbackImage
                        }
                      }}
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-stone-900">{it.name}</h3>
                  <p className="mt-0.5 text-[10px] text-stone-400">
                    {it.sku}
                    {product.categoryName ? ` · ${product.categoryName}` : ''}
                  </p>

                  {/* Basic product information */}
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-3">
                    <div>
                      <dt className="text-stone-400">Color</dt>
                      <dd className="flex items-center gap-1.5 font-medium text-stone-800">
                        {it.colorHex ? (
                          <span
                            className="inline-block h-3 w-3 rounded-full ring-1 ring-black/15"
                            style={{ backgroundColor: it.colorHex }}
                          />
                        ) : null}
                        {it.colorName || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Size</dt>
                      <dd className="font-medium text-stone-800">{it.size || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Quantity</dt>
                      <dd className="font-medium tabular-nums text-stone-800">
                        {it.quantity} {it.quantity === 1 ? 'pc' : 'pcs'}
                      </dd>
                    </div>
                    {spec ? (
                      <div>
                        <dt className="text-stone-400">Specification</dt>
                        <dd className="font-medium text-stone-800">{spec}</dd>
                      </div>
                    ) : null}
                    {materials ? (
                      <div>
                        <dt className="text-stone-400">Materials</dt>
                        <dd className="font-medium text-stone-800">{materials}</dd>
                      </div>
                    ) : null}
                    {it.leadTime ? (
                      <div>
                        <dt className="text-stone-400">Lead time</dt>
                        <dd className="font-medium text-stone-800">{it.leadTime} days</dd>
                      </div>
                    ) : null}
                  </dl>

                  {priceIncludes ? (
                    <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
                      <span className="font-bold text-stone-700">Price Includes:</span> {priceIncludes}
                    </p>
                  ) : null}

                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <table className="quantity-table w-auto">
                      <tbody>
                        <tr>
                          <td className="pr-6">Unit price</td>
                          <td className="tabular-nums">
                            {sym}
                            {formatAmount(unit)}
                          </td>
                        </tr>
                        <tr>
                          <td className="pr-6">Quantity</td>
                          <td className="tabular-nums">{it.quantity}</td>
                        </tr>
                        <tr>
                          <td className="pr-6 font-bold">Line total</td>
                          <td className="font-bold tabular-nums">
                            {sym}
                            {formatAmount(line)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">Order total</h2>
          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-stone-500">Products</dt>
              <dd className="font-medium tabular-nums text-stone-900">{items.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Total units</dt>
              <dd className="font-medium tabular-nums text-stone-900">{units}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2">
              <dt className="font-bold text-stone-900">Estimated total</dt>
              <dd className="font-bold tabular-nums text-stone-900">
                {orderSym}
                {formatAmount(total)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-[#f2efe9] px-3 py-2.5 text-[11px] leading-relaxed text-stone-600">
            Indicative unit pricing, pre-tax and pre-shipping, at the stated MOQ. Custom artwork
            and decoration are quoted separately. Final pricing is confirmed once artwork is finalised.
          </p>
        </div>
      </div>
    </div>
  )
}
