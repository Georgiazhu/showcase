import { useEffect, useMemo, useRef, useState } from 'react'
import { unitPrice } from '../data/cart.js'
import { currencySymbol, formatAmount } from '../data/currency.js'
import { colourOutOfStock, isTracked, variantStock } from '../data/stock.js'

/**
 * Add to cart panel.
 *
 * Opens over the product card and lets the buyer pick a colour, a size and a
 * quantity before the line is added. The quantity starts at the product's
 * MOQ, because that is the smallest order the price is quoted for.
 *
 * Tracked products (the server sent `stock`) show "N in stock" for the chosen
 * variant, cap the quantity at what is available and require colour + size.
 * Untracked products behave as before (made to order, no stock text).
 */
export default function AddToCartDialog({ product, onClose, onAdd, cartQtyFor }) {
  const colors = product.colors || []
  const sizes = product.sizes || []
  const tracked = isTracked(product)
  const [colorIndex, setColorIndex] = useState(() => {
    if (!colors.length) return null
    if (!tracked) return 0
    const firstInStock = colors.findIndex((_, i) => !colourOutOfStock(product, i))
    return firstInStock >= 0 ? firstInStock : 0
  })
  // One-size tracked products preselect the size; otherwise the buyer picks it.
  const [size, setSize] = useState(() => (tracked && sizes.length === 1 ? sizes[0] : null))
  const [quantity, setQuantity] = useState(product.moq || 1)
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  const moq = product.moq || 1
  const step = moq > 1 ? moq : 1
  const avail = variantStock(product, colorIndex, size)
  // How many are already in the cart for this exact variant, and therefore how many
  // more can still be added. Untracked variants (avail === null) have no cap.
  const inCart = cartQtyFor ? cartQtyFor(product.id, colorIndex, size) : 0
  const remaining = avail === null ? null : Math.max(0, avail - inCart)

  // Never let the shown quantity exceed what can still be added (covers the first add
  // too, e.g. stock is below the MOQ default). Only clamps down, never below MOQ.
  useEffect(() => {
    if (remaining !== null && remaining >= moq && quantity > remaining) {
      setQuantity(remaining)
    }
  }, [remaining, moq, quantity])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Focus trap: keep tabbing inside the panel.
  const onPanelKeyDown = (e) => {
    if (e.key !== 'Tab') return
    const focusables = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (!focusables?.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const unit = useMemo(() => unitPrice(product, quantity), [product, quantity])
  const symbol = currencySymbol(product.currency)

  // "How many more can be added" for a variant = stock − already in cart (null = untracked).
  const remainingFor = (ci, s) => {
    const a = variantStock(product, ci, s)
    if (a === null) return null
    const already = cartQtyFor ? cartQtyFor(product.id, ci, s) : 0
    return Math.max(0, a - already)
  }

  // Quantity stays at or above the MOQ; for a tracked variant it is also capped at what
  // can still be added (only when remaining >= MOQ — otherwise Add is disabled with a reason).
  const clampQty = (n, r) => (r !== null && r >= moq ? Math.min(n, r) : n)
  const setQty = (v) => {
    const n = Math.max(moq, Math.floor(Number(v) || moq))
    setQuantity(clampQty(n, remaining))
  }
  const chooseColour = (i) => {
    setColorIndex(i)
    setQuantity((q) => clampQty(q, remainingFor(i, size)))
  }
  const chooseSize = (s) => {
    setSize(s)
    setQuantity((q) => clampQty(q, remainingFor(colorIndex, s)))
  }

  let blockedReason = null
  if (tracked && colors.length && colorIndex == null) blockedReason = 'Choose a colour'
  else if (tracked && sizes.length && size == null) blockedReason = 'Choose a size'
  else if (avail === 0) blockedReason = 'Out of stock'
  else if (remaining !== null && remaining <= 0) blockedReason = `All ${avail} in stock are already in your cart`
  else if (remaining !== null && remaining < moq) blockedReason = inCart > 0
    ? `Only ${remaining} more can be added (${inCart} already in your cart, ${avail} in stock) — below the minimum order of ${moq}`
    : `Only ${avail} in stock — below the minimum order of ${moq}`

  const submit = () => {
    const color = colorIndex != null ? colors[colorIndex] : null
    onAdd({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      categoryName: product.categoryName || '',
      image: color?.image || product.image || product.gallery?.[0] || '',
      colorIndex,
      colorName: color?.name || '',
      colorHex: color?.hex || '',
      size,
      quantity,
      unitPrice: unit,
      moq,
      leadTime: product.leadTime ?? null,
      spec: product.spec || '',
      materials: product.materials || '',
      priceIncludes: product.priceIncludes || '',
    }, avail) // stock cap for merging into an existing cart line (null = untracked)
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${product.name} to cart`}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onPanelKeyDown}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">Add to cart</p>
            <h3 className="mt-1 text-[15px] font-bold leading-snug text-stone-900">{product.name}</h3>
            <p className="mt-0.5 text-[10px] text-stone-400">{product.sku}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {colors.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-stone-700">
              Color
              <span className="ml-2 font-normal text-stone-500">
                {colorIndex != null ? colors[colorIndex]?.name : 'Select a color'}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c, i) => {
                const out = colourOutOfStock(product, i)
                const label = `${c.name || 'Unnamed'}${out ? ' (out of stock)' : ''}`
                return (
                  <button
                    key={`${c.name || c.hex}-${i}`}
                    type="button"
                    onClick={() => chooseColour(i)}
                    aria-label={label}
                    aria-pressed={colorIndex === i}
                    title={label}
                    className={`block h-7 w-7 rounded-full transition ${out ? 'opacity-35' : ''} ${
                      colorIndex === i
                        ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-white'
                        : 'ring-1 ring-black/15 hover:ring-2 hover:ring-stone-500'
                    }`}
                    style={{ backgroundColor: c.hex || '#d6d3d1' }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-stone-700">Size</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sizes.map((s) => {
                const sizeAvail = variantStock(product, colorIndex, s)
                const out = sizeAvail !== null && sizeAvail <= 0
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => chooseSize(s)}
                    disabled={out}
                    aria-pressed={size === s}
                    aria-label={out ? `${s} (out of stock)` : undefined}
                    className={`rounded-full border px-3 py-1 text-[12px] transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      size === s
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-300 text-stone-600 hover:border-stone-500'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-[12px] font-semibold text-stone-700">
            Quantity
            {moq > 1 && <span className="ml-2 font-normal text-stone-500">MOQ {moq} pcs</span>}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-stone-300">
              <button
                type="button"
                onClick={() => setQty(quantity - step)}
                disabled={quantity <= moq}
                className="flex h-9 w-9 items-center justify-center rounded-l-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                min={moq}
                max={remaining !== null && remaining >= moq ? remaining : undefined}
                step={step}
                onChange={(e) => setQty(e.target.value)}
                className="w-16 border-0 bg-transparent text-center text-[13px] font-medium tabular-nums text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setQty(quantity + step)}
                disabled={remaining !== null && quantity + step > remaining}
                className="flex h-9 w-9 items-center justify-center rounded-r-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <span className="text-[13px] tabular-nums text-stone-600">
              {symbol}
              {formatAmount(unit * quantity)}
              <span className="ml-1 text-stone-400">
                ({symbol}
                {formatAmount(unit)} each)
              </span>
            </span>
          </div>
          <p className="mt-2 min-h-[1em] text-[12px]" aria-live="polite">
            {avail === null ? null : avail <= 0 ? (
              <span className="text-[#b7410e]">Out of stock</span>
            ) : remaining <= 0 ? (
              <span className="text-[#b7410e]">All {avail} in stock are already in your cart</span>
            ) : inCart > 0 ? (
              <span className="text-emerald-700">
                {avail} in stock · {inCart} in your cart · {remaining} more can be added
              </span>
            ) : (
              <span className="text-emerald-700">{avail} in stock</span>
            )}
          </p>
        </div>

        {product.leadTime ? (
          <p className="mt-4 rounded-lg bg-[#f2efe9] px-3 py-2 text-[11px] text-stone-600">
            Estimated lead time: <strong className="text-stone-800">{product.leadTime} days</strong>
            {moq > 1 ? ` · MOQ ${moq} pcs` : ''}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!!blockedReason}
            aria-describedby={blockedReason ? 'add-to-cart-blocked' : undefined}
            className="flex-1 rounded-full bg-[#e07a3a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#b7410e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#e07a3a]"
          >
            Add to cart
          </button>
        </div>
        {blockedReason && (
          <p id="add-to-cart-blocked" className="mt-2 text-right text-[12px] text-stone-600">
            {blockedReason}
          </p>
        )}
      </div>
    </div>
  )
}
