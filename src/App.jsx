import { useCallback, useEffect, useMemo, useState } from 'react'
import ShowcaseNav from './components/ShowcaseNav.jsx'
import ShowcaseHeader from './components/ShowcaseHeader.jsx'
import ShowcaseLogin from './components/ShowcaseLogin.jsx'
import ProductCard from './components/ProductCard.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import CartView from './components/CartView.jsx'
import OrderView from './components/OrderView.jsx'
import { fetchShowcase } from './data/loadShowcase.js'
import { checkSession, logout } from './data/session.js'
import { addItem, loadCart, removeItem, saveCart, updateQuantity } from './data/cart.js'
import { fetchOrder, listOrders, placeOrder } from './data/orders.js'

export default function App() {
  const [gallery, setGallery] = useState({ images: [], index: null, title: '' })
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  // 'checking' | 'anon' | 'authed'
  const [authState, setAuthState] = useState('checking')
  const [user, setUser] = useState(null)

  const [cart, setCart] = useState([])
  // 'catalogue' | 'cart' | 'order'
  const [view, setView] = useState('catalogue')
  const [order, setOrder] = useState(null)
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState('')

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
        setCart(loadCart())
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
      setCart(loadCart())
      await loadContent()
    },
    [loadContent],
  )

  const handleLogout = useCallback(async () => {
    await logout()
    setData(null)
    setUser(null)
    setAuthState('anon')
    setCart([])
    setView('catalogue')
    setOrder(null)
    setHistory([])
  }, [])

  // Session expired mid-flow: drop back to the sign-in form (the cart stays in localStorage).
  const handleAuthLost = useCallback(() => {
    setData(null)
    setUser(null)
    setAuthState('anon')
    setView('catalogue')
    setOrder(null)
    setHistory([])
  }, [])

  const refreshHistory = useCallback(() => {
    listOrders()
      .then(setHistory)
      .catch((e) => {
        if (e?.authRequired) handleAuthLost()
      })
  }, [handleAuthLost])

  const openGallery = useCallback((images, index = 0, title = '') => {
    setGallery({ images: images || [], index, title })
  }, [])

  const closeGallery = useCallback(() => {
    setGallery({ images: [], index: null, title: '' })
  }, [])

  const navigate = useCallback((index) => {
    setGallery((g) => ({ ...g, index }))
  }, [])

  // ---- Cart -------------------------------------------------------------
  const persist = useCallback((items) => {
    setCart(items)
    saveCart(items)
  }, [])

  const handleAddToCart = useCallback(
    (item) => {
      persist(addItem(cart, item))
      setToast(`${item.name} added to cart`)
    },
    [cart, persist],
  )

  const handleQuantity = useCallback(
    (key, qty) => {
      persist(updateQuantity(cart, key, qty))
    },
    [cart, persist],
  )

  const handleRemove = useCallback(
    (key) => {
      persist(removeItem(cart, key))
    },
    [cart, persist],
  )

  // Places a real order on the server, which prices it. Throws on failure so
  // CartView can show the message; the cart is only cleared after success.
  const handleCheckout = useCallback(
    async (contact) => {
      let placed
      try {
        placed = await placeOrder(contact, cart)
      } catch (e) {
        if (e?.authRequired) handleAuthLost()
        throw e
      }
      setOrder(placed)
      persist([])
      setView('order')
      window.scrollTo({ top: 0, behavior: 'instant' })
      refreshHistory()
    },
    [cart, persist, handleAuthLost, refreshHistory],
  )

  const handleOpenOrder = useCallback(
    async (orderNo) => {
      try {
        const o = await fetchOrder(orderNo)
        setOrder(o)
        setView('order')
        window.scrollTo({ top: 0, behavior: 'instant' })
      } catch (e) {
        if (e?.authRequired) handleAuthLost()
        else setToast(e?.message || 'Could not load the order')
      }
    },
    [handleAuthLost],
  )

  // Toast auto-dismiss.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // ---- Catalogue lookups ------------------------------------------------
  const productsById = useMemo(() => {
    const map = {}
    ;(data?.categories || []).forEach((c) => {
      ;(c.products || []).forEach((p) => {
        map[p.id] = { ...p, categoryName: c.name }
      })
    })
    return map
  }, [data])

  // The badge counts distinct lines, not units - a 500-piece line is one line.
  const cartCount = cart.length
  const cartUnits = cart.reduce((n, i) => n + i.quantity, 0)

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

  const onCart = view === 'cart'
  const onOrder = view === 'order'

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ShowcaseNav
        categories={categories}
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
        cartUnits={cartUnits}
        onOpenCart={() => {
          setView('cart')
          window.scrollTo({ top: 0, behavior: 'instant' })
        }}
        onOpenCatalogue={() => {
          setView('catalogue')
          window.scrollTo({ top: 0, behavior: 'instant' })
        }}
        currentView={view}
      />

      {onOrder ? (
        <OrderView
          order={order}
          history={history}
          onOpenOrder={handleOpenOrder}
          productsById={productsById}
          onBack={() => {
            setView('catalogue')
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
          onPrint={() => window.print()}
        />
      ) : onCart ? (
        <CartView
          items={cart}
          meta={meta}
          productsById={productsById}
          onQuantity={handleQuantity}
          onRemove={handleRemove}
          onCheckout={handleCheckout}
          onBack={() => {
            setView('catalogue')
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        />
      ) : (
        <>
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
                    <ProductCard
                      key={product.id}
                      product={{ ...product, categoryName: category.name }}
                      onOpenGallery={openGallery}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

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
            <button
              type="button"
              onClick={() => {
                setView('catalogue')
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
              className="transition hover:text-stone-900"
            >
              Showcase
            </button>
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
        title={gallery.title}
        onClose={closeGallery}
        onNavigate={navigate}
      />

      {/* Added-to-cart toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2">
          <div className="rounded-full bg-stone-900 px-5 py-2.5 text-[13px] font-medium text-white shadow-xl">
            {toast}
            <button
              type="button"
              onClick={() => {
                setView('cart')
                setToast('')
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
              className="pointer-events-auto ml-3 text-[#f0b48a] underline underline-offset-2"
            >
              View cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
