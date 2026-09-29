'use client'
import { ChevronIcon } from '@/components/icons'

import { useState } from 'react'
import { CHANGELOG, VERSION, THEMES, THEME_INDEX } from '@/lib/version'

/** What changed and when, so a nightly build is something you can check. */
export default function Changelog() {
  const [open, setOpen] = useState(false)
  const t = THEMES[THEME_INDEX % THEMES.length]

  return (
    <section className="glass mt-4 r-outer">
      <button type="button" onClick={() => setOpen((o) => !o)}
              className="flex min-h-[64px] w-full items-center gap-4 px-6 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center r-inner text-[15px] font-bold text-white"
              style={{ background: t.accent }}>
          {VERSION.split('.').slice(0, 2).join('.')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold">Version {VERSION}</span>
          <span className="block text-[14px] muted">{t.name} — what changed and when</span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="border-t hairline px-6 py-5">
          {CHANGELOG.map((rel) => (
            <div key={rel.version} className="border-b hairline py-4 first:pt-0 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[16px] font-semibold">v{rel.version}</p>
                <p className="text-[13px] muted">{rel.date}</p>
              </div>
              <ul className="mt-2 space-y-1">
                {rel.notes.map((n) => (
                  <li key={n} className="flex gap-2 text-[15px]">
                    <span className="muted">·</span><span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
