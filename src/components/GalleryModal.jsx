import { useEffect, useRef } from 'react'

/**
 * Image lightbox — mirrors Kotis QuoteModal:
 * Click the main image to open; ← → to navigate, Esc to close, click outside to dismiss.
 */
export default function GalleryModal({ images, index, onClose, onNavigate }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (index === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && images.length > 1) onNavigate((index - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight' && images.length > 1) onNavigate((index + 1) % images.length)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, images.length, onClose, onNavigate])

  if (index === null || !images?.length) return null

  const prev = () => onNavigate((index - 1 + images.length) % images.length)
  const next = () => onNavigate((index + 1) % images.length)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product image gallery"
    >
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close gallery"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="relative flex max-h-full max-w-4xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[index]}
          alt={`Product image ${index + 1} of ${images.length}`}
          className="max-h-[78vh] max-w-full rounded-lg bg-white object-contain shadow-2xl"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-[-12px] top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-lg transition hover:bg-white md:left-[-56px]"
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-[-12px] top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-lg transition hover:bg-white md:right-[-56px]"
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <div className="flex gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => onNavigate(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
