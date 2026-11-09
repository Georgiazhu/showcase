/**
 * Cart storage — a small localStorage-backed store.
 *
 * The showcase is a read-only catalogue, so the cart lives entirely in the
 * browser: no API calls, no server state. A line item keeps enough of the
 * product snapshot to render the cart and the order without looking the
 * product up again (which also means the order still renders if the catalogue
 * changes later).
 */

const KEY = 'cyndi.showcase.cart.v1'
const ORDERS_KEY = 'cyndi.showcase.orders.v1'

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

export function loadOrders() {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrder(order) {
  const orders = loadOrders()
  orders.unshift(order)
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 50)))
  } catch {
    // ignore
  }
  return order
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

export function updateQuantity(items, key, quantity) {
  const q = Math.max(1, Math.floor(Number(quantity) || 1))
  return items.map((i) => (i.key === key ? { ...i, quantity: q } : i))
}

export function removeItem(items, key) {
  return items.filter((i) => i.key !== key)
}

/**
 * The unit price for a line. Products carry tiered pricing; the cheapest tier
 * that the quantity reaches is the one that applies.
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

/** Human-readable order number, e.g. CG-20261109-4F2A. */
export function makeOrderNumber(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CG-${y}${m}${d}-${rand}`
}
