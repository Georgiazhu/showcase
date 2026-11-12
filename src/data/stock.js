/**
 * Customer-visible stock (GET /api/showcase adds `stock: [{colorId, size, available}]` to
 * tracked products only). A variant without a stock row is untracked: unlimited, made to
 * order, and shows no stock text. Mirrors the server mapping in functions/_lib/inventory.js:
 * the key is (colour id, size), with '' for a product that has no colours / no sizes.
 */

export function isTracked(product) {
  return Array.isArray(product?.stock) && product.stock.length > 0
}

/** `available` for the chosen variant, or null when it is untracked / not fully chosen. */
export function variantStock(product, colorIndex, size) {
  if (!isTracked(product)) return null
  const colors = product.colors || []
  const sizes = product.sizes || []
  const colorId = colors.length ? (colorIndex != null ? colors[colorIndex]?.id ?? null : null) : ''
  const sizeKey = sizes.length ? size ?? null : ''
  if (colorId === null || sizeKey === null) return null
  const row = product.stock.find((s) => s.colorId === colorId && s.size === sizeKey)
  return row ? Math.max(0, Number(row.available) || 0) : null
}

/** True iff every size of that colour is tracked and has nothing available. */
export function colourOutOfStock(product, colorIndex) {
  if (!isTracked(product)) return false
  const sizes = product.sizes || []
  const list = sizes.length ? sizes : [null]
  return list.every((s) => variantStock(product, colorIndex, s) === 0)
}

/** True iff every colour × size cell is tracked and has nothing available. */
export function productOutOfStock(product) {
  if (!isTracked(product)) return false
  const colors = product.colors || []
  const indexes = colors.length ? colors.map((_, i) => i) : [null]
  return indexes.every((i) => colourOutOfStock(product, i))
}
