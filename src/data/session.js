/**
 * Showcase session management.
 *
 * The session lives in a server-side HttpOnly cookie. The client only:
 *  1. asks once on startup whether it is signed in (GET /api/showcase/auth)
 *  2. signs in (POST /api/showcase/auth)
 *  3. signs out (DELETE /api/showcase/auth)
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
    return { authenticated: !!data.authenticated, user: data.user || null }
  } catch {
    return { authenticated: false }
  }
}

export async function login(username, password) {
  const res = await fetch('/api/showcase/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username, password }),
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
