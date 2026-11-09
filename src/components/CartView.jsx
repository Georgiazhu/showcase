import { useMemo } from 'react'
import { unitPrice } from '../data/cart.js'

const cur = (c) => (c === 'CNY' ? '¥' : c === 'EUR' ? '€' : '$')

/**
 * Cart view — the items queued for an order.
 *
 * Every line can change colour, size and quantity, and can be removed. The
 * total uses the same tiered pricing the product card shows, so the number
 * here matches the number on the card.
 */
export default function CartView({ items, productsById, onQuantity, onRemove, onCheckout, onBack }) {
  const symbol = '$'
  const total = useMemo(
    () =>
      items.reduce((sum, it) => {
        const p = productsById[it.productId]
        return sum + (p ? unitPrice(p, it.quantity) * it.quantity : 0)
      }, 0),
    [items, productsById],
  )

  if (!items.length) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f2efe9] text-stone-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-bold text-stone-900">Your cart is empty</h2>
          <p className="mt-2 text-[13px] text-stone-500">
            Browse the showcase and add the products you would like to order.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-full bg-stone-900 px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-stone-700"
          >
            Back to showcase
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Cart</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium text-stone-500 underline underline-offset-4 transition hover:text-stone-900"
        >
          Continue browsing
        </button>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Line items */}
        <ul className="space-y-4">
          {items.map((it) => {
            const product = productsById[it.productId]
            const moq = it.moq || 1
            const step = moq > 1 ? moq : 1
            const unit = product ? unitPrice(product, it.quantity) : it.unitPrice
            const sym = cur(product?.currency || '$')
            return (
              <li
                key={it.key}
                className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,31,58,0.04)]"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f2efe9]">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold leading-snug text-stone-900">{it.name}</h3>
                      <p className="mt-0.5 text-[10px] text-stone-400">
                        {it.sku}
                        {it.categoryName ? ` · ${it.categoryName}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(it.key)}
                      className="shrink-0 text-[11px] font-medium text-stone-400 transition hover:text-[#b7410e]"
                    >
                      Remove
                    </button>
                  </div>

                  <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-stone-600">
                    <div className="flex items-center gap-1.5">
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
                    {it.size ? (
                      <div className="flex items-center gap-1.5">
                        <dt className="text-stone-400">Size</dt>
                        <dd className="font-medium text-stone-800">{it.size}</dd>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <dt className="text-stone-400">Lead time</dt>
                      <dd className="font-medium text-stone-800">
                        {it.leadTime ? `${it.leadTime} days` : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400">Qty</span>
                      <div className="flex items-center rounded-full border border-stone-300">
                        <button
                          type="button"
                          onClick={() => onQuantity(it.key, it.quantity - step)}
                          disabled={it.quantity <= moq}
                          className="flex h-8 w-8 items-center justify-center rounded-l-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-30"
                          aria-label={`Decrease quantity of ${it.name}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={it.quantity}
                          min={moq}
                          step={step}
                          onChange={(e) => onQuantity(it.key, e.target.value)}
                          className="w-14 border-0 bg-transparent text-center text-[13px] font-medium tabular-nums text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label={`Quantity of ${it.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => onQuantity(it.key, it.quantity + step)}
                          className="flex h-8 w-8 items-center justify-center rounded-r-full text-stone-700 transition hover:bg-stone-100"
                          aria-label={`Increase quantity of ${it.name}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>
                      {moq > 1 && <span className="text-[11px] text-stone-400">MOQ {moq}</span>}
                    </div>

                    <div className="text-right">
                      <p className="text-[14px] font-bold tabular-nums text-stone-900">
                        {sym}
                        {(unit * it.quantity).toFixed(2)}
                      </p>
                      <p className="text-[11px] tabular-nums text-stone-400">
                        {sym}
                        {unit.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">Summary</h2>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-stone-500">Items</dt>
                <dd className="font-medium tabular-nums text-stone-900">{items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Total units</dt>
                <dd className="font-medium tabular-nums text-stone-900">
                  {items.reduce((n, i) => n + i.quantity, 0)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2">
                <dt className="font-bold text-stone-900">Estimated total</dt>
                <dd className="font-bold tabular-nums text-stone-900">
                  {symbol}
                  {total.toFixed(2)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg bg-[#f2efe9] px-3 py-2.5 text-[11px] leading-relaxed text-stone-600">
              Prices are indicative unit pricing in USD at the stated MOQ, pre-tax and pre-shipping.
              Custom artwork and decoration are quoted separately.
            </p>

            <button
              type="button"
              onClick={onCheckout}
              className="mt-4 w-full rounded-full bg-[#e07a3a] px-5 py-3 text-[13px] font-medium text-white transition hover:bg-[#b7410e]"
            >
              Confirm order
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
