/**
 * Showcase 会话管理。
 *
 * 会话由服务端用 HttpOnly cookie 管理，前端只负责：
 *  1. 启动时问一次是否已登录（GET /api/showcase/auth）
 *  2. 登录（POST /api/showcase/auth）
 *  3. 退出（DELETE /api/showcase/auth）
 *
 * cookie 是 HttpOnly，JS 读不到也改不了，只能通过接口操作。
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
  if (!res.ok) throw new Error(data.error || '登录失败')
  return data
}

export async function logout() {
  try {
    await fetch('/api/showcase/auth', {
      method: 'DELETE',
      credentials: 'same-origin',
    })
  } catch {
    /* 忽略退出失败，本地状态照样清 */
  }
}
