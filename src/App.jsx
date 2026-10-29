import { useCallback, useEffect, useState } from 'react'
import ShowcaseNav from './components/ShowcaseNav.jsx'
import ShowcaseHeader from './components/ShowcaseHeader.jsx'
import ProductCard from './components/ProductCard.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import { fetchShowcase } from './data/loadShowcase.js'

export default function App() {
  const [gallery, setGallery] = useState({ images: [], index: null })
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchShowcase()
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e) => {
        if (alive) setLoadError(e?.message || '加载失败')
      })
    return () => {
      alive = false
    }
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

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Showcase</p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-900">内容加载失败</h1>
          <p className="mt-2 text-sm text-stone-500">{loadError}</p>
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

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <ShowcaseNav categories={categories} />

      <ShowcaseHeader meta={meta} />

      {/* 免责声明 —— Kotis 的 .showcase-disclaimer-section */}
      <div className="showcase-disclaimer-section bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-5 lg:px-10">
          <p className="disclaimer text-[12px] leading-relaxed text-stone-500">
            <strong className="font-semibold text-stone-700">All prices herein are pre-tax and pre-shipping unless otherwise noted, are considered confidential, and are valid for 30 days from receipt of quote.</strong>{' '}
            Pricing and availability are subject to change without notice.
          </p>
        </div>
      </div>

      {/* 商品区 —— Kotis 的 .showcase-products-wrapper */}
      <div className="showcase-products-wrapper mx-auto max-w-[1400px] px-5 pb-24 lg:px-10">
        {categories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-20 pt-12">
            <div className="quote-header-wrapper">
              <h2>{category.name}</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} onOpenGallery={openGallery} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 页脚 */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
              C
            </span>
            <span className="font-medium text-stone-900">Cyndi Global</span>
          </div>
          <p>
            {totalProducts} products · {categories.length} categories · Swag & Brand Management
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
              编辑
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
