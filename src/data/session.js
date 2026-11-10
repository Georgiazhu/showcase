/**
 * Showcase session management.
 *
 * The Showcase uses the shop's customer accounts: the session is the shop's HttpOnly
 * customer_session cookie (set by /api/showcase/auth or /api/login). The client only:
 *  1. asks once on startup whether it is signed in (GET /api/showcase/auth)
 *  2. signs in (POST /api/showcase/auth)
 *  3. signs out (DELETE /api/showcase/auth — clears the customer cookie, i.e. also signs out of the shop)
 *
 * A customer can be signed in without Showcase access (e.g. a shop-only account):
 * checkSession then reports authenticated: true, showcaseAccess: false.
 *
 * The cookie is HttpOnly, so JS cannot read or alter it — only these endpoints can.
 */

export async function checkSession() {
  try {
    const res = await fetch('/api/showcase/auth', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
    if (!res.ok) return { authenticated: false }
    const data = await res.json().catch(() => ({}))
    return {
      authenticated: !!data.authenticated,
      showcaseAccess: !!data.showcaseAccess,
      user: data.user || null,
    }
  } catch {
    return { authenticated: false }
  }
}

/** `identifier` is an email address or a username. */
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
