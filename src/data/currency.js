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

/** '$1,234.50' style amount; symbol from currencySymbol(). */
export function formatMoney(amount, currency) {
  const n = Number(amount) || 0
  return `${currencySymbol(currency)}${n.toFixed(2)}`
}
