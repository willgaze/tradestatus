'use client'

import { useCallback, useEffect, useState } from 'react'
import { PHASES, STATE } from '@/lib/roadmap'

const TONE = {
  done:   'bg-stage-done/12 text-stage-done',
  onsite: 'bg-stage-onsite/12 text-stage-onsite',
  booked: 'bg-black/[.06] muted dark:bg-white/[.08]',
}

/**
 * Everything this could be, with a way to say which bits are actually wanted.
 *
 * The honesty rule from the customer-facing copy applies here too: nothing
 * claims to work when it does not. 'Live' works today, 'Ready' is built and
 * waiting on a certificate or a key, 'Not built' is exactly that.
 */
export default function Roadmap() {
  const [open, setOpen] = useState(false)
  const [interest, setInterest] = useState({})
  const [noteFor, setNoteFor] = useState(null)
  const [noteText, setNoteText] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/dashboard/roadmap')
    if (r.ok) setInterest((await r.json()).interest || {})
  }, [])
  useEffect(() => { if (open) load() }, [open, load])

  const save = async (key, wanted, note) => {
    setInterest((i) => ({ ...i, [key]: { ...i[key], wanted, note } }))
    await fetch('/api/dashboard/roadmap', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, wanted, note }),
    })
  }

  const wantedCount = Object.values(interest).filter((i) => i?.wanted).length

  return (
    <section className="surface mt-4 rounded-4xl shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)}
              className="flex min-h-[64px] w-full items-center gap-4 px-6 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-[20px] dark:bg-white/5">🗺️</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold">What this could become</span>
          <span className="block text-[14px] muted">
            {wantedCount ? `${wantedCount} marked as wanted` : 'Mark the ones you would actually use'}
          </span>
        </span>
        <span className={`muted text-[20px] leading-none transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>

      {open && (
        <div className="border-t hairline">
          {PHASES.map((phase) => (
            <div key={phase.id} className="border-b hairline px-6 py-6 last:border-0">
              <h3 className="text-[17px] font-semibold">{phase.title}</h3>
              <p className="mt-0.5 text-[14px] muted">{phase.blurb}</p>

              <ul className="mt-4 space-y-2.5">
                {phase.items.map((item) => {
                  const st = STATE[item.state]
                  const mine = interest[item.key]
                  const isLive = item.state === 'live'
                  return (
                    <li key={item.key} className="rounded-2xl bg-black/[.03] p-4 dark:bg-white/[.04]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold">{item.name}</p>
                          <p className="mt-0.5 text-[14px] muted">{item.what}</p>
                          {item.needs && (
                            <p className="mt-1.5 text-[13px] text-stage-paused">Needs: {item.needs}</p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE[st.tone]}`}>
                          {st.label}
                        </span>
                      </div>

                      {!isLive && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button type="button"
                                  onClick={() => save(item.key, !mine?.wanted, mine?.note)}
                                  className={`min-h-[40px] rounded-xl px-3.5 text-[14px] font-semibold transition-colors ${
                                    mine?.wanted ? 'bg-stage-done text-white' : 'bg-black/[.06] dark:bg-white/[.08]'}`}>
                            {mine?.wanted ? '✓ Want this' : 'Would use this'}
                          </button>
                          <button type="button"
                                  onClick={() => { setNoteFor(noteFor === item.key ? null : item.key); setNoteText(mine?.note || '') }}
                                  className="min-h-[40px] px-2 text-[14px] muted">
                            {mine?.note ? 'Edit note' : 'Add a note'}
                          </button>
                        </div>
                      )}

                      {mine?.note && noteFor !== item.key && (
                        <p className="mt-2 text-[14px] italic muted">“{mine.note}”</p>
                      )}

                      {noteFor === item.key && (
                        <div className="mt-2.5">
                          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} maxLength={300}
                                    placeholder="Only worth it if it also…"
                                    className="surface w-full rounded-xl border px-3 py-2 text-[15px] hairline" />
                          <button type="button"
                                  onClick={() => { save(item.key, mine?.wanted ?? true, noteText); setNoteFor(null) }}
                                  className="mt-2 min-h-[40px] rounded-xl bg-brand-600 px-4 text-[14px] font-semibold text-white">
                            Save note
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
