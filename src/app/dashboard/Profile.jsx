'use client'
import { VanIcon, ChevronIcon } from '@/components/icons'

import { useCallback, useEffect, useState } from 'react'

/**
 * Set up once, shown on every job from then on.
 *
 * The registration does the work: DVLA returns make and colour, so the trade
 * types a plate rather than describing their van. Without a DVLA key it falls
 * back to typing make and colour, which takes ten seconds once.
 */
export default function Profile() {
  const [open, setOpen] = useState(false)
  const [p, setP] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [looking, setLooking] = useState(false)
  const [lookupNote, setLookupNote] = useState(null)

  const load = useCallback(async () => {
    const r = await fetch('/api/dashboard/profile')
    if (r.ok) setP((await r.json()).profile || {})
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.value }))

  const lookup = async () => {
    if (!p.vehicleReg) return
    setLooking(true); setLookupNote(null)
    try {
      const r = await fetch('/api/dashboard/vehicle-lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg: p.vehicleReg }),
      })
      const v = await r.json()
      if (v.make || v.colour) {
        setP((x) => ({ ...x, vehicleMake: v.make || x.vehicleMake, vehicleColour: v.colour || x.vehicleColour }))
        setLookupNote(`Found it — ${[v.colour, v.make].filter(Boolean).join(' ')}. Add the model yourself.`)
      } else if (v.error === 'not_configured') {
        setLookupNote('No DVLA key set up yet — type the make and colour below.')
      } else if (v.error === 'not_found') {
        setLookupNote('DVLA does not know that plate. Type the make and colour below.')
      } else {
        setLookupNote('Lookup did not work. Type the make and colour below.')
      }
    } finally { setLooking(false) }
  }

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      const r = await fetch('/api/dashboard/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p),
      })
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); setOpen(false) }
    } finally { setSaving(false) }
  }

  const ready = p.engineerName || p.vehicleReg

  return (
    <section className="surface mt-8 rounded-4xl shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)}
              className="flex min-h-[64px] w-full items-center gap-4 px-6 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
          <VanIcon size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold">Who to expect</span>
          <span className="block text-[14px] muted">
            {ready
              ? [p.engineerName, [p.vehicleColour, p.vehicleMake].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
              : 'Your name and van — set up once'}
          </span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {saved && !open && <p className="px-6 pb-5 text-[14px] text-stage-done">Saved.</p>}

      {open && (
        <div className="space-y-5 border-t hairline px-6 py-6">
          <p className="text-[14px] muted">
            Shown to the customer only once you tap <strong>On my way</strong> — so they know
            who is at the door and which van is outside.
          </p>

          <Field label="Your name" hint="A first name is plenty"
                 value={p.engineerName || ''} onChange={set('engineerName')} placeholder="Will" />
          <Field label="One line about you" hint="Optional"
                 value={p.aboutLine || ''} onChange={set('aboutLine')}
                 placeholder="G3 qualified, 22 years on the tools" />

          <div>
            <label className="block text-[15px] font-semibold">Van registration</label>
            <p className="mt-0.5 text-[14px] muted">We look up the make and colour for you</p>
            <div className="mt-2 flex gap-2">
              <input value={p.vehicleReg || ''} onChange={set('vehicleReg')}
                     placeholder="AB12 CDE" autoCapitalize="characters" autoCorrect="off"
                     className="min-h-[50px] flex-1 rounded-2xl bg-[#f5d32a] px-4 text-center font-mono text-[18px] font-bold tracking-wider text-black placeholder:text-black/35" />
              <button type="button" onClick={lookup} disabled={looking || !p.vehicleReg}
                      className="min-h-[50px] shrink-0 rounded-2xl bg-brand-600 px-4 text-[15px] font-semibold text-white disabled:opacity-50">
                {looking ? '…' : 'Look up'}
              </button>
            </div>
            {lookupNote && <p className="mt-2 text-[14px] muted">{lookupNote}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Colour" value={p.vehicleColour || ''} onChange={set('vehicleColour')} placeholder="White" />
            <Field label="Make" value={p.vehicleMake || ''} onChange={set('vehicleMake')} placeholder="Ford" />
          </div>
          <Field label="Model" hint="DVLA does not hold this one" value={p.vehicleModel || ''}
                 onChange={set('vehicleModel')} placeholder="Transit Custom" />

          <Field label="Photo of you" hint="A link to an image — optional"
                 value={p.engineerPhoto || ''} onChange={set('engineerPhoto')} placeholder="https://…" />
          <Field label="Photo of the van" hint="Sign-written is best — they spot it from the window"
                 value={p.vehiclePhoto || ''} onChange={set('vehiclePhoto')} placeholder="https://…" />

          <button type="button" onClick={save} disabled={saving}
                  className="min-h-[54px] w-full rounded-2xl bg-brand-600 text-[17px] font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save — every job from now on'}
          </button>
        </div>
      )}
    </section>
  )
}

function Field({ label, hint, ...rest }) {
  return (
    <label className="block">
      <span className="text-[15px] font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-[14px] muted">{hint}</span>}
      <input {...rest} type="text"
             className="surface mt-2 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
    </label>
  )
}
