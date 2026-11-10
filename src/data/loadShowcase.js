import localData from './showcase.json'

/**
 * Data source: the live API (the content edited in the admin console).
 *
 * Note: the endpoint requires a session and answers 401 when signed out — in that case we
 * throw authRequired and the page switches to the sign-in form. No local JSON fallback
 */
export async function fetchShowcase() {
  const res = await fetch('/api/showcase', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })

  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}))
    const err = new Error(res.status === 403 ? data.error || 'This account does not have Showcase access' : 'Unauthorized')
    err.authRequired = true
    err.noAccess = res.status === 403
    throw err
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (!data || !Array.isArray(data.categories) || !data.categories.length) {
    throw new Error('empty payload')
  }
  return { meta: data.meta || localData.meta, categories: data.categories, source: 'api' }
}
