'use client'

import { useCallback, useEffect, useState } from 'react'
import { TickIcon, ChevronIcon } from '@/components/icons'
import { termsFrom, termsParagraphs, termsSummary } from '@/lib/terms'
import { TRADE_NAME } from '@/lib/trade'

/**
 * Booking terms: two numbers, set once, and a preview of the exact words
 * every customer reads on their page before the visit.
 *
 * The fee is STATED by the page and agreed by a tap; TurnUp never takes it,
 * never adds it to anything and never decides it is owed. A charge the
 * customer did not agree to before the day is one the trade cannot keep (CRA
 * 2015, Schedule 2), which is the whole reason the words and the tap exist.
 */
const first = TRADE_NAME.split(' ')[0]
const NOTICE = [[12, '12 hours'], [24, '24 hours'], [48, '48 hours'], [72, '3 days']]

export default function Terms() {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(24)
  const [fee, setFee] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/dashboard/profile')
    if (!r.ok) return
    const t = termsFrom((await r.json()).profile)
    setHours(t.noticeHours); setFee(t.fee ? String(t.fee) : ''); setLoaded(true)
  }, [])
  useEffect(() => { load() }, [load])

  const terms = { noticeHours: hours, fee: fee === '' ? null : Number(fee) || null }

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      const r = await fetch('/api/dashboard/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeHours: hours, shortNoticeFee: terms.fee }),
      })
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); setOpen(false) }
    } finally { setSaving(false) }
  }

  return (
    <section className="glass r-outer mt-8">
      <button type="button" onClick={() => setOpen((o) => !o)}
              className="flex min-h-[64px] w-full items-center gap-4 px-6 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center r-inner"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
          <TickIcon size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold">Booking terms</span>
          <span className="block text-[14px] muted">{loaded ? termsSummary(terms) : 'Notice, any short-notice charge, the right to cancel'}</span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {saved && !open && <p className="px-6 pb-5 text-[14px] text-stage-done">Saved. Every page from now shows the new words; jobs already agreed keep the old ones.</p>}

      {open && (
        <div className="space-y-5 border-t hairline px-6 py-6">
          <p className="text-[14px] muted">
            Every customer reads these on their page under <strong>Before the visit</strong> and taps
            <strong> Got it, go ahead</strong>. The tap is recorded with the time and the exact words, and
            the card says whether it has happened. A short-notice charge only holds if they agreed it before
            the day; TurnUp states it and records the agreement, and never takes a penny itself.
          </p>

          <div>
            <span className="block text-[15px] font-semibold">Notice you ask for</span>
            <span className="mt-0.5 block text-[14px] muted">To move or cancel without charge</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {NOTICE.map(([h, label]) => (
                <button key={h} type="button" onClick={() => setHours(h)} aria-pressed={hours === h}
                        className={`btn !min-h-[42px] !px-4 !text-[14px] ${hours === h ? 'accent-fill' : 'btn-grey'}`}>{label}</button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[15px] font-semibold">Short-notice charge</span>
            <span className="mt-0.5 block text-[14px] muted">
              For less notice than that, or nobody in. Whole pounds; leave it empty and the page says nothing is charged.
              Keep it to what the lost slot actually costs you — a fee that reads as a penalty is not enforceable.
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[18px] font-semibold muted">£</span>
              <input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                     inputMode="numeric" placeholder="none" className="field !mt-0 max-w-[140px]" />
            </div>
          </label>

          <div className="r-inner px-4 py-4" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
            <p className="text-[13px] font-semibold uppercase tracking-wide muted">What they read</p>
            <dl className="mt-3 space-y-3.5">
              {termsParagraphs(terms, first).map((p) => (
                <div key={p.key}>
                  <dt className="text-[15px] font-semibold">{p.head}</dt>
                  <dd className="mt-0.5 text-[14px] leading-snug muted">{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <button type="button" onClick={save} disabled={saving} className="btn accent-fill w-full">
            {saving ? 'Saving…' : 'Save terms'}
          </button>
        </div>
      )}
    </section>
  )
}
