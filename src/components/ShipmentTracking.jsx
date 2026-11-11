import { formatPlacedAt, safeImageUrl, safeLinkUrl } from '../data/orders.js'

/**
 * Shipment tracking for one order (Requirement 5).
 *
 * `shipments` comes inside the order from /api/showcase/orders?orderNo=… and was
 * loaded server-side only after the ownership check. Text is rendered as React
 * children only; tracking links must be absolute http(s); photos must be the
 * same-origin, ownership-checked proxy. Renders nothing when there are none.
 */
const PHOTO_PREFIX = '/api/orders/shipment-photo?'

function photoUrl(url) {
  const v = safeImageUrl(url)
  return v.startsWith(PHOTO_PREFIX) ? v : ''
}

function pillClass(status) {
  if (status === 'delivered') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'exception') return 'border-red-200 bg-red-50 text-red-700'
  if (status === 'pending') return 'border-stone-200 bg-[#faf9f6] text-stone-600'
  return 'border-[#e07a3a]/30 bg-[#e07a3a]/10 text-[#b85a20]'
}

/** ETA is a plain YYYY-MM-DD date: show it without time-zone shifts. */
function formatEta(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  if (!m) return value || ''
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ShipmentCard({ s }) {
  const link = safeLinkUrl(s.trackingUrl)
  const events = Array.isArray(s.events) ? s.events : []
  const photos = (Array.isArray(s.photos) ? s.photos : [])
    .map((p) => ({ ...p, src: photoUrl(p.url) }))
    .filter((p) => p.src)
  const meta = [
    s.origin || s.destination ? ['Route', [s.origin, s.destination].filter(Boolean).join(' → ')] : null,
    s.packages != null ? ['Packages', String(s.packages)] : null,
    s.shippedAt ? ['Shipped', formatPlacedAt(s.shippedAt)] : null,
    s.eta ? ['ETA', formatEta(s.eta)] : null,
    s.deliveredAt ? ['Delivered', formatPlacedAt(s.deliveredAt)] : null,
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-stone-900">Shipment {s.index}</p>
          {(s.carrier || s.trackingNo) && (
            <p className="mt-0.5 break-words text-[12px] text-stone-500">
              {s.carrier}
              {s.carrier && s.trackingNo && ' · '}
              {s.trackingNo &&
                (link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#b85a20] underline underline-offset-2"
                  >
                    {s.trackingNo}
                  </a>
                ) : (
                  s.trackingNo
                ))}
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${pillClass(
            s.status,
          )}`}
        >
          {s.statusLabel || s.status}
        </span>
      </div>

      {meta.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">{k}</dt>
              <dd className="break-words text-[12px] text-stone-800">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {s.note && (
        <p className="mt-3 whitespace-pre-line break-words text-[13px] text-stone-700">{s.note}</p>
      )}

      {events.length > 0 && (
        <ol className="mt-4 space-y-3 border-l-2 border-stone-100 pl-4">
          {events.map((e, i) => (
            <li key={e.id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full ${
                  i === 0 ? 'bg-[#e07a3a] ring-4 ring-[#e07a3a]/20' : 'bg-stone-300'
                }`}
              />
              <p className="text-[11px] text-stone-400">
                {formatPlacedAt(e.time)}
                {e.statusLabel && <span className="ml-2 uppercase tracking-wide">{e.statusLabel}</span>}
              </p>
              <p
                className={`break-words text-[13px] ${i === 0 ? 'font-bold text-stone-900' : 'text-stone-700'}`}
              >
                {e.title}
              </p>
              {e.location && <p className="break-words text-[12px] text-stone-500">{e.location}</p>}
              {e.description && (
                <p className="whitespace-pre-line break-words text-[12px] text-stone-500">{e.description}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 print:hidden">
          {photos.map((p, i) => (
            <a
              key={p.id}
              href={p.src}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-stone-200"
            >
              <img
                src={p.src}
                alt={p.caption || `Shipment photo ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShipmentTracking({ shipments }) {
  if (!Array.isArray(shipments) || shipments.length === 0) return null
  return (
    <section aria-label="Shipment tracking">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">Shipment tracking</h3>
      <div className="mt-3 space-y-3">
        {shipments.map((s) => (
          <ShipmentCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  )
}
