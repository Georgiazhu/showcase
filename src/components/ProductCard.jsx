import { useState } from 'react'
import ColorSwatches from './ColorSwatches.jsx'
import ProductImage from './ProductImage.jsx'

const cur = (c) => (c === 'CNY' ? '¥' : c === 'EUR' ? '€' : '$')

/**
 * Product card — mirrors the Kotis .quote-detail-wrapper structure:
 * Thumbnail (Start a Project reveals on hover) + name + sku + description + features
 * + Colors + Sizes + tiered pricing table + Price Includes + Additional Charges
 */
export default function ProductCard({ product, onOpenGallery }) {
  const [activeColor, setActiveColor] = useState(null)

  const gallery = product.gallery?.length ? product.gallery : product.image ? [product.image] : []
  const colorImages = product.colors?.find((c) => c.name === activeColor)?.image
  const mainImage = colorImages || product.image || gallery[0]

  const symbol = cur(product.currency || '$')
  const pricing = product.pricing || []
  const charges = product.additionalCharges || []

  return (
    <div className="quote-detail-wrapper mb-10">
      <div className="quote-detail-content h-full border border-stone-200 bg-white p-4 transition hover:border-stone-400">
        {/* Thumbnail + Start a Project revealed on hover */}
        <div className="quote-thumbnail-container pb-2 text-center">
          <div className="detail-wrapper">
            <button
              type="button"
              onClick={() => onOpenGallery?.(gallery, 0)}
              className="block w-full cursor-zoom-in overflow-hidden rounded-md bg-[#f2efe9]"
              aria-label={`View ${product.name} images`}
            >
              <ProductImage
                src={mainImage}
                alt={product.name}
                onClick={() => onOpenGallery?.(gallery, 0)}
              />
            </button>
          </div>

          <div className="start-project-link-container">
            <div className="start-project-link pt-3">
              <a
                href={`mailto:projects@cyndiglobal.com?subject=${encodeURIComponent(
                  `Start a Project — ${product.name} (${product.sku})`,
                )}`}
                className="inline-block rounded-full bg-[#e07a3a] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#b7410e]"
              >
                Start a Project
              </a>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="quote-details detail_view">
          <h5 className="quote-name-text mt-4 text-[15px] font-bold text-stone-900">{product.name}</h5>
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

          {product.materials && (
            <p className="mt-3 text-[12px] text-stone-500">
              <span className="font-bold text-stone-700">Materials:</span> {product.materials}
            </p>
          )}

          <ColorSwatches
            colors={product.colors}
            activeColor={activeColor}
            onSelect={(c) => setActiveColor(c.name === activeColor ? null : c.name)}
          />

          {product.sizes?.length > 0 && (
            <div className="quote-details-info">
              <h4 className="mb-1 mt-3 text-[13px] font-bold text-stone-900">Sizes</h4>
              <p className="text-[13px] text-stone-600">{product.sizes.join(' · ')}</p>
            </div>
          )}

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

          {charges.length > 0 && (
            <div className="quote-details-info">
              <h4 className="mb-1 mt-3 text-[13px] font-bold text-stone-900">Additional Charges</h4>
              <ul className="space-y-0.5">
                {charges.map((c, i) => (
                  <li key={i} className="flex justify-between text-[12px] text-stone-600">
                    <span>{c.label}</span>
                    <span className="font-medium text-stone-700">
                      {symbol}
                      {Number(c.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
