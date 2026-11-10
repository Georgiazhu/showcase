import {
  STATUS_LABELS,
  STATUS_STEPS,
  isCancelled,
  statusBadgeClass,
  statusKey,
  statusLabel,
  statusStepIndex,
} from '../data/orderStatus.js'

/** Small pill showing an order's status; unknown values render as a neutral badge. */
export function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(
        status,
      )} ${className}`}
    >
      {statusLabel(status)}
    </span>
  )
}

/**
 * Status progress bar — same steps and labels as the shop's order page
 * (pending → processing → shipped → in transit → delivered). Cancelled orders
 * get a distinct notice instead; unknown statuses get a neutral note.
 */
export function StatusProgress({ status }) {
  if (isCancelled(status)) {
    return (
      <div
        role="status"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
      >
        <span className="font-bold">Cancelled.</span> This order has been cancelled and will not be
        processed further.
      </div>
    )
  }
  if (!statusKey(status)) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#faf9f6] px-4 py-3 text-[13px] text-stone-600">
        Current status: <StatusBadge status={status} />
      </div>
    )
  }

  const current = statusStepIndex(status)
  return (
    <ol
      className="flex items-start justify-between"
      aria-label={`Order status: ${statusLabel(status)}, step ${current + 1} of ${STATUS_STEPS.length}`}
    >
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= current
        return (
          <li
            key={step}
            className="relative flex flex-1 flex-col items-center"
            aria-current={idx === current ? 'step' : undefined}
          >
            {idx > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[5px] h-0.5 w-full ${done ? 'bg-[#e07a3a]' : 'bg-stone-200'}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 h-3 w-3 rounded-full ${
                idx === current
                  ? 'bg-[#e07a3a] ring-4 ring-[#e07a3a]/20'
                  : done
                    ? 'bg-[#e07a3a]'
                    : 'bg-stone-300'
              }`}
            />
            <span
              className={`mt-2 text-center text-[10px] font-medium uppercase tracking-wide sm:text-[11px] ${
                done ? 'text-stone-900' : 'text-stone-400'
              }`}
            >
              {STATUS_LABELS[step]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
