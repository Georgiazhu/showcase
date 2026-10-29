import { useState } from 'react'

const VISIBLE_LIMIT = 8

/**
 * 颜色色板 —— 对齐 Kotis 的 .quote-color-swatches 行为：
 * 点击色板切换主图；颜色超过 8 个时折叠，提供 "... show more / show less"。
 */
export default function ColorSwatches({ colors = [], onSelect, activeColor }) {
  const [expanded, setExpanded] = useState(false)
  if (!colors.length) return null

  const visible = expanded ? colors : colors.slice(0, VISIBLE_LIMIT)
  const hidden = colors.length - VISIBLE_LIMIT

  return (
    <div className="quote-details-info quote-color-swatches">
      <h4 className="mb-1 mt-3 text-[13px] font-bold text-stone-900">Colors</h4>
      <div className="quote-color-swatch flex flex-wrap items-center gap-1.5">
        {visible.map((c, i) => {
          const active = activeColor === c.name
          return (
            <button
              key={`${c.name}-${i}`}
              type="button"
              onClick={() => onSelect?.(c)}
              title={c.name}
              className={`group/color flex items-center gap-1.5 rounded-full border px-2 py-1 text-[12px] transition ${
                active
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-300 bg-white text-stone-600 hover:border-stone-500'
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: c.hex || '#d6d3d1' }}
              />
              {c.name}
            </button>
          )
        })}
        {hidden > 0 && (
          <button
            type="button"
            className="color-swatch-show-more"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '... show less' : `... show more (${hidden})`}
          </button>
        )}
      </div>
    </div>
  )
}
