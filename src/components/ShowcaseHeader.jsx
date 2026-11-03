/**
 * Showcase hero — a single centred masthead.
 *
 * Previously this was two stacked bars (a white "SHOWCASE" strip on top of a
 * cream "introduction" strip) with the date / recipient / programme metadata
 * left-aligned and reading like a form. It is now one centred block on the
 * brand navy: the word "SHOWCASE" becomes an eyebrow above the project name,
 * and the metadata is presented as a row of stat chips.
 *
 * The item count is derived from the data that was actually loaded rather than
 * from the copy in `meta.jobs`, so it can never drift out of sync when
 * products are added or removed in the admin console.
 */
export default function ShowcaseHeader({ meta, productCount, categoryCount, imageCount }) {
  const recipients = (meta?.recipients || []).map((r) => r.name).join(', ')

  // The stored subtitle repeats the project name ("Cyndi Global — 2027 Campus
  // Shortlist"), so it would just print the H1 a second time. Use it only when
  // it says something different, otherwise fall back to a positioning line.
  const storedSubtitle = meta?.subtitle
  const subtitle =
    storedSubtitle && !storedSubtitle.includes(meta?.projectName)
      ? storedSubtitle
      : 'Curated swag and brand merchandise proposals prepared by Cyndi Global.'
  const stats = [
    { label: 'Date', value: meta?.date },
    { label: 'Prepared for', value: recipients },
    { label: 'Items', value: `${productCount} shortlisted products` },
    { label: 'Categories', value: `${categoryCount} categories` },
    { label: 'Imagery', value: `${imageCount} photographs` },
  ].filter((s) => s.value)

  return (
    <section className="relative overflow-hidden bg-[#0f1f3a]">
      {/* Brand glow — warm orange bleeding into the navy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_-20%,rgba(224,122,58,0.22),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 py-14 text-center lg:px-10 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#f5a66e]">
          {meta?.title || 'Showcase'}
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
          {meta?.projectName}
        </h1>

        {/* The stored subtitle repeats the project name, so it is only shown
            when it actually adds something. */}
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
          {subtitle}
        </p>

        {/* Metadata as centred stat chips */}
        <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-center"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {s.label}
              </dt>
              <dd className="mt-1 text-[13px] font-semibold leading-snug text-white">{s.value}</dd>
            </div>
          ))}
        </dl>      </div>
    </section>
  )
}
