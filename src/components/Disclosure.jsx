'use client'

import { ChevronIcon } from '@/components/icons'

/**
 * A row that opens. The customer page is built from these below the status
 * card, so at rest it is a glance and a short list — not a scroll.
 *
 * `summary` does the work: it says the one thing worth knowing while the row
 * is closed ("Will · White Ford Transit", "You said: back shortly"), so most
 * rows never need opening at all.
 *
 * `icon` is a drawn icon, never an emoji — see src/components/icons.jsx. It
 * sits in a well that takes the tint from whatever `tone-*` wrapper the row is
 * inside, so a row belongs to the page it is on.
 */
export default function Disclosure({ icon, title, summary, open, onToggle, accent, children, delay }) {
  return (
    <section className="glass r-outer animate-rise overflow-hidden"
             style={delay ? { animationDelay: delay } : undefined}>
      {/* 54px, not 66. Seven of these stacked is the tallest thing on the page,
          and a row carrying one 19px line of text had 47px of air around it.
          The tap target stays well over the 44px iOS minimum. */}
      <button type="button" onClick={onToggle} aria-expanded={open}
              className="flex min-h-[54px] w-full items-center gap-3.5 px-4 py-2.5 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px]"
              style={accent
                ? { color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }
                : { background: 'rgb(var(--glass-line) / 0.09)' }}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold leading-tight">{title}</span>
          {summary && (
            <span className="mt-px block truncate text-[13px] leading-snug"
                  style={accent ? { color: 'var(--tint)', fontWeight: 500 } : { color: 'var(--label-2)' }}>
              {summary}
            </span>
          )}
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-5 pt-4"
             style={{ boxShadow: 'inset 0 1px 0 0 rgb(var(--glass-line) / var(--glass-line-alpha))' }}>
          {children}
        </div>
      )}
    </section>
  )
}
