/**
 * Showcase session management.
 *
 * The Showcase shares the Portal's customer_session cookie. There is no
 * Showcase-only sign-in form: when there is no valid Portal session the page
 * sends the visitor to /portal/login/ with `next` set back to the current
 * Showcase URL. The server still validates every API request.
 */

const PORTAL_LOGIN = '/portal/login/';

/** Portal sign-in URL that returns to the current Showcase page. */
export function portalLoginUrl() {
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = current && current !== '/' ? current : '/showcase/';
  return `${PORTAL_LOGIN}?next=${encodeURIComponent(next)}`;
}

export function redirectToPortalLogin() {
  window.location.replace(portalLoginUrl());
}

/**
 * Asks the server whether the shared Portal session is valid.
 * `configured: false` means customer sessions are not configured on the server
 * (503); the caller must show a real error instead of bouncing to login in a
 * loop.
 */
export async function checkSession() {
  try {
    const res = await fetch('/api/showcase/auth', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 503) {
      return {
        authenticated: false,
        configured: false,
        error: data.error || 'Customer sessions are not configured',
      }
    }
    if (!res.ok) return { authenticated: false, configured: true }
    return {
      authenticated: !!data.authenticated,
      configured: true,
      user: data.user || null,
    }
  } catch {
    return { authenticated: false, configured: true, error: 'Network error' }
  }
}

/**
 * Legacy helper kept for callers that still sign in from an API client.
 * The Showcase UI itself always uses the Portal login page.
 */
export async function login(identifier, password) {
  const res = await fetch('/api/showcase/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username: identifier, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Sign-in failed')
  return data
}

export async function logout() {
  try {
    await fetch('/api/showcase/auth', {
      method: 'DELETE',
      credentials: 'same-origin',
    })
  } catch {
    /* Ignore sign-out failures; local state is cleared regardless. */
  }
}
