'use client'

import { useState } from 'react'
import { KeyIcon, ChevronIcon } from '@/components/icons'

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
  const [open, setOpen] = useState(false)
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
        setOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="glass r-outer animate-rise mt-4" style={{ animationDelay: '200ms' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex min-h-[64px] w-full items-center gap-4 px-5 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
          <KeyIcon size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold">Help them find you</span>
          <span className="block text-[14px] muted">
            {anything ? 'Saved — tap to change' : 'Which door, parking, the dog'}
          </span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {saved && !open && (
        <p className="px-5 pb-5 text-[14px]" style={{ color: 'var(--stage-done)' }}>
          Sent. They will see it before they set off.
        </p>
      )}

      {open && (
        <div className="space-y-6 px-5 py-6"
             style={{ boxShadow: 'inset 0 1px 0 0 rgb(var(--glass-line) / var(--glass-line-alpha))' }}>
          <div>
            <p className="text-[15px] font-semibold">Which door?</p>
            <div className="mt-2.5 flex gap-2">
              {DOORS.map((d) => (
                <button key={d.key} type="button"
                        onClick={() => setDoor(door === d.key ? null : d.key)}
                        aria-pressed={door === d.key}
                        className="r-inner min-h-[48px] flex-1 text-[16px] font-semibold transition-colors"
                        style={door === d.key
                          ? { background: 'var(--tint)', color: '#fff' }
                          : { background: 'rgb(var(--glass-line) / 0.08)' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setPets((p) => !p)}
                  className="flex min-h-[52px] w-full items-center gap-3 text-left">
            <span className="grid h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors"
                  style={{ background: pets ? 'var(--stage-done)' : 'rgb(var(--glass-line) / 0.22)' }}>
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
                   className="r-inner mt-2 min-h-[50px] w-full px-4 text-[17px]"
                   style={{ background: 'rgb(var(--glass-line) / 0.08)', color: 'var(--mts-text)' }} />
          </label>

          <label className="block">
            <span className="text-[15px] font-semibold">Anything else?</span>
            <span className="mt-0.5 block text-[14px] muted">
              Parking, the gate, a sleeping baby — whatever saves them a phone call
            </span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={400}
                      placeholder="Park on the verge past the postbox. Gate sticks — lift it."
                      className="r-inner mt-2 w-full px-4 py-3 text-[17px]"
                      style={{ background: 'rgb(var(--glass-line) / 0.08)', color: 'var(--mts-text)' }} />
            <span className="mt-1 block text-right text-[12px] muted">{notes.length}/400</span>
          </label>

          <p className="r-inner px-4 py-3 text-[14px]"
             style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
            Please do not put a key safe code here. This page opens from a link in a
            text message — tell them the code on the phone instead.
          </p>

          <button type="button" onClick={save} disabled={saving} className="btn btn-filled w-full">
            {saving ? 'Sending…' : 'Send this to them'}
          </button>
        </div>
      )}
    </section>
  )
}
