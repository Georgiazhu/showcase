import { useCallback, useEffect, useState } from 'react'
import ShowcaseNav from './components/ShowcaseNav.jsx'
import ShowcaseHeader from './components/ShowcaseHeader.jsx'
import ShowcaseLogin from './components/ShowcaseLogin.jsx'
import ProductCard from './components/ProductCard.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import { fetchShowcase } from './data/loadShowcase.js'
import { checkSession, logout } from './data/session.js'

export default function App() {
  const [gallery, setGallery] = useState({ images: [], index: null })
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  // 'checking' | 'anon' | 'authed'
  const [authState, setAuthState] = useState('checking')
  const [user, setUser] = useState(null)

  const loadContent = useCallback(async () => {
    try {
      const d = await fetchShowcase()
      setData(d)
      setLoadError(null)
    } catch (e) {
      if (e?.authRequired) {
        setAuthState('anon')
        setData(null)
        return
      }
      setLoadError(e?.message || 'Failed to load content')
    }
  }, [])

  // Check session on startup
  useEffect(() => {
    let alive = true
    checkSession().then(async (s) => {
      if (!alive) return
      if (s.authenticated) {
        setUser(s.user)
        setAuthState('authed')
        await loadContent()
      } else {
        setAuthState('anon')
      }
    })
    return () => {
      alive = false
    }
  }, [loadContent])

  const handleLogin = useCallback(
    async (user) => {
      setUser(user || null)
      setAuthState('authed')
      await loadContent()
    },
    [loadContent],
  )

  const handleLogout = useCallback(async () => {
    await logout()
    setData(null)
    setUser(null)
    setAuthState('anon')
  }, [])

  const openGallery = useCallback((images, index = 0) => {
    setGallery({ images: images || [], index })
  }, [])

  const closeGallery = useCallback(() => {
    setGallery({ images: [], index: null })
  }, [])

  const navigate = useCallback((index) => {
    setGallery((g) => ({ ...g, index }))
  }, [])

  // Checking session
  if (authState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Loading…</p>
      </div>
    )
  }

  // Not signed in — show only the login form, no showcase content
  if (authState === 'anon') {
    return <ShowcaseLogin onSuccess={handleLogin} />
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Showcase</p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-900">Failed to load</h1>
          <p className="mt-2 text-sm text-stone-500">{loadError}</p>
          <button
            onClick={loadContent}
            className="mt-5 rounded-full bg-stone-900 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-stone-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Loading…</p>
      </div>
    )
  }

  const { meta, categories } = data
  const totalProducts = categories.reduce((n, c) => n + (c.products?.length || 0), 0)

  // Count distinct images across every product — the hero shows this so the
  // figures always describe what is actually on the page.
  const totalImages = new Set()
  categories.forEach((c) => {
    ;(c.products || []).forEach((p) => {
      ;(p.gallery || []).forEach((u) => u && totalImages.add(u))
    })
  })
  const imageCount = totalImages.size

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ShowcaseNav categories={categories} user={user} onLogout={handleLogout} />

      <ShowcaseHeader
        meta={meta}
        productCount={totalProducts}
        categoryCount={categories.length}
        imageCount={imageCount}
      />

      {/* Disclaimer — a centred callout card rather than a full-bleed white bar */}
      <div className="bg-[#faf9f6]">
        <div className="mx-auto max-w-[1400px] px-5 pb-2 lg:px-10">
          <div className="mx-auto flex max-w-3xl items-start gap-3.5 rounded-xl border border-stone-200 bg-white/70 px-5 py-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e07a3a]/12 text-[#b7410e]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9.5" />
                <path d="M12 11v5M12 7.6v.4" />
              </svg>
            </span>
            <p className="disclaimer text-[12px] leading-relaxed text-stone-500">
              {meta?.disclaimer ||
                'All prices are indicative unit pricing in USD, of China VAT, excluding destination country taxes and duties, at stated MOQ. Production lead times are estimates in working days and exclude artwork approval, sampling and freight. Pricing and availability are subject to change without notice. For brand-sourced goods, quotations may fluctuate depending on the actual sourcing location, and we will adopt the globally tax-optimized solution. Our workflow: confirm products → finalize artwork → HRT approves samples → arrange production, with online ordering & inventory portal launched in parallel → warehouse intake inspection and issue inspection report.'}
            </p>
          </div>
        </div>
      </div>

      {/* Products — Kotis .showcase-products-wrapper */}
      <div className="showcase-products-wrapper mx-auto max-w-[1400px] px-5 pb-24 lg:px-10">
        {categories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-32 pt-14">
            <div className="quote-header-wrapper flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2>{category.name}</h2>
              <span className="rounded-full bg-stone-200/70 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-stone-600">
                {category.products?.length || 0} products
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} onOpenGallery={openGallery} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-[#eae4d9]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e07a3a] text-xs font-bold text-white">
              C
            </span>
            <span className="font-medium text-stone-900">Cyndi Global</span>
          </div>
          <p>
            {totalProducts} products · {categories.length} categories · {imageCount} photographs ·
            Swag &amp; Brand Management
          </p>
          <div className="flex gap-5">
            <a href="/showcase/" className="transition hover:text-stone-900">
              Showcase
            </a>
            <a href="/" className="transition hover:text-stone-900">
              Home
            </a>
            <a
              href="mailto:projects@cyndiglobal.com"
              className="transition hover:text-stone-900"
            >
              Contact
            </a>
            <a href="/admin/showcase.html" className="transition hover:text-stone-900">
              Edit
            </a>
          </div>
        </div>
      </footer>

      <GalleryModal
        images={gallery.images}
        index={gallery.index}
        onClose={closeGallery}
        onNavigate={navigate}
      />
    </div>
  )
}
