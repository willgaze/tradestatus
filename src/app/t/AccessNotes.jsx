'use client'

import { useState } from 'react'

const DOORS = [
  { key: 'FRONT', label: 'Front' },
  { key: 'BACK', label: 'Back' },
  { key: 'SIDE', label: 'Side' },
]

/**
 * The customer telling the trade how to actually get to them.
 *
 * Every one of these is something that costs a real visit when it is missing:
 * a farm track with no house number, a gate that only opens from the inside, a
 * dog that needs shutting in the kitchen first, a van that cannot get past the
 * parked cars before nine.
 *
 * There is deliberately no field for a key safe code, and the page says so.
 * People will type one in if you let them, and this is a link sent by text.
 */
export default function AccessNotes({ status, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [door, setDoor] = useState(status.doorToUse || null)
  const [pets, setPets] = useState(Boolean(status.petsOnSite))
  const [w3w, setW3w] = useState(status.what3words || '')
  const [notes, setNotes] = useState(status.accessNotes || '')

  const anything = door || pets || w3w || notes

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      const r = await fetch(`/api/status/${status.code}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doorToUse: door, petsOnSite: pets, what3words: w3w, accessNotes: notes }),
      })
      if (r.ok) {
        const { notes: fresh } = await r.json()
        onSaved?.(fresh)
        setSaved(true); setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
        <div className="space-y-6">
          <div>
            <p className="text-[15px] font-semibold">Which door?</p>
            <div className="mt-2.5 flex gap-2">
              {DOORS.map((d) => (
                <button key={d.key} type="button"
                        onClick={() => setDoor(door === d.key ? null : d.key)}
                        className={`min-h-[46px] flex-1 rounded-2xl text-[16px] font-semibold transition-colors ${
                          door === d.key
                            ? 'bg-brand-600 text-white'
                            : 'bg-black/[.04] text-[color:var(--mts-text)] dark:bg-white/[.06]'
                        }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setPets((p) => !p)}
                  className="flex min-h-[52px] w-full items-center gap-3 text-left">
            <span className={`grid h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors ${
              pets ? 'bg-stage-done' : 'bg-black/[.12] dark:bg-white/20'}`}>
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                pets ? 'translate-x-5' : 'translate-x-0'}`} />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-semibold">There is a dog</span>
              <span className="block text-[14px] muted">So they knock rather than walk in</span>
            </span>
          </button>

          <label className="block">
            <span className="text-[15px] font-semibold">what3words</span>
            <span className="mt-0.5 block text-[14px] muted">
              For a track or a field gate with no number
            </span>
            <input type="text" value={w3w} onChange={(e) => setW3w(e.target.value)}
                   placeholder="///filled.count.soap" autoCapitalize="none" autoCorrect="off"
                   className="surface mt-2 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
          </label>

          <label className="block">
            <span className="text-[15px] font-semibold">Anything else?</span>
            <span className="mt-0.5 block text-[14px] muted">
              Parking, the gate, a sleeping baby — whatever saves them a phone call
            </span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={400}
                      placeholder="Park on the verge past the postbox. Gate sticks — lift it."
                      className="surface mt-2 w-full rounded-2xl border px-4 py-3 text-[16px] hairline" />
            <span className="mt-1 block text-right text-[12px] muted">{notes.length}/400</span>
          </label>

          <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-[14px]">
            Please do not put a key safe code here. This page opens from a link in a
            text message — tell them the code on the phone instead.
          </p>

          <button type="button" onClick={save} disabled={saving}
                  className="min-h-[54px] w-full rounded-2xl bg-brand-600 text-[17px] font-semibold text-white disabled:opacity-60">
            {saving ? 'Sending…' : 'Send this to them'}
          </button>
        </div>
  )
}
