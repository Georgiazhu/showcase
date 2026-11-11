/**
 * Order status display — the one place the showcase knows about statuses.
 *
 * Values mirror the main site's canonical enum (functions/_lib/order-status.js);
 * only the LABELS here are customer-friendly wording for the Showcase (the
 * status values and the backend enum are unchanged). The progress steps and the
 * alias mapping mirror the shop's OrderConfirmation.jsx. Unknown / legacy values
 * are shown as their raw text in a neutral badge.
 */
export const STATUS_LABELS = {
  pending: 'Order received',
  processing: 'Preparing',
  shipped: 'Dispatched',
  in_transit: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Progress bar steps (cancelled is not a step; it is shown separately).
export const STATUS_STEPS = ['pending', 'processing', 'shipped', 'in_transit', 'delivered']

// Legacy values the shop also maps onto a step.
const STEP_ALIAS = {
  received: 'pending',
  confirmed: 'processing',
  producing: 'processing',
  completed: 'delivered',
}

// Badge colours per status (Tailwind classes, stone palette + accent).
const BADGE_CLASSES = {
  pending: 'border-stone-300 bg-stone-100 text-stone-700',
  processing: 'border-[#e07a3a]/40 bg-[#e07a3a]/10 text-[#b7410e]',
  shipped: 'border-sky-200 bg-sky-50 text-sky-800',
  in_transit: 'border-sky-200 bg-sky-50 text-sky-800',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
}
const NEUTRAL_BADGE = 'border-stone-300 bg-white text-stone-600'

function norm(status) {
  return typeof status === 'string' ? status.trim().toLowerCase() : ''
}

/** Known status key after alias mapping, or null when unknown. */
export function statusKey(status) {
  const s = norm(status)
  const k = STEP_ALIAS[s] || s
  return Object.prototype.hasOwnProperty.call(STATUS_LABELS, k) ? k : null
}

/** Human label; unknown values fall back to their raw text. */
export function statusLabel(status) {
  const k = statusKey(status)
  if (k) return STATUS_LABELS[k]
  return status == null || status === '' ? 'Unknown' : String(status)
}

export function statusBadgeClass(status) {
  const k = statusKey(status)
  return (k && BADGE_CLASSES[k]) || NEUTRAL_BADGE
}

/** Index in STATUS_STEPS, or -1 for cancelled / unknown. */
export function statusStepIndex(status) {
  const k = statusKey(status)
  return k ? STATUS_STEPS.indexOf(k) : -1
}

export function isCancelled(status) {
  return statusKey(status) === 'cancelled'
}
