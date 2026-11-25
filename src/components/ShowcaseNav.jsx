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
  onOpenOrders,
  currentView = 'catalogue',
}) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null)
  const railRef = useRef(null)

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
      {/* Row 1 — the same portal header used by the client dashboard. */}
      <div className="border-b border-[#E7E3DC] bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center gap-10 px-8">
          <a href="/portal/dashboard/" className="flex shrink-0 items-center gap-[7px]" aria-label="Cyndi Global portal">
            <img src="/cyndi-logo-mark-v5.png" alt="Cyndi" className="block h-7 w-auto" />
            <img src="/cyndi-logo-word-v5.png" alt="Cyndiglobal" className="block h-7 w-auto" />
          </a>
          <nav className="flex h-full items-center gap-[26px] overflow-x-auto whitespace-nowrap">
            {[['Projects', '/portal/dashboard/'], ['Orders', '/portal/dashboard/?view=orders'], ['Showcase', '/showcase/'], ['Portals', '/portal/dashboard/?view=portals'], ['Inventory', '/portal/dashboard/?view=inventory']].map(([label, href]) => (
              <a key={label} href={href}
                className={`flex h-full items-center border-b-2 text-[13px] font-medium text-[#0f1f3a] transition-colors ${label === 'Showcase' ? 'border-[#C4763B]' : 'border-transparent hover:border-[#C4763B]'}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#8C7B66] text-[10px] font-bold text-white">
              {((user?.displayName || user?.email || 'C').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('')) || 'C'}
            </span>
            <span className="text-[10px] leading-[1.25] text-[#4A443E]">
              {user?.displayName || user?.username || 'Client'}
              <small className="block text-[9px] text-[#8C7B66]">{user?.email || ''}</small>
              <button type="button" onClick={() => onLogout?.()}
                className="text-[9px] text-[#0f1f3a] underline underline-offset-2">
                Logout
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2 — category directory, full width, scrolls sideways.
          Hidden on the cart, order and orders views, which have their own structure. */}
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
            <li className="ml-auto flex shrink-0 items-center gap-2 pl-4">
              <button type="button" onClick={onOpenOrders}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-medium text-stone-700 hover:border-stone-900">
                Orders
              </button>
              <button type="button" onClick={onOpenCart}
                title={`${cartUnits} unit${cartUnits === 1 ? '' : 's'} in cart`}
                className="rounded-full bg-[#C4763B] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#A85E2C]">
                Cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
            </li>
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
