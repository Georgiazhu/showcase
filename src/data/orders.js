/**
 * Server-side showcase orders (/api/showcase/orders).
 *
 * Orders are created and priced on the server; the client only sends what was
 * picked (product, colour, size, quantity) plus the contact details.
 * A 401 (signed out) or 403 (no Showcase access) throws an error with authRequired = true
 * so the app can return to sign-in. Orders are per account: only your own are returned.
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    const err = new Error('Your session has expired. Please sign in again.')
    err.authRequired = true
    throw err
  }
  if (res.status === 403 && data.showcaseAccess === false) {
    const err = new Error(data.error || 'This account does not have Showcase access')
    err.authRequired = true
    err.noAccess = true
    throw err
  }
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    // A 409 from cancel carries the order's current state so the view can re-render it.
    if (data.order && typeof data.order === 'object') err.order = data.order
    throw err
  }
  return data
}

/** Statuses a customer may cancel from (before dispatch). Mirrors the server rule. */
export const CANCELLABLE_STATUSES = ['pending', 'processing']

export function canCancel(status) {
  return CANCELLABLE_STATUSES.includes(String(status || '').trim().toLowerCase())
}

/**
 * Cancel one of your own orders before it is dispatched.
 * Resolves to { order, alreadyCancelled, message }. A 409 (already shipped / status
 * just changed) throws with err.status = 409, the server message and err.order.
 */
export async function cancelOrder(orderNo) {
  const data = await request('/api/showcase/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'cancel', orderNo }),
  })
  return { order: data.order, alreadyCancelled: !!data.alreadyCancelled, message: data.message || '' }
}

export async function placeOrder(contact, cart) {
  const items = cart.map((it) => ({
    productId: it.productId,
    colorIndex: it.colorIndex ?? null,
    size: it.size ?? null,
    quantity: it.quantity,
  }))
  const data = await request('/api/showcase/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact, items }),
  })
  return data.order
}

export async function fetchOrder(orderNo) {
  const data = await request(`/api/showcase/orders?orderNo=${encodeURIComponent(orderNo)}`)
  return data.order
}

export async function listOrders() {
  const data = await request('/api/showcase/orders')
  return Array.isArray(data.orders) ? data.orders : []
}

/**
 * Showcase order numbers look like SHOWCASE-20260214-001 (daily sequence);
 * legacy orders may still be SC-20260214-AB12CD. Mirrors SHOWCASE_ORDER_NO_RE
 * in functions/_lib/orders.js.
 */
const ORDER_NO_RE = /^(SC-\d{8}-[A-Z0-9]{1,12}|SHOWCASE-\d{8}-\d{3,})$/

/** Trim + uppercase; returns the normalised number, or null if the format is wrong. */
export function normalizeOrderNo(input) {
  const v = String(input ?? '').trim().toUpperCase()
  return ORDER_NO_RE.test(v) ? v : null
}

/** Image URLs from the server are only used when http(s) or relative. */
export function safeImageUrl(url) {
  if (typeof url !== 'string') return ''
  const v = url.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  // Relative ("/x", "./x", "x/y.jpg") but not protocol-relative or any scheme: (javascript:, data:…)
  if (v.startsWith('//')) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ''
  return v
}

/** Tracking links: only absolute http(s) URLs, else ''. */
export function safeLinkUrl(url) {
  if (typeof url !== 'string') return ''
  const v = url.trim()
  if (!/^https?:\/\//i.test(v)) return ''
  try {
    new URL(v)
    return v
  } catch {
    return ''
  }
}

/** Display time for an ISO timestamp, e.g. "09 Nov 2026, 14:05". */
export function formatPlacedAt(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso || ''
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
