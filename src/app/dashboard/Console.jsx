'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { STAGES, stageOf } from '@/lib/trade-status'
import Passkeys from './Passkeys'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import Changelog from './Changelog'
import Profile from './Profile'
import WalletShowcase from './WalletShowcase'
import WaitlistPanel from './WaitlistPanel'
import Roadmap from './Roadmap'
import ServiceM8 from './ServiceM8'
import { presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import { mapsDirectionsUrl, w3wUrl } from '@/lib/places'
import DropPin from '@/components/DropPin'
import FindWords from '@/components/FindWords'
import { windowSummary, windowHours } from '@/lib/window'
import { TickIcon } from '@/components/icons'
import { DB_REASONS } from '@/lib/db-errors'
import { StageIcon, PresenceIcon, CopyIcon, EyeIcon, MessageIcon, LinkOffIcon, CompassIcon, KeyIcon, PinIcon, PlusIcon, ChevronIcon } from '@/components/icons'

// The API answers a failure with a reason code rather than a status number,
// because "503" tells the one person who can fix this nothing. Whoever is
// looking at this screen is the person who sets DATABASE_URL and runs the
// migration, so say which of those is missing.
async function failure(response, fallback) {
  let reason = null
  try { reason = (await response.json())?.error } catch { /* no body */ }
  const known = DB_REASONS[reason]
  if (known) return { title: known.title, fix: known.fix }
  if (response.status === 401) return { title: 'Signed out', fix: 'Sign in again to carry on.' }
  return { title: fallback, fix: null }
}

// Built for a phone held in one hand on a driveway: the stage buttons are the
// whole point, and they are the biggest thing on the row.
const STAGE_BUTTONS = ['BOOKED', 'ON_MY_WAY', 'ON_SITE', 'PAUSED', 'DONE']
// customerPhone belongs here even though nothing sets it initially: the form
// renders an input bound to form.customerPhone, and a value of undefined makes
// React treat it as uncontrolled and then complain the moment it is typed in.
const EMPTY = { sm8JobNumber: '', customerName: '', customerPhone: '', jobSummary: '', jobAddress: '', jobRef: '', scheduledFor: '' }

export default function Console() {
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)
  // One job open at a time, and the new-job form shut until it is wanted.
  // Everything on this screen used to be open at once: five jobs came to
  // 7,826px, nine and a quarter screens, with a 663px empty form on top of
  // the work. A trade standing on a driveway scrolled a full screen per job
  // to reach the one they were at.
  const [openJob, setOpenJob] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard/trackers', { cache: 'no-store' })
      if (!r.ok) return setError(await failure(r, 'Could not load jobs'))
      setTrackers((await r.json()).trackers || [])
      setError(null)
    } catch {
      setError({ title: 'Could not reach the server', fix: 'Check your connection and try again.' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/dashboard/trackers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (!r.ok) return setError(await failure(r, 'Could not create the link'))
      setForm(EMPTY)
      setShowForm(false)
      await load()
    } catch {
      setError({ title: 'Could not create the link', fix: 'Check your connection and try again.' })
    } finally { setSaving(false) }
  }

  const patch = async (id, body) => {
    // Optimistic: signal is patchy in a van, and a button that does nothing for
    // three seconds gets pressed four times.
    setTrackers((rows) => rows.map((r) => (r.id === id ? { ...r, ...body } : r)))
    try {
      const r = await fetch(`/api/dashboard/trackers/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!r.ok) setError(await failure(r, 'Update failed'))
    } catch {
      setError({ title: 'Update failed', fix: 'Check your connection and try again.' })
    } finally { await load() }
  }

  const revoke = async (id) => {
    try {
      const r = await fetch(`/api/dashboard/trackers/${id}`, { method: 'DELETE' })
      if (!r.ok) return setError(await failure(r, 'Could not switch that link off'))
      await load()
    } catch {
      setError({ title: 'Could not switch that link off', fix: 'Check your connection and try again.' })
    }
  }

  // Read after mount: window does not exist during the server render.
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])

  // "Mrs Hale".split(' ')[0] is "Mrs", and "Hi Mrs —" is worse than no name at
  // all. If the first word is a title, keep the whole thing.
  const TITLES = /^(mr|mrs|ms|miss|mx|dr|prof|rev|sir|lady|lord)\.?$/i
  const greetingName = (full) => {
    if (!full) return ''
    const parts = full.trim().split(/\s+/)
    return TITLES.test(parts[0]) ? parts.slice(0, 2).join(' ') : parts[0]
  }

  // One tap: open the phone's own Messages app with the recipient and the whole
  // message already written, so the job is send rather than copy, switch app,
  // paste, and think of something to type while standing in the rain.
  //
  // `sms:<number>?&body=` is the spelling that works on both: iOS wants the
  // separator to be `&`, Android wants `?`, and `?&` satisfies each of them.
  // With no number stored it still opens Messages with the text ready and lets
  // him pick the contact.
  const smsHref = (t) => {
    const link = `${origin}/t/${t.code}`
    const who = greetingName(t.customerName)
    const name = who ? ` ${who}` : ''
    const body =
      `Hi${name} — you can see where your job is up to here: ${link} ` +
      `It updates through the day so you are not left guessing.`
    return `sms:${(t.customerPhone || '').replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(body)}`
  }

  // WhatsApp's click-to-chat link: opens the app with the number and the
  // message written, same as the sms: button. It wants the number in
  // international form with no plus and no leading zero, so a UK mobile
  // typed as 07700 900123 becomes 447700900123. With no number it still
  // opens WhatsApp with the text ready and lets him pick the contact.
  const waNumber = (raw) => {
    const d = String(raw || '').replace(/\D/g, '')
    if (!d) return ''
    if (d.startsWith('00')) return d.slice(2)
    if (d.startsWith('0')) return '44' + d.slice(1)
    return d
  }
  const waHref = (t) => {
    const link = `${origin}/t/${t.code}`
    const who = greetingName(t.customerName)
    const name = who ? ` ${who}` : ''
    const body =
      `Hi${name} — you can see where your job is up to here: ${link} ` +
      `It updates through the day so you are not left guessing.`
    const n = waNumber(t.customerPhone)
    return `https://wa.me/${n}?text=${encodeURIComponent(body)}`
  }

  // A time input gives "14:30" with no date. Hang it off the job's own booked
  // day so the window lands on the right date, and fall back to today for a
  // job with no date set yet.
  const timeOnDay = (t, hhmm) => {
    if (!hhmm) return null
    const base = t.scheduledFor ? new Date(t.scheduledFor) : new Date()
    const [h, m] = hhmm.split(':').map(Number)
    base.setHours(h, m, 0, 0)
    return base.toISOString()
  }

  const copyLink = async (code) => {
    const link = `${window.location.origin}/t/${code}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(code); setTimeout(() => setCopied(null), 2000)
    } catch { window.prompt('Copy this link:', link) }
  }

  const field = (key, label, placeholder, type = 'text') => (
    <label className="block text-[14px] font-medium muted">
      {label}
      <input type={type} value={form[key]} placeholder={placeholder}
             onChange={(e) => setForm({ ...form, [key]: e.target.value })}
             className="field mt-1.5" />
    </label>
  )

  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-safe">
      <div className="flex items-center justify-between pt-2">
        <Link href="/" aria-label="TurnUp home" className="inline-flex min-h-[44px] items-center gap-2 pr-2">
          <Mark className="h-7 w-auto" id="dash" />
          <span className="text-[17px] font-bold tracking-[-0.02em]">TurnUp</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/plan" className="inline-flex min-h-[44px] items-center px-2 text-[15px] muted">Plan</Link>
          <button onClick={async () => { await fetch('/api/auth/login', { method: 'DELETE' }); location.href = '/login' }}
                  className="inline-flex min-h-[44px] items-center px-2 text-[15px] muted">Sign out</button>
        </div>
      </div>
      <h1 className="mt-5 text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">Jobs</h1>
      <p className="mt-1.5 text-[16px] muted">One link per job. Send it when the job is booked, then tap the stage as the day goes.</p>

      {error && (
        <div className="r-outer mt-5 p-5"
             style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          <p className="font-semibold">{error.title}</p>
          {error.fix && <p className="mt-1 text-sm">{error.fix}</p>}
        </div>
      )}

      {/* Shut by default. It is six empty fields used once per job, and it was
          the first thing on the screen every time the screen was opened. */}
      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}
                className="btn btn-filled mt-6 w-full">
          <PlusIcon size={18} /> New job
        </button>
      )}

      {showForm && (
      <form onSubmit={create} className="glass r-outer mt-6 grid gap-4 p-5 sm:grid-cols-2">
        {field('sm8JobNumber', 'ServiceM8 job number — fills the rest in, and the card then follows the job', '2718')}
        {field('customerName', 'Customer name', 'Sarah Whitfield')}
        {field('customerPhone', 'Their mobile', '07700 900123', 'tel')}
        {field('jobSummary', 'Job', 'Unvented cylinder swap')}
        {field('jobAddress', 'Address', 'Church Lane, Burbage SN8')}
        {field('jobRef', 'Your job number', '2718')}
        {field('scheduledFor', 'Booked for (day/month/year)', '', 'date')}
        <div className="flex items-end">
          <button type="submit" disabled={saving}
                  className="btn btn-filled w-full">
            {saving ? 'Creating…' : 'Create tracking link'}
          </button>
        </div>
        <button type="button" onClick={() => { setForm(EMPTY); setShowForm(false) }}
                className="btn btn-grey w-full sm:col-span-2">Cancel</button>
      </form>
      )}

      {loading ? <p className="mt-8 text-center text-[15px] muted">Loading…</p>
       : trackers.length === 0 ? <p className="mt-8 text-center text-[15px] muted">No jobs yet. Create one above.</p>
       : (
        <ul className="mt-6 space-y-4">
          {trackers.map((t) => {
            const open = openJob === t.id
            return (
            <li key={t.id}
                className={`glass r-outer tone-${stageOf(t.stage).tone} p-4 ${t.isActive ? '' : 'opacity-55'}`}>
              {presenceOf(t.presence) && presenceIsFresh(t.presenceAt) && (
                <div className="r-inner mb-3 flex items-start gap-3 px-4 py-3"
                     style={{
                       background: `color-mix(in srgb, var(--stage-${t.presence === 'OUT' ? 'paused' : 'done'}) 13%, transparent)`,
                       color: `var(--stage-${t.presence === 'OUT' ? 'paused' : 'done'})`,
                     }}>
                  <PresenceIcon presence={t.presence} size={19} className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold">{presenceOf(t.presence).forTrade}</span>
                    {t.presenceNote && <span className="block text-[14px]">{t.presenceNote}</span>}
                    <span className="block text-[13px] opacity-75">
                      they said so {presenceAgeLabel(t.presenceAt)}
                    </span>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0 flex-1 break-words">
                  <p className="text-[19px] font-semibold tracking-[-0.01em]">{t.customerName || 'Unnamed customer'}{t.jobRef ? ` · #${t.jobRef}` : ''}</p>
                  <p className="mt-0.5 text-[15px] muted">{t.jobSummary || 'No description'}{t.jobAddress ? ` — ${t.jobAddress}` : ''}</p>
                  {/* Linked at birth to a ServiceM8 job: the card moves on its own. Worth
                      saying on the card, because the stage buttons below still work and
                      a trade should know which cards follow the job and which are theirs. */}
                  {t.externalId && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2 py-0.5 text-[12px] font-semibold" style={{ color: 'var(--tint)' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />Follows ServiceM8 job {t.jobRef ? `#${t.jobRef}` : ''}
                    </p>
                  )}
                </div>
                <p className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold"
                   style={{ color: 'var(--tint)' }}>
                  <StageIcon tone={stageOf(t.stage).tone} size={17} />
                  {stageOf(t.stage).label}
                </p>
              </div>

              <div className="stages mt-3.5" role="group" aria-label="Stage">
                {STAGE_BUTTONS.map((s) => (
                  <button key={s} type="button" onClick={() => patch(t.id, { stage: s })}
                          aria-pressed={t.stage === s} aria-label={STAGES[s].label}
                          className={`tone-${STAGES[s].tone} stage-seg ${t.stage === s ? 'stage-seg-on' : ''}`}>
                    <StageIcon tone={STAGES[s].tone} size={18} />
                    <span>{STAGES[s].short}</span>
                  </button>
                ))}
              </div>

              {/* Getting there — and what they told you about the door. This
                  used to live only on the customer's page, which meant the
                  trade never saw "gate sticks, use the back door". */}
              {(t.jobAddress || t.mapPin || t.what3words) && (
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <a href={mapsDirectionsUrl({ mapPin: t.mapPin, address: t.jobAddress })} target="_blank" rel="noreferrer"
                     className="btn btn-tinted !min-h-[44px] !px-4 !text-[14px]">
                    <CompassIcon size={16} /> Navigate
                  </a>
                  {t.what3words && (
                    <a href={w3wUrl(t.what3words)} target="_blank" rel="noreferrer"
                       className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">///{t.what3words}</a>
                  )}
                  {t.mapPin && (
                    <a href={t.mapPin} target="_blank" rel="noreferrer"
                       className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]"><PinIcon size={15} /> Their pin</a>
                  )}
                </div>
              )}

              {(t.doorToUse || t.petsOnSite || t.accessNotes) && (
                <div className="r-inner mt-3 flex items-start gap-3 px-4 py-3" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
                  <KeyIcon size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--tint)' }} />
                  <span className="min-w-0 text-[14px]">
                    <span className="block font-semibold">
                      {[t.doorToUse && `${t.doorToUse.charAt(0)}${t.doorToUse.slice(1).toLowerCase()} door`,
                        t.petsOnSite && 'There is a dog'].filter(Boolean).join(' · ') || 'From the customer'}
                    </span>
                    {t.accessNotes && <span className="block">{t.accessNotes}</span>}
                  </span>
                </div>
              )}

              {/* What the customer said back about the time. Loud when it is
                  waiting on an answer, because an unanswered counter-offer is
                  a wasted trip in the making. */}
              {t.windowState === 'PROPOSED' && t.windowBy === 'CUSTOMER' && (
                <div className="r-inner mt-3 p-4"
                     style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
                  <p className="text-[15px] font-bold" style={{ color: 'var(--stage-paused)' }}>
                    {windowSummary({ state: t.windowState, by: t.windowBy, start: t.windowStart, end: t.windowEnd }, 'TRADE')}
                  </p>
                  {t.windowNote && <p className="mt-1 text-[15px]">&ldquo;{t.windowNote}&rdquo;</p>}
                  <button type="button" onClick={() => patch(t.id, { windowAgree: true })}
                          className="btn btn-filled mt-3 w-full !min-h-[48px] !text-[16px]">
                    <TickIcon size={17} /> That works — agree it
                  </button>
                  <p className="mt-2 text-[13px] muted">
                    Or open this job and set your own hours, which sends it back to them.
                  </p>
                </div>
              )}

              {t.windowState === 'AGREED' && t.windowStart && (
                <p className="mt-3 text-[15px] font-semibold" style={{ color: 'var(--stage-done)' }}>
                  {windowHours({ start: t.windowStart, end: t.windowEnd })} — agreed with them
                </p>
              )}
              {t.windowState === 'PROPOSED' && t.windowBy === 'TRADE' && (
                <p className="mt-3 text-[15px] muted">
                  {windowHours({ start: t.windowStart, end: t.windowEnd })} — sent, waiting on them
                </p>
              )}

              {/* --- everything below is folded away until the row is opened ---

                  What stays visible is what gets used standing next to a van:
                  who and where, the stage buttons, Navigate, anything the
                  customer has said that is waiting on an answer. The rest —
                  sending the link, setting hours, photos, the note — is done
                  once per job, sitting down, and does not belong between this
                  job and the next one. */}
              <button type="button" onClick={() => setOpenJob(open ? null : t.id)}
                      aria-expanded={open}
                      className="mt-3 flex min-h-[44px] w-full items-center justify-between gap-2 text-[14px] font-medium muted">
                <span>{open ? 'Less' : 'Link, hours, photos, note'}</span>
                <ChevronIcon size={16} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
              </button>

              {open && (<>
              {/* Dropped from the doorstep on the first visit, which is the
                  better moment than asking the customer to do it: the person
                  standing there is the one who will have to find it again, and
                  a pin beats "third gate past the postbox" next time. */}
              <div className="mt-2">
                <DropPin
                  label={t.mapPin ? 'Replace pin with where I am' : 'Drop a pin here'}
                  className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]"
                  onPin={(url) => patch(t.id, { mapPin: url })}
                />
              </div>

              {/* The trade needs three words as often as the customer does, and
                  is more likely to be the one standing at the gate. The field
                  was read-only here: whatever the customer had typed, and no
                  way to set it from the van. */}
              <label className="mt-3 block text-[13px] muted">
                what3words — for a gate with no number
                {/* Uncontrolled, like the other fields here, so it does not
                    fight a keystroke on a patchy connection. Keyed on the
                    value so a lookup that fills it in is actually seen: a
                    defaultValue alone would not change on re-render. */}
                <input type="text" key={t.what3words || 'empty'}
                       defaultValue={t.what3words || ''} placeholder="///filled.count.soap"
                       autoCapitalize="none" autoCorrect="off"
                       onBlur={(e) => e.target.value !== (t.what3words || '') && patch(t.id, { what3words: e.target.value })}
                       className="field mt-1.5 !min-h-[44px] !text-[14px]" />
              </label>
              <FindWords onWords={(w) => patch(t.id, { what3words: w })} />

              <div className="r-inner mt-4 p-4" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
                <p className="text-[13px] font-semibold muted">Send this to the customer</p>
                <p className="mt-1.5 select-all break-all font-mono text-[14px]">
                  {origin}/t/{t.code}
                </p>
                {/* Two capsules side by side. The channel is the big word and the
                    customer's name sits under it in one truncated line, so "Text
                    Mrs Whitfield" can never wrap to three lines and stretch the
                    pair into a pill the size of a thumb. */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={smsHref(t)}
                     className="btn !min-h-[56px] !flex-col !gap-0 !px-3 !py-2 !text-[16px]"
                     style={{ background: 'var(--mts-accent)', color: '#fff' }}>
                    <span className="flex items-center gap-1.5"><MessageIcon size={17} /> Text</span>
                    <span className="max-w-full truncate text-[12px] font-medium opacity-80">
                      {greetingName(t.customerName) || 'the customer'}
                    </span>
                  </a>
                  <a href={waHref(t)} target="_blank" rel="noreferrer"
                     className="btn !min-h-[56px] !flex-col !gap-0 !px-3 !py-2 !text-[16px]"
                     style={{ background: '#25D366', color: '#062e18' }}>
                    <span>WhatsApp</span>
                    <span className="max-w-full truncate text-[12px] font-medium opacity-80">
                      {greetingName(t.customerName) || 'the customer'}
                    </span>
                  </a>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => copyLink(t.code)}
                          className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">
                    <CopyIcon size={16} /> {copied === t.code ? 'Copied' : 'Copy link'}
                  </button>
                  <a href={`/t/${t.code}`} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">
                    <EyeIcon size={16} /> Open it
                  </a>
                </div>
              </div>


              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block text-[13px] muted">
                  Window from
                  <input type="time"
                         defaultValue={t.windowStart ? new Date(t.windowStart).toTimeString().slice(0, 5) : ''}
                         onBlur={(e) => patch(t.id, { windowStart: timeOnDay(t, e.target.value) })}
                         className="field mt-1.5" />
                </label>
                <label className="block text-[13px] muted">
                  until
                  <input type="time"
                         defaultValue={t.windowEnd ? new Date(t.windowEnd).toTimeString().slice(0, 5) : ''}
                         onBlur={(e) => patch(t.id, { windowEnd: timeOnDay(t, e.target.value) })}
                         className="field mt-1.5" />
                </label>
              </div>
              <label className="mt-2 block text-[13px] muted">
                Where in today&apos;s run
                <input type="number" min="1" inputMode="numeric"
                       defaultValue={t.position ?? ''}
                       placeholder="2 — tells them &quot;you are second today&quot;"
                       onBlur={(e) => patch(t.id, { position: e.target.value === '' ? null : e.target.value })}
                       className="field mt-1.5" />
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t.isActive && (
                  <button type="button" onClick={() => revoke(t.id)}
                          className="btn btn-danger !min-h-[44px] !px-4 !text-[14px]">
                    <LinkOffIcon size={16} /> Switch link off
                  </button>
                )}
                <span className="text-[14px] muted">{t.viewCount || 0} view{t.viewCount === 1 ? '' : 's'}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[['housePhoto', 'House from the road'], ['doorPhoto', 'The door to come to']].map(([k, label]) => (
                  <label key={k} className="block text-[13px] muted">
                    {label}
                    {t[k] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={t[k]} alt={label} className="r-inner mt-1.5 aspect-[4/3] w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )}
                    <input type="url" defaultValue={t[k] || ''} placeholder="Photo link…" inputMode="url"
                           onBlur={(e) => e.target.value !== (t[k] || '') && patch(t.id, { [k]: e.target.value })}
                           className="field mt-1.5 !min-h-[44px] !text-[14px]" />
                  </label>
                ))}
              </div>

              <label className="mt-4 block text-[14px] font-medium muted">
                Note shown to the customer
                <input type="text" defaultValue={t.stageNote || ''}
                       placeholder="Waiting on the cylinder from the merchant — back Thursday morning"
                       onBlur={(e) => e.target.value !== (t.stageNote || '') && patch(t.id, { stageNote: e.target.value })}
                       className="field mt-1.5" />
              </label>
              </>)}
            </li>
            )
          })}
        </ul>
      )}

      <WaitlistPanel />
      <WalletShowcase tracker={trackers[0]} />
      <ServiceM8 onChanged={load} />
      <Profile />
      <Passkeys />
      <Roadmap />
      <Changelog />
      <div className="mt-8 flex justify-center"><BuildStamp /></div>
      </main>
    </div>
  )
}
