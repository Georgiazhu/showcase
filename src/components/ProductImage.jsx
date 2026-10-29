import { useState } from 'react'

/**
 * 商品图片 —— 图片缺失时显示占位提示，避免出现大片空白。
 * 选中颜色后按该颜色的图切换（对齐 Kotis 的 .clickable-color-swatch 行为）。
 */
export default function ProductImage({ src, alt, onClick }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 bg-[#f2efe9] text-stone-400"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick()
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span className="px-3 text-center text-[11px] leading-tight">
          Image pending
          <span className="block text-[10px] text-stone-300">图片待上传</span>
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-[1.03]"
    />
  )
}
