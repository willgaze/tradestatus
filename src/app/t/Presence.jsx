'use client'

import { useState } from 'react'
import { PRESENCE, PRESENCE_ORDER, presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import { PresenceIcon } from '@/components/icons'

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
    <section className="glass r-outer animate-rise mt-4 p-5" style={{ animationDelay: '180ms' }}>
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
            // Each answer wears its own tone when chosen, so a glance at the
            // card says which one is set without reading it.
            <button key={k} type="button" onClick={() => send(k)} disabled={saving === k}
                    aria-pressed={on}
                    className={`tone-${p.tone} r-inner flex min-h-[72px] flex-col items-center justify-center gap-1.5 px-3 text-[15px] font-semibold transition-colors disabled:opacity-60`}
                    style={on
                      ? { background: 'color-mix(in srgb, var(--tint) 14%, transparent)',
                          color: 'var(--tint)',
                          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--tint) 30%, transparent)' }
                      : { background: 'rgb(var(--glass-line) / 0.08)' }}>
              <PresenceIcon presence={k} size={21} />
              <span className="block leading-tight">{p.label}</span>
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
                className="mt-4 min-h-[44px] text-[15px] font-medium" style={{ color: 'var(--tint)' }}>
          {status.presenceNote ? `“${status.presenceNote}” — change` : 'Add a detail'}
        </button>
      ) : (
        <div className="mt-4">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} autoFocus
                 placeholder="Bottom of the garden — ring twice"
                 className="r-inner min-h-[50px] w-full px-4 text-[17px]"
                 style={{ background: 'rgb(var(--glass-line) / 0.08)', color: 'var(--mts-text)' }} />
          <button type="button" onClick={() => send(current?.key || 'IN', note)}
                  className="btn btn-filled mt-2.5 w-full">
            Send it
          </button>
        </div>
      )}
    </section>
  )
}
