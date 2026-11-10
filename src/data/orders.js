/**
 * Server-side showcase orders (/api/showcase/orders).
 *
 * Orders are created and priced on the server; the client only sends what was
 * picked (product, colour, size, quantity) plus the contact details.
 * A 401 throws an error with authRequired = true so the app can return to sign-in.
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
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
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
