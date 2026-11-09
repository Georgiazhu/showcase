import { useState } from 'react'
import AddToCartDialog from './AddToCartDialog.jsx'
import ColorSwatches from './ColorSwatches.jsx'
import ProductImage from './ProductImage.jsx'

const cur = (c) => (c === 'CNY' ? '¥' : c === 'EUR' ? '€' : '$')

/**
 * Product card — mirrors the Kotis .quote-detail-wrapper structure:
 * Thumbnail (Start a Project reveals on hover) + name + sku + description + features
 * + Colors + Sizes + tiered pricing table + Price Includes
 */
export default function ProductCard({ product, onOpenGallery, onAddToCart }) {
  // Identify the selected swatch by index: names may be blank, and two
  // swatches can share a name.
  const [activeIndex, setActiveIndex] = useState(null)
  const [adding, setAdding] = useState(false)

  const gallery = product.gallery?.length ? product.gallery : product.image ? [product.image] : []
  const colorImages = product.colors?.[activeIndex]?.image
  const mainImage = colorImages || product.image || gallery[0]

  const symbol = cur(product.currency || '$')
  const pricing = product.pricing || []

  return (
    <div className="quote-detail-wrapper mb-10">
      <div className="quote-detail-content h-full rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,31,58,0.04)] transition hover:border-stone-300 hover:shadow-[0_10px_28px_rgba(15,31,58,0.08)]">
        {/* Thumbnail + Start a Project revealed on hover */}
        <div className="quote-thumbnail-container pb-2 text-center">
          <div className="detail-wrapper relative overflow-hidden rounded-xl">
            <button
              type="button"
              onClick={() => onOpenGallery?.(gallery, 0)}
              className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#f2efe9]"
              aria-label={`View ${product.name} images`}
            >
              <ProductImage
                src={mainImage}
                alt={product.name}
                onClick={() => onOpenGallery?.(gallery, 0)}
              />
            </button>
            {gallery.length > 1 && (
              <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
                {gallery.length} photos
              </span>
            )}
          </div>

          <div className="start-project-link-container">
            <div className="start-project-link pt-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`mailto:projects@cyndiglobal.com?subject=${encodeURIComponent(
                    `Start a Project — ${product.name} (${product.sku})`,
                  )}`}
                  className="inline-block rounded-full bg-[#e07a3a] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#b7410e]"
                >
                  Start a Project
                </a>
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-[13px] font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="quote-details detail_view">
          <h5 className="quote-name-text mt-4 text-[15px] font-bold leading-snug text-stone-900">
            {product.name}
          </h5>
          <p className="quote-id-text text-[10px] text-stone-400">{product.sku}</p>

          {product.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{product.description}</p>
          )}

          {product.features?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {product.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-stone-600">
                  <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#e07a3a]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {product.spec && (
            <p className="mt-3 text-[12px] text-stone-500">
              <span className="font-bold text-stone-700">Spec:</span> {product.spec}
            </p>
          )}

          {(product.moq || product.leadTime) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {product.moq ? (
                <p className="text-[12px] text-stone-500">
                  <span className="font-bold text-stone-700">MOQ:</span> {product.moq} pcs
                </p>
              ) : null}
              {product.leadTime ? (
                <p className="text-[12px] text-stone-500">
                  <span className="font-bold text-stone-700">Lead time:</span> {product.leadTime} days
                </p>
              ) : null}
            </div>
          )}

          {product.materials && (
            <p className="mt-3 text-[12px] text-stone-500">
              <span className="font-bold text-stone-700">Materials:</span> {product.materials}
            </p>
          )}

          <ColorSwatches
            colors={product.colors}
            activeIndex={activeIndex}
            onSelect={(c, i) => setActiveIndex(i === activeIndex ? null : i)}
          />

          {(() => {
            // sizeChart may be an array (normal) or a single URL (legacy rows).
            const charts = Array.isArray(product.sizeChart)
              ? product.sizeChart.filter(Boolean)
              : product.sizeChart
                ? [product.sizeChart]
                : []
            if (!charts.length) return null
            const label = charts.length > 1 ? `Size Chart (${charts.length})` : 'Size Chart'
            const link = (
              <button
                type="button"
                onClick={() => onOpenGallery?.(charts, 0, 'Size Chart')}
                className="font-medium text-[#b7410e] underline underline-offset-2 transition hover:text-[#e07a3a]"
              >
                {label}
              </button>
            )
            return (
              <div className="quote-details-info">
                <h4 className="mb-1 mt-3 text-[13px] font-bold text-stone-900">Sizes</h4>
                <p className="text-[13px] text-stone-600">
                  {product.sizes?.length > 0 ? (
                    <>
                      {product.sizes.join(' · ')}
                      {' · '}
                      {link}
                    </>
                  ) : (
                    link
                  )}
                </p>
              </div>
            )
          })()}

          {pricing.length > 0 && (
            <table className="quantity-table mt-3">
              <tbody>
                {pricing.length === 1 ? (
                  <>
                    <tr>
                      <td>Quantity</td>
                      <td>{pricing[0].quantity}</td>
                    </tr>
                    <tr>
                      <td>Price</td>
                      <td>
                        {symbol}
                        {Number(pricing[0].price).toFixed(2)}
                      </td>
                    </tr>
                  </>
                ) : (
                  pricing.map((tier) => (
                    <tr key={tier.quantity}>
                      <td>Quantity</td>
                      <td>
                        {tier.quantity} — {symbol}
                        {Number(tier.price).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {product.priceIncludes && (
            <div className="quote-details-info">
              <h4 className="mb-1 mt-3 text-[13px] font-bold text-stone-900">Price Includes</h4>
              <p className="text-[12px] leading-relaxed text-stone-600">{product.priceIncludes}</p>
              {product.priceNotes?.map((n, i) => (
                <p key={i} className="text-[11px] italic text-stone-400">
                  {n}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {adding && (
        <AddToCartDialog
          product={product}
          onClose={() => setAdding(false)}
          onAdd={(item) => {
            onAddToCart?.(item)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
