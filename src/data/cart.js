/**
 * Cart storage — a small localStorage-backed store.
 *
 * The cart lives in the browser until the order is confirmed; confirmed orders
 * are created and priced on the server (see ./orders.js). A line item keeps
 * enough of the product snapshot to render the cart without looking the
 * product up again.
 */

const KEY = 'cyndi.showcase.cart.v1'
const CHECKOUT_KEY = 'cyndi.showcase.checkout.v1'

export function loadCart() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : []
  } catch {
    return []
  }
}

export function saveCart(items) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // A full or blocked localStorage should never break the page.
  }
}

/** Checkout contact-form draft, so a half-filled form survives a reload. */
export function loadCheckoutDraft() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHECKOUT_KEY) || 'null')
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveCheckoutDraft(draft) {
  try {
    window.localStorage.setItem(CHECKOUT_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

function isValidItem(it) {
  return it && typeof it === 'object' && it.productId && it.quantity > 0
}

/** The key that identifies a cart line: same product + same colourway. */
export function lineKey(productId, colorIndex, size) {
  return [productId, colorIndex ?? -1, size ?? ''].join('|')
}

/**
 * Add a line to the cart. Adding the same product in the same colour and
 * size increases the quantity instead of creating a duplicate line.
 */
export function addItem(items, item) {
  const key = lineKey(item.productId, item.colorIndex, item.size)
  const existing = items.find((i) => lineKey(i.productId, i.colorIndex, i.size) === key)
  if (existing) {
    return items.map((i) =>
      lineKey(i.productId, i.colorIndex, i.size) === key
        ? { ...i, quantity: i.quantity + item.quantity }
        : i,
    )
  }
  return [...items, { ...item, key }]
}

/** Set a line's quantity, never below the line's MOQ (the server enforces this too). */
export function updateQuantity(items, key, quantity) {
  return items.map((i) => {
    if (i.key !== key) return i
    const moq = Math.max(1, Math.floor(Number(i.moq) || 1))
    return { ...i, quantity: Math.max(moq, Math.floor(Number(quantity) || moq)) }
  })
}

export function removeItem(items, key) {
  return items.filter((i) => i.key !== key)
}

/**
 * The unit price for a line. Products carry tiered pricing: the highest tier
 * whose quantity the order reaches applies; below the lowest tier the lowest
 * tier's price applies. functions/api/showcase/orders.js uses the same rule and
 * is authoritative — this copy is only for display before the order is placed.
 */
export function unitPrice(product, quantity) {
  const tiers = (product?.pricing || [])
    .filter((t) => Number.isFinite(Number(t.quantity)) && Number.isFinite(Number(t.price)))
    .sort((a, b) => Number(a.quantity) - Number(b.quantity))
  if (!tiers.length) return 0
  let price = Number(tiers[0].price)
  for (const t of tiers) {
    if (quantity >= Number(t.quantity)) price = Number(t.price)
  }
  return price
}

export function lineTotal(product, quantity) {
  return unitPrice(product, quantity) * quantity
}

export function cartTotal(items, productsById) {
  return items.reduce((sum, it) => {
    const p = productsById[it.productId]
    return sum + (p ? lineTotal(p, it.quantity) : 0)
  }, 0)
}
