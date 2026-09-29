'use client'

/**
 * A row that opens. The customer page is built from these below the status
 * card, so at rest it is a glance and a short list — not a scroll.
 *
 * `summary` does the work: it says the one thing worth knowing while the row
 * is closed ("Will · White Ford Transit", "You said: back shortly"), so most
 * rows never need opening at all.
 */
export default function Disclosure({ icon, title, summary, open, onToggle, accent, children, delay }) {
  return (
    <section className="surface animate-rise overflow-hidden rounded-4xl shadow-card"
             style={delay ? { animationDelay: delay } : undefined}>
      <button type="button" onClick={onToggle} aria-expanded={open}
              className="flex min-h-[64px] w-full items-center gap-4 px-5 text-left">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[20px] ${
          accent ? 'bg-brand-600/12' : 'bg-black/[.045] dark:bg-white/[.06]'}`}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold leading-tight">{title}</span>
          {summary && (
            <span className={`mt-0.5 block truncate text-[14px] ${accent ? 'font-medium text-brand-600' : 'muted'}`}>
              {summary}
            </span>
          )}
        </span>
        <span className={`muted shrink-0 text-[20px] leading-none transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
      {open && <div className="border-t hairline px-5 pb-5 pt-4">{children}</div>}
    </section>
  )
}
