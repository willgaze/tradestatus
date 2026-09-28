'use client'

import { useState } from 'react'
import { PRESENCE, PRESENCE_ORDER, presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'

const TONE = {
  done:   'bg-stage-done/12 text-stage-done border-stage-done/25',
  onway:  'bg-stage-onway/12 text-stage-onway border-stage-onway/30',
  onsite: 'bg-stage-onsite/12 text-stage-onsite border-stage-onsite/25',
  paused: 'bg-stage-paused/12 text-stage-paused border-stage-paused/25',
}

/**
 * The customer answering the one question that costs a wasted visit.
 *
 * Front and centre, not buried with the access notes, because it is worth
 * something only if it is answered before someone sets off — and it goes
 * stale in hours, so it asks again rather than showing Tuesday's answer on
 * Thursday.
 */
export default function Presence({ status, onSaved }) {
  const [saving, setSaving] = useState(null)
  const [note, setNote] = useState(status.presenceNote || '')
  const [showNote, setShowNote] = useState(false)

  const current = presenceOf(status.presence)
  const fresh = presenceIsFresh(status.presenceAt)

  const send = async (presence, presenceNote = note) => {
    setSaving(presence)
    try {
      const r = await fetch(`/api/status/${status.code}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The access notes travel with it, so answering this does not wipe
          // what they told the trade about the gate.
          doorToUse: status.doorToUse, petsOnSite: status.petsOnSite,
          what3words: status.what3words, accessNotes: status.accessNotes,
          presence, presenceNote,
        }),
      })
      if (r.ok) { onSaved?.((await r.json()).notes); setShowNote(false) }
    } finally { setSaving(null) }
  }

  return (
    <section className="surface animate-rise mt-4 rounded-4xl p-6 shadow-card" style={{ animationDelay: '180ms' }}>
      <h2 className="text-[19px] font-semibold">Will someone be in?</h2>
      <p className="mt-1 text-[15px] muted">
        {current && fresh
          ? 'They can see your answer. Change it any time.'
          : 'Saves them a wasted trip — and you a second appointment.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {PRESENCE_ORDER.map((k) => {
          const p = PRESENCE[k]
          const on = current?.key === k && fresh
          return (
            <button key={k} type="button" onClick={() => send(k)} disabled={saving === k}
                    className={`min-h-[64px] rounded-2xl border px-3 text-[15px] font-semibold transition-colors disabled:opacity-60 ${
                      on ? TONE[p.tone] : 'border-transparent bg-black/[.04] dark:bg-white/[.06]'}`}>
              <span className="block text-[19px] leading-none">{p.icon}</span>
              <span className="mt-1.5 block">{p.label}</span>
            </button>
          )
        })}
      </div>

      {current && fresh && (
        <p className="mt-3 text-[14px] muted">Told them {presenceAgeLabel(status.presenceAt)}.</p>
      )}
      {current && !fresh && (
        <p className="mt-3 text-[14px] muted">
          You said “{current.short}” {presenceAgeLabel(status.presenceAt)} — tap again if that has changed.
        </p>
      )}

      {!showNote ? (
        <button type="button" onClick={() => setShowNote(true)}
                className="mt-4 min-h-[44px] text-[15px] font-medium text-brand-600">
          {status.presenceNote ? `“${status.presenceNote}” — change` : 'Add a detail'}
        </button>
      ) : (
        <div className="mt-4">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} autoFocus
                 placeholder="Bottom of the garden — ring twice"
                 className="surface min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
          <button type="button" onClick={() => send(current?.key || 'IN', note)}
                  className="mt-2.5 min-h-[50px] w-full rounded-2xl bg-brand-600 text-[16px] font-semibold text-white">
            Send it
          </button>
        </div>
      )}
    </section>
  )
}
