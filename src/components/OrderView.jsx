import { currencySymbol } from '../data/currency.js'
import { formatPlacedAt } from '../data/orders.js'

/**
 * Order view — the confirmed order.
 *
 * It uses the showcase's own visual language (same warm neutral palette, same
 * card and table treatment) but only shows the products that were ordered:
 * basic product information, the chosen colour, the size and the quantity.
 *
 * `order` is the server order from /api/showcase/orders: prices, line totals
 * and the total were computed on the server and are shown as is.
 * `history` is the server's recent-orders summary list.
 */
export default function OrderView({ order, history = [], onOpenOrder, productsById, onBack, onPrint }) {
  if (!order) return null

  const items = Array.isArray(order.items) ? order.items : []
  const total = Number(order.total) || 0
  const units = Number(order.itemCount) || items.reduce((n, i) => n + (Number(i.quantity) || 0), 0)
  const orderSym = currencySymbol(order.currency || items[0]?.currency)
  const contact = order.contact || {}
  const previous = history.filter((o) => o.orderNo !== order.orderNo).slice(0, 5)

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      {/* Order header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Order confirmed</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900">{order.orderNo}</h1>
            <p className="mt-1.5 text-[13px] text-stone-500">
              Placed {formatPlacedAt(order.createdAt)} · {items.length} {items.length === 1 ? 'product' : 'products'} ·{' '}
              {units} {units === 1 ? 'unit' : 'units'}
            </p>
          </div>
          <div className="flex gap-2.5">
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

        <ol className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-stone-500">
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

      {/* Previous orders */}
      {previous.length > 0 && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-stone-900">
            Previous orders
          </h2>
          <ul className="mt-3 divide-y divide-stone-100">
            {previous.map((o) => (
              <li key={o.orderNo} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-stone-900">{o.orderNo}</p>
                  <p className="text-[11px] text-stone-500">
                    {formatPlacedAt(o.createdAt)} · {o.lineCount || 0} product
                    {o.lineCount === 1 ? '' : 's'} · {o.itemCount || 0} units ·{' '}
                    {currencySymbol(o.currency)}
                    {(Number(o.total) || 0).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenOrder?.(o.orderNo)}
                  className="shrink-0 text-[12px] font-medium text-[#b7410e] underline underline-offset-2 transition hover:text-[#e07a3a]"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          return (
            <li
              key={`${it.productId}-${it.colorIndex ?? ''}-${it.size ?? ''}-${i}`}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,31,58,0.04)]"
            >
              <div className="flex gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2efe9] p-1">
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-full w-full object-contain"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        // Fall back to the product's main photo if the colour
                        // image is unavailable.
                        const p = productsById[it.productId]
                        if (p?.image && e.currentTarget.src !== p.image) {
                          e.currentTarget.src = p.image
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
                            {unit.toFixed(2)}
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
                            {line.toFixed(2)}
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
                {total.toFixed(2)}
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
