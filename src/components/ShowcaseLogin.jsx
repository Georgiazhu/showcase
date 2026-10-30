import { useState } from 'react'

/**
 * Showcase 登录页。
 * 未登录时只显示这个表单，登录成功后才渲染展示内容。
 */
export default function ShowcaseLogin({ onSuccess, onError }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/showcase/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || '登录失败')
      onSuccess?.(data.user)
    } catch (err) {
      setError(err?.message || '登录失败')
      onError?.(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-16">
      <div className="w-full max-w-[420px]">
        {/* 品牌标识 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-lg font-bold text-white">
            C
          </span>
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-stone-400">Showcase</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-tight text-stone-900">Cyndi Global</h1>
          <p className="mt-1 text-[13px] text-stone-500">请输入账号以查看选品提案</p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-stone-200 bg-white p-7 shadow-[0_18px_40px_rgba(15,31,58,0.08)]"
        >
          <div className="mb-4">
            <label htmlFor="sc-username" className="mb-1.5 block text-xs text-stone-500">
              Account
            </label>
            <input
              id="sc-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              placeholder="HRT"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-[14px] text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-[#e07a3a] focus:ring-2 focus:ring-[#e07a3a]/15"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="sc-password" className="mb-1.5 block text-xs text-stone-500">
              Password
            </label>
            <input
              id="sc-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-[14px] text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-[#e07a3a] focus:ring-2 focus:ring-[#e07a3a]/15"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-[#fff1eb] px-3.5 py-2.5 text-[13px] text-[#9a3d22]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#e07a3a] py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#b7410e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? '验证中…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-stone-400">
          Confidential — for authorised recipients only.
          <br />
          本页面内容仅供授权访问。
        </p>
      </div>
    </div>
  )
}
