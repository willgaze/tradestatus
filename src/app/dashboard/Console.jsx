'use client'

import { useCallback, useEffect, useState } from 'react'
import { STAGES, stageOf } from '@/lib/trade-status'
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

  const copyLink = async (code) => {
    const link = `${window.location.origin}/t/${code}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(code); setTimeout(() => setCopied(null), 2000)
    } catch { window.prompt('Copy this link:', link) }
  }

  const field = (key, label, placeholder, type = 'text') => (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input type={type} value={form[key]} placeholder={placeholder}
             onChange={(e) => setForm({ ...form, [key]: e.target.value })}
             className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base" />
    </label>
  )

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button onClick={async () => { await fetch('/api/auth/login', { method: 'DELETE' }); location.href = '/login' }}
                className="text-sm text-slate-500 underline">Sign out</button>
      </div>
      <p className="mt-1 text-slate-600">One link per job. Send it when the job is booked, then tap the stage as the day goes.</p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <p className="font-semibold">{error.title}</p>
          {error.fix && <p className="mt-1 text-sm">{error.fix}</p>}
        </div>
      )}

      <form onSubmit={create} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        {field('customerName', 'Customer name', 'Sarah Whitfield')}
        {field('jobSummary', 'Job', 'Unvented cylinder swap')}
        {field('jobAddress', 'Address', 'Church Lane, Burbage SN8')}
        {field('jobRef', 'Your job number', '2718')}
        {field('scheduledFor', 'Booked for', '', 'date')}
        <div className="flex items-end">
          <button type="submit" disabled={saving}
                  className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {saving ? 'Creating…' : 'Create tracking link'}
          </button>
        </div>
      </form>

      {loading ? <p className="mt-6 text-slate-500">Loading…</p>
       : trackers.length === 0 ? <p className="mt-6 text-slate-500">No jobs yet. Create one above.</p>
       : (
        <ul className="mt-6 space-y-4">
          {trackers.map((t) => (
            <li key={t.id} className={`rounded-2xl border p-4 ${t.isActive ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-bold">{t.customerName || 'Unnamed customer'}{t.jobRef ? ` · #${t.jobRef}` : ''}</p>
                  <p className="text-sm text-slate-600">{t.jobSummary || 'No description'}{t.jobAddress ? ` — ${t.jobAddress}` : ''}</p>
                </div>
                <p className="text-sm font-semibold">{stageOf(t.stage).icon} {stageOf(t.stage).label}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STAGE_BUTTONS.map((s) => (
                  <button key={s} type="button" onClick={() => patch(t.id, { stage: s })}
                          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                            t.stage === s ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}>
                    {STAGES[s].label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => copyLink(t.code)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
                  {copied === t.code ? 'Link copied' : 'Copy customer link'}
                </button>
                <a href={`/t/${t.code}`} target="_blank" rel="noreferrer"
                   className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
                  View as customer
                </a>
                {t.isActive && (
                  <button type="button" onClick={() => revoke(t.id)}
                          className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700">
                    Switch link off
                  </button>
                )}
                <span className="text-sm text-slate-400">{t.viewCount || 0} view{t.viewCount === 1 ? '' : 's'}</span>
              </div>

              <label className="mt-3 block text-sm font-medium text-slate-700">
                Note shown to the customer
                <input type="text" defaultValue={t.stageNote || ''}
                       placeholder="Waiting on the cylinder from the merchant — back Thursday morning"
                       onBlur={(e) => e.target.value !== (t.stageNote || '') && patch(t.id, { stageNote: e.target.value })}
                       className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base" />
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
