import { useCallback, useState } from 'react'
import ShowcaseNav from './components/ShowcaseNav.jsx'
import ShowcaseHeader from './components/ShowcaseHeader.jsx'
import ProductCard from './components/ProductCard.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import data from './data/showcase.json'

export default function App() {
  const [gallery, setGallery] = useState({ images: [], index: null })

  const openGallery = useCallback((images, index = 0) => {
    setGallery({ images: images || [], index })
  }, [])

  const closeGallery = useCallback(() => {
    setGallery({ images: [], index: null })
  }, [])

  const navigate = useCallback((index) => {
    setGallery((g) => ({ ...g, index }))
  }, [])

  const { meta, categories } = data
  const totalProducts = categories.reduce((n, c) => n + c.products.length, 0)

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
