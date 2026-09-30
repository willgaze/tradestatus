'use client'

import { useState } from 'react'
import { STAGES } from '@/lib/trade-status'
import { dayOnly } from '@/lib/when'
import { DB_REASONS } from '@/lib/db-errors'
import { TickIcon, MessageIcon } from '@/components/icons'

/**
 * Say what happened, get a card, tap once.
 *
 * The box takes words — typed, dictated with the keyboard's mic, or pasted
 * from a booking email — and hands back a proposal: a filled-in job, or a
 * change to one already on the list. Nothing is saved until Confirm. The form
 * below this has not gone anywhere; this is the same form, filled in for you,
 * shown as the thing to check rather than the thing to type.
 *
 * The proposal is the model's reading of the words, and it has already been
 * through the server's cleaners. Confirm sends it to the same two endpoints
 * the form and the stage buttons use. A wrong reading costs one tap on "Not
 * that", and the words are still in the box to try again.
 */

const REASONS = {
  assistant_not_configured: { title: 'The assistant is switched off', fix: 'Set ANTHROPIC_API_KEY in the hosting environment, then redeploy.' },
  assistant_bad_key: { title: 'The assistant key was refused', fix: 'Check ANTHROPIC_API_KEY in the hosting environment.' },
  assistant_busy: { title: 'The assistant is busy', fix: 'Try again in a moment.' },
  assistant_failed: { title: 'The assistant could not read that', fix: 'Try again, or use the form below.' },
  nothing_said: { title: 'Nothing to read', fix: 'Type or paste something first.' },
}

const LABELS = {
  customerName: 'Customer', customerPhone: 'Mobile', jobSummary: 'Job', jobAddress: 'Address',
  jobRef: 'Job number', scheduledFor: 'Booked for', stage: 'Stage', stageNote: 'Note to customer',
  position: 'Where in the run',
}

const HINTS = [
  'New job for Mrs Whitfield, 4 Church Lane, Tuesday morning, cylinder swap',
  'On my way to Whitfield',
  'Paused on Hale, waiting on the cylinder from the merchant',
  'Or paste a booking email',
]

// "14:30" on a given day, as an ISO instant. The date comes from the proposal
// for a new job, or the job's own booked day for an update, or today. Parsed
// as local time, which is what the form's own time inputs assume too.
function timeOn(ymd, hhmm) {
  if (!hhmm) return null
  const base = ymd ? new Date(`${ymd}T00:00:00`) : new Date()
  const [h, m] = hhmm.split(':').map(Number)
  base.setHours(h, m, 0, 0)
  return base.toISOString()
}

function rows(fields) {
  const out = []
  for (const key of ['customerName', 'customerPhone', 'jobSummary', 'jobAddress', 'jobRef']) {
    if (fields[key]) out.push([LABELS[key], fields[key]])
  }
  if (fields.scheduledFor) out.push([LABELS.scheduledFor, dayOnly(`${fields.scheduledFor}T12:00:00Z`)])
  if (fields.stage) out.push([LABELS.stage, STAGES[fields.stage]?.label || fields.stage])
  if (fields.windowStart || fields.windowEnd) {
    out.push(['Window', [fields.windowStart, fields.windowEnd].filter(Boolean).join(' to ')])
  }
  if (fields.position) out.push([LABELS.position, `${fields.position}${['st', 'nd', 'rd'][fields.position - 1] || 'th'} today`])
  if (fields.stageNote) out.push([LABELS.stageNote, fields.stageNote])
  return out
}

export default function Assistant({ jobs, onCreate, onUpdate }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [proposal, setProposal] = useState(null)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)

  const ask = async () => {
    const said = text.trim()
    if (!said || busy) return
    setBusy(true); setError(null); setDone(null); setProposal(null)
    try {
      const r = await fetch('/api/dashboard/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: said }),
      })
      if (!r.ok) {
        let reason = null
        try { reason = (await r.json())?.error } catch { /* no body */ }
        const known = REASONS[reason] || DB_REASONS[reason]
        return setError(known || (r.status === 401
          ? { title: 'Signed out', fix: 'Sign in again to carry on.' }
          : { title: 'The assistant could not read that', fix: 'Try again, or use the form below.' }))
      }
      setProposal((await r.json()).proposal)
    } catch {
      setError({ title: 'Could not reach the server', fix: 'Check your connection and try again.' })
    } finally { setBusy(false) }
  }

  const confirm = async () => {
    if (!proposal || busy) return
    setBusy(true)
    try {
      const f = proposal.fields
      let ok = false
      if (proposal.action === 'create_job') {
        ok = await onCreate({
          customerName: f.customerName || '', customerPhone: f.customerPhone || '',
          jobSummary: f.jobSummary || '', jobAddress: f.jobAddress || '', jobRef: f.jobRef || '',
          scheduledFor: f.scheduledFor || '',
          stage: f.stage || 'BOOKED', stageNote: f.stageNote || '',
          windowStart: timeOn(f.scheduledFor, f.windowStart), windowEnd: timeOn(f.scheduledFor, f.windowEnd),
          position: f.position || null,
        })
        if (ok) setDone('Created. Text or WhatsApp them the link from the card below.')
      } else if (proposal.action === 'update_job') {
        const job = jobs.find((j) => j.id === proposal.jobId)
        const day = job?.scheduledFor ? new Date(job.scheduledFor).toISOString().slice(0, 10) : null
        const body = {}
        for (const key of ['customerName', 'customerPhone', 'jobSummary', 'jobAddress', 'jobRef', 'stage', 'stageNote', 'position']) {
          if (f[key] !== undefined) body[key] = f[key]
        }
        if (f.windowStart) body.windowStart = timeOn(day, f.windowStart)
        if (f.windowEnd) body.windowEnd = timeOn(day, f.windowEnd)
        ok = await onUpdate(proposal.jobId, body)
        if (ok) setDone('Done.')
      }
      if (ok) { setProposal(null); setText('') }
    } finally { setBusy(false) }
  }

  const job = proposal?.action === 'update_job' ? jobs.find((j) => j.id === proposal.jobId) : null

  return (
    <section className="glass r-outer mt-6 p-5">
      <label className="block text-[14px] font-medium muted" htmlFor="assistant-text">
        What&apos;s happened?
      </label>
      <textarea id="assistant-text" value={text} rows={2}
                placeholder={HINTS[0]}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
                className="field mt-1.5 !min-h-[56px] resize-y" />
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={ask} disabled={busy || !text.trim()} className="btn btn-filled !min-h-[44px] !px-5">
          <MessageIcon size={16} /> {busy && !proposal ? 'Reading it…' : 'Go'}
        </button>
        <span className="text-[13px] muted">Type it, say it with the keyboard mic, or paste a booking email.</span>
      </div>

      {!proposal && !error && !done && (
        <p className="mt-3 text-[13px] muted">
          Try: {HINTS.slice(1).map((h, i) => (
            <span key={h}>{i > 0 ? ' · ' : ''}<button type="button" className="underline" onClick={() => setText(h.startsWith('Or ') ? '' : h)}>{h}</button></span>
          ))}
        </p>
      )}

      {error && (
        <div className="r-inner mt-4 p-4" style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          <p className="font-semibold">{error.title}</p>
          {error.fix && <p className="mt-1 text-sm">{error.fix}</p>}
        </div>
      )}

      {done && (
        <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: 'var(--stage-done)' }}>
          <TickIcon size={17} /> {done}
        </p>
      )}

      {proposal && (
        <div className={`r-inner mt-4 p-4 ${proposal.fields?.stage ? `tone-${STAGES[proposal.fields.stage]?.tone}` : ''}`}
             style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
          <p className="text-[16px] font-semibold">{proposal.say}</p>

          {proposal.action === 'unclear' ? (
            <p className="mt-2 text-[15px]">{proposal.question}</p>
          ) : (
            <>
              {job && (
                <p className="mt-1 text-[14px] muted">
                  {job.customerName || 'Unnamed customer'}{job.jobRef ? ` · #${job.jobRef}` : ''}{job.jobAddress ? ` — ${job.jobAddress}` : ''}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
                {rows(proposal.fields).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="muted">{k}</dt>
                    <dd className="min-w-0 break-words font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {proposal.warnings?.includes('no_time_promise') && (
                <p className="mt-3 text-[13px] muted">
                  The time was left out of the note. Turnup never promises a time; the window carries it instead.
                </p>
              )}
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.action !== 'unclear' && (
              <button type="button" onClick={confirm} disabled={busy} className="btn btn-filled !min-h-[44px] !px-5">
                <TickIcon size={16} /> {busy ? 'Saving…' : proposal.action === 'create_job' ? 'Create the job' : 'Confirm'}
              </button>
            )}
            <button type="button" onClick={() => setProposal(null)} disabled={busy} className="btn btn-grey !min-h-[44px] !px-4">
              {proposal.action === 'unclear' ? 'OK' : 'Not that'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
