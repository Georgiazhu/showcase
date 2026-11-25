/**
 * Project links for Showcase selections.
 *
 * A product picked in the Showcase always belongs to a client project: the
 * selection becomes that project's Shortlist entry. These helpers use the same
 * customer session and the same D1 rows as the Portal dashboard, so anything
 * added here appears immediately on the client's project card.
 */

const DASHBOARD = '/api/portal/dashboard/'

async function request(options = {}) {
  const res = await fetch(DASHBOARD, {
    credentials: 'same-origin',
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 || res.status === 403) {
    const err = new Error(data.error || 'Your session has expired. Please sign in again.')
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

/** Active (not completed) projects owned by the signed-in customer. */
export async function fetchProjects() {
  const data = await request({ cache: 'no-store' })
  const list = Array.isArray(data.projects) ? data.projects : []
  return list
    .filter((p) => p && p.id && !p.done)
    .map((p) => ({ id: p.id, name: p.name || p.id, stage: p.stage, shortlist: p.shortlist || [] }))
}

/** Start a new project from the Showcase page. */
export async function createProject(title, brief = '') {
  const data = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createProject', title, brief }),
  })
  return data.projectNo
}

/** Add one Showcase product to the chosen project's Shortlist. */
export async function addToShortlist(projectNo, productId) {
  const data = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'addShortlist', projectNo, productIds: [productId] }),
  })
  return { added: Number(data.added) || 0, message: data.message || '' }
}

const PROJECT_KEY = 'cyndi.showcase.project.v1'

export function loadSelectedProject() {
  try {
    return window.localStorage.getItem(PROJECT_KEY) || ''
  } catch {
    return ''
  }
}

export function saveSelectedProject(projectNo) {
  try {
    if (projectNo) window.localStorage.setItem(PROJECT_KEY, projectNo)
    else window.localStorage.removeItem(PROJECT_KEY)
  } catch {
    // Storage is optional; the selection still works for this page load.
  }
}
