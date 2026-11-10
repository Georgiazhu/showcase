/**
 * Currency display helper.
 *
 * The admin console stores the currency as a symbol ('$', '¥', '€'), older data
 * and other sources may use ISO codes ('USD', 'CNY', 'EUR'). Accept both and
 * always return a symbol to print in front of an amount.
 */
const CODES = { USD: '$', CNY: '¥', RMB: '¥', JPY: '¥', EUR: '€', GBP: '£', HKD: 'HK$' }

export function currencySymbol(c) {
  const v = typeof c === 'string' ? c.trim() : ''
  if (!v) return '$'
  const code = CODES[v.toUpperCase()]
  if (code) return code
  // Already a symbol (e.g. '$', '¥', '€', 'HK$'): use as is.
  if (!/^[A-Za-z]{3}$/.test(v)) return v
  return `${v.toUpperCase()} `
}

/** Grouped amount with exactly 2 decimals: 85451 -> '85,451.00'. */
export function formatAmount(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/** '$1,234.50' style amount; symbol from currencySymbol(). */
export function formatMoney(amount, currency) {
  return `${currencySymbol(currency)}${formatAmount(amount)}`
}
