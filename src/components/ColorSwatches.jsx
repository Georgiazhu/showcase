import { useState } from 'react'

const VISIBLE_LIMIT = 12

/**
 * Colour swatches — a row of colour dots.
 *
 * Each swatch is just the colour itself; the name is revealed on hover as a
 * tooltip above the dot, so a product with a dozen colours stays compact.
 * Clicking a swatch swaps the main image.
 */
export default function ColorSwatches({ colors = [], onSelect, activeIndex }) {
  const [expanded, setExpanded] = useState(false)
  if (!colors.length) return null

  const visible = expanded ? colors : colors.slice(0, VISIBLE_LIMIT)
  const hidden = colors.length - VISIBLE_LIMIT

  return (
    <div className="quote-details-info quote-color-swatches">
      <h4 className="mb-2 mt-3 text-[13px] font-bold text-stone-900">Colors</h4>

      <div className="quote-color-swatch flex flex-wrap items-center gap-2">
        {visible.map((c, i) => {
          const active = activeIndex === i
          const label = c.name || 'Unnamed'
          return (
            <span key={`${c.name || c.hex}-${i}`} className="group/color relative inline-flex">
              <button
                type="button"
                onClick={() => onSelect?.(c, i)}
                aria-label={label}
                aria-pressed={active}
                className={`block h-7 w-7 cursor-pointer rounded-full transition ${
                  active
                    ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-white'
                    : 'ring-1 ring-black/15 hover:ring-2 hover:ring-stone-500'
                }`}
                style={{ backgroundColor: c.hex || '#d6d3d1' }}
              />

              {/* Name on hover */}
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/color:opacity-100"
              >
                {label}
              </span>
            </span>
          )
        })}

        {hidden > 0 && (
          <button
            type="button"
            className="color-swatch-show-more ml-1"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '... show less' : `... show more (${hidden})`}
          </button>
        )}
      </div>
    </div>
  )
}
