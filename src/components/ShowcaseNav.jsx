import { useEffect, useState } from 'react'

/** Cyndi brand navigation — visual language shared with the cyndiglobal.com site */
export default function ShowcaseNav({ categories = [], user = null, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-stone-200 bg-white/90 backdrop-blur' : 'bg-white'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-10">
        <a href="/showcase/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
            C
          </span>
          <span className="text-lg font-bold tracking-tight text-stone-900">Cyndi</span>
        </a>

        {/* Desktop: category anchor navigation — Kotis category browsing */}
        <ul className="hidden items-center gap-6 lg:flex">
          {categories.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {/* Signed-in user + sign out */}
          {user && (
            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-2 rounded-full border border-stone-300 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-stone-700 sm:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                  {(user.displayName || user.username || '?').slice(0, 2).toUpperCase()}
                </span>
                {user.displayName || user.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
              >
                Sign out
              </button>
            </div>
          )}
          <a
            href="/admin/showcase.html"
            className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900 sm:block"
          >
            Edit
          </a>
          <a
            href="mailto:projects@cyndiglobal.com"
            className="hidden rounded-full bg-[#e07a3a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b7410e] sm:block"
          >
            Contact Us
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-stone-700 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-stone-200 bg-white px-5 py-3 lg:hidden">
          <ul className="space-y-1">
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-stone-600"
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
