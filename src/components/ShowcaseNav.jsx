import { useEffect, useRef, useState } from 'react'

/**
 * Showcase navigation — Cyndi brand header.
 *
 * Layout note: the category directory and the account controls used to share a
 * single row, so a long category name ("Mid-Tier & Premium Zip-Up Jacket") ran
 * underneath the signed-in avatar. They are now on two separate rows — the
 * directory gets the full width on its own line and scrolls sideways, the
 * account controls stay pinned to the right of the brand row.
 */
export default function ShowcaseNav({
  categories = [],
  user = null,
  onLogout,
  cartCount = 0,
  cartUnits = 0,
  onOpenCart,
  currentView = 'catalogue',
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null)
  const railRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the category currently in view.
  useEffect(() => {
    if (!categories.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: 0 },
    )
    categories.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories])

  // Keep the active chip in view when the directory scrolls horizontally.
  useEffect(() => {
    const rail = railRef.current
    const active = rail?.querySelector('[data-active="true"]')
    if (!rail || !active) return
    const offset = active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2
    rail.scrollTo({ left: Math.max(offset, 0), behavior: 'smooth' })
  }, [activeId])

  return (
    <header className="sticky top-0 z-50">
      {/* Row 1 — brand + account controls */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled ? 'border-stone-200/80 bg-white/85 backdrop-blur-md' : 'border-stone-200 bg-white'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 lg:px-10">
          <a href="/showcase/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
              C
            </span>
            <span className="text-lg font-bold tracking-tight text-stone-900">Cyndi</span>
          </a>

          <div className="flex shrink-0 items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-2 rounded-full border border-stone-300 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium text-stone-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                    {(user.displayName || user.username || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.displayName || user.username}</span>
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
            <button
              type="button"
              onClick={onOpenCart}
              className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                currentView === 'cart'
                  ? 'border-[#b7410e] bg-[#b7410e] text-white'
                  : 'border-[#e07a3a] bg-[#e07a3a] text-white hover:bg-[#b7410e] hover:border-[#b7410e]'
              }`}
              aria-label={`Open cart, ${cartCount} line${cartCount === 1 ? '' : 's'}, ${cartUnits} unit${cartUnits === 1 ? '' : 's'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span
                  className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-[#e07a3a] bg-white px-1 text-[10px] font-bold tabular-nums text-[#b7410e]`}
                  title={`${cartUnits} unit${cartUnits === 1 ? '' : 's'}`}
                >
                  {cartCount}
                </span>
              )}
            </button>
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
      </div>

      {/* Row 2 — category directory, full width, scrolls sideways.
          Hidden on the cart and order views, which have their own structure. */}
      {currentView === 'catalogue' && (
      <div className="border-b border-stone-200/80 bg-[#f2efe9]">
        <nav className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <ul
            ref={railRef}
            className="flex items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((c) => {
              const active = activeId === c.id
              return (
                <li key={c.id} className="shrink-0">
                  <a
                    href={`#${c.id}`}
                    data-active={active ? 'true' : 'false'}
                    aria-current={active ? 'true' : undefined}
                    className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                    }`}
                  >
                    {c.name}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      )}

      {currentView === 'catalogue' && open && (
        <div className="border-b border-stone-200 bg-white px-5 py-3 lg:hidden">
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
