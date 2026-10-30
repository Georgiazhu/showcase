/**
 * Showcase header — mirrors Kotis .showcase-header-content + .showcase-introduction-content:
 * SHOWCASE title + project name + date + recipients + linked jobs + disclaimer
 */
export default function ShowcaseHeader({ meta }) {
  return (
    <>
      <div className="showcase-header-content border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-10">
          <h2 className="text-[26px] font-bold tracking-[0.18em] text-stone-900">{meta.title}</h2>
        </div>
      </div>

      <div className="showcase-introduction-content border-b border-stone-200 bg-[#f2efe9]">
        <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10">
          <h3 className="text-2xl font-semibold tracking-tight text-stone-900 lg:text-[28px]">
            {meta.projectName}
          </h3>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
            <span>{meta.date}</span>
            {meta.recipients?.length > 0 && (
              <span className="showcase-contacts">
                To:{' '}
                <strong className="font-semibold text-stone-900">
                  {meta.recipients.map((r) => r.name).join(', ')}
                </strong>
              </span>
            )}
          </p>
          {meta.jobs?.length > 0 && (
            <p className="mt-1 text-sm text-stone-600">
              {meta.jobs.map((j) => (
                <span key={j.value}>
                  <strong className="font-semibold text-stone-900">{j.label}: </strong>
                  {j.value}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
