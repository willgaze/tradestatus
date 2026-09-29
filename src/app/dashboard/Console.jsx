'use client'

import { useCallback, useEffect, useState } from 'react'
import { STAGES, stageOf } from '@/lib/trade-status'
import Passkeys from './Passkeys'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import Changelog from './Changelog'
import Profile from './Profile'
import WalletShowcase from './WalletShowcase'
import Roadmap from './Roadmap'
import { presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import { DB_REASONS } from '@/lib/db-errors'

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
const EMPTY = { customerName: '', jobSummary: '', jobAddress: '', jobRef: '', scheduledFor: '' }

export default function Console() {
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)

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
             className="surface mt-1.5 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
    </label>
  )

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-safe">
      <div className="flex items-center justify-between pt-2">
        <Mark className="h-7 w-auto" id="dash" />
        <button onClick={async () => { await fetch('/api/auth/login', { method: 'DELETE' }); location.href = '/login' }}
                className="inline-flex min-h-[44px] items-center px-2 text-[15px] muted">Sign out</button>
      </div>
      <h1 className="mt-5 text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">Jobs</h1>
      <p className="mt-1.5 text-[16px] muted">One link per job. Send it when the job is booked, then tap the stage as the day goes.</p>

      {error && (
        <div className="mt-5 rounded-3xl bg-stage-paused/10 p-5 text-stage-paused">
          <p className="font-semibold">{error.title}</p>
          {error.fix && <p className="mt-1 text-sm">{error.fix}</p>}
        </div>
      )}

      <form onSubmit={create} className="surface mt-6 grid gap-4 rounded-4xl p-6 shadow-card sm:grid-cols-2">
        {field('customerName', 'Customer name', 'Sarah Whitfield')}
        {field('customerPhone', 'Their mobile', '07700 900123', 'tel')}
        {field('jobSummary', 'Job', 'Unvented cylinder swap')}
        {field('jobAddress', 'Address', 'Church Lane, Burbage SN8')}
        {field('jobRef', 'Your job number', '2718')}
        {field('scheduledFor', 'Booked for (day/month/year)', '', 'date')}
        <div className="flex items-end">
          <button type="submit" disabled={saving}
                  className="min-h-[54px] w-full rounded-2xl bg-brand-600 text-[17px] font-semibold text-white transition-transform active:scale-[.99] disabled:opacity-60">
            {saving ? 'Creating…' : 'Create tracking link'}
          </button>
        </div>
      </form>

      {loading ? <p className="mt-8 text-center text-[15px] muted">Loading…</p>
       : trackers.length === 0 ? <p className="mt-8 text-center text-[15px] muted">No jobs yet. Create one above.</p>
       : (
        <ul className="mt-6 space-y-4">
          {trackers.map((t) => (
            <li key={t.id} className={`surface rounded-4xl p-5 shadow-card ${t.isActive ? '' : 'opacity-55'}`}>
              {presenceOf(t.presence) && presenceIsFresh(t.presenceAt) && (
                <div className={`mb-3 flex items-start gap-3 rounded-2xl px-4 py-3 ${
                  t.presence === 'OUT'
                    ? 'bg-stage-paused/12 text-stage-paused'
                    : 'bg-stage-done/10 text-stage-done'}`}>
                  <span className="text-[18px] leading-none">{presenceOf(t.presence).icon}</span>
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
                </div>
                <p className="shrink-0 text-[14px] font-semibold">{stageOf(t.stage).icon} {stageOf(t.stage).label}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STAGE_BUTTONS.map((s) => (
                  <button key={s} type="button" onClick={() => patch(t.id, { stage: s })}
                          className={`min-h-[48px] flex-1 rounded-xl px-4 py-3 text-base font-semibold ${
                            t.stage === s ? 'bg-brand-600 text-white shadow-sm' : 'bg-black/[.04] dark:bg-white/[.06]'}`}>
                    {STAGES[s].label}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-3xl bg-brand-50 p-4 dark:bg-brand-900/25">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Send this to the customer
                </p>
                <p className="mt-1.5 select-all break-all font-mono text-[14px]">
                  {origin}/t/{t.code}
                </p>
                <a href={smsHref(t)}
                   className="mt-3 flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-brand-600 px-4 text-[17px] font-semibold text-white transition-transform active:scale-[.99]">
                  Text {greetingName(t.customerName) || 'the customer'} this link
                </a>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => copyLink(t.code)}
                          className="surface min-h-[44px] rounded-2xl border px-4 text-[14px] font-semibold hairline">
                    {copied === t.code ? '✓ Copied' : 'Copy link'}
                  </button>
                  <a href={`/t/${t.code}`} target="_blank" rel="noreferrer"
                     className="surface inline-flex min-h-[44px] items-center rounded-2xl border px-4 text-[14px] font-semibold hairline">
                    Open it
                  </a>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block text-[13px] muted">
                  Window from
                  <input type="time"
                         defaultValue={t.windowStart ? new Date(t.windowStart).toTimeString().slice(0, 5) : ''}
                         onBlur={(e) => patch(t.id, { windowStart: timeOnDay(t, e.target.value) })}
                         className="surface mt-1.5 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
                </label>
                <label className="block text-[13px] muted">
                  until
                  <input type="time"
                         defaultValue={t.windowEnd ? new Date(t.windowEnd).toTimeString().slice(0, 5) : ''}
                         onBlur={(e) => patch(t.id, { windowEnd: timeOnDay(t, e.target.value) })}
                         className="surface mt-1.5 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
                </label>
              </div>
              <label className="mt-2 block text-[13px] muted">
                Where in today&apos;s run
                <input type="number" min="1" inputMode="numeric"
                       defaultValue={t.position ?? ''}
                       placeholder="2 — tells them &quot;you are second today&quot;"
                       onBlur={(e) => patch(t.id, { position: e.target.value === '' ? null : e.target.value })}
                       className="surface mt-1.5 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t.isActive && (
                  <button type="button" onClick={() => revoke(t.id)}
                          className="min-h-[44px] rounded-2xl bg-stage-paused/10 px-4 text-[14px] font-semibold text-stage-paused">
                    Switch link off
                  </button>
                )}
                <span className="text-[14px] muted">{t.viewCount || 0} view{t.viewCount === 1 ? '' : 's'}</span>
              </div>

              <label className="mt-4 block text-[14px] font-medium muted">
                Note shown to the customer
                <input type="text" defaultValue={t.stageNote || ''}
                       placeholder="Waiting on the cylinder from the merchant — back Thursday morning"
                       onBlur={(e) => e.target.value !== (t.stageNote || '') && patch(t.id, { stageNote: e.target.value })}
                       className="surface mt-1.5 min-h-[50px] w-full rounded-2xl border px-4 text-[16px] hairline" />
              </label>
            </li>
          ))}
        </ul>
      )}

      <WalletShowcase tracker={trackers[0]} />
      <Profile />
      <Passkeys />
      <Roadmap />
      <Changelog />
      <div className="mt-8 flex justify-center"><BuildStamp /></div>
    </main>
  )
}
