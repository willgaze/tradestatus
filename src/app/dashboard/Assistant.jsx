'use client'

import { useEffect, useRef, useState } from 'react'
import { STAGES } from '@/lib/trade-status'
import { dayOnly } from '@/lib/when'
import { DB_REASONS } from '@/lib/db-errors'
import { suggestions } from '@/lib/tips'
import { TickIcon, MessageIcon } from '@/components/icons'

/**
 * Ask it or tell it.
 *
 * One box at the top of the dashboard. A question gets an answer. "On my way
 * to Whitfield" gets a card to confirm. A pasted booking email gets a
 * filled-in job to confirm. Nothing is saved until Confirm is tapped, and
 * Confirm sends the same request the form or the stage buttons would have.
 * See src/lib/assistant.js for the rules the server holds it to.
 *
 * The thread is this sitting's exchanges, kept in sessionStorage so a refresh
 * on a patchy connection does not lose "and Janet?". It is per tab and per
 * phone, which is all it needs to be.
 */

const THREAD_KEY = 'turnup-thread'
const KEEP = 12

const REASONS = {
  assistant_not_configured: { title: 'The box is switched off', fix: 'Set ANTHROPIC_API_KEY in the hosting environment, then redeploy.' },
  assistant_bad_key: { title: 'The key was refused', fix: 'Check ANTHROPIC_API_KEY in the hosting environment.' },
  assistant_busy: { title: 'Busy right now', fix: 'Try again in a moment.' },
  assistant_failed: { title: 'Could not read that', fix: 'Try again, or use the form.' },
  nothing_said: { title: 'Nothing to read', fix: 'Type or paste something first.' },
}

const LABELS = {
  customerName: 'Customer', customerPhone: 'Mobile', jobSummary: 'Job', jobAddress: 'Address',
  jobRef: 'Job number', sm8JobNumber: 'ServiceM8 job', scheduledFor: 'Booked for', stage: 'Stage',
  stageNote: 'Note to customer', position: 'Where in the run',
}

// "14:30" on a given day as an instant. The day is the proposal's, or the
// job's own booked day, or today. Parsed as local time, which is what the
// form's own time inputs assume too.
function timeOn(ymd, hhmm) {
  if (!hhmm) return null
  const base = ymd ? new Date(`${ymd}T00:00:00`) : new Date()
  const [h, m] = hhmm.split(':').map(Number)
  base.setHours(h, m, 0, 0)
  return base.toISOString()
}

function rows(fields) {
  const out = []
  for (const key of ['sm8JobNumber', 'customerName', 'customerPhone', 'jobSummary', 'jobAddress', 'jobRef']) {
    if (fields[key]) out.push([LABELS[key], fields[key]])
  }
  if (fields.scheduledFor) out.push([LABELS.scheduledFor, dayOnly(`${fields.scheduledFor}T12:00:00Z`)])
  if (fields.stage) out.push([LABELS.stage, STAGES[fields.stage]?.label || fields.stage])
  if (fields.windowAgree) out.push(['Window', 'Agree the hours they asked for'])
  if (fields.windowClear) out.push(['Window', 'Drop it'])
  if (fields.windowStart || fields.windowEnd) {
    out.push(['Propose hours', [fields.windowStart, fields.windowEnd].filter(Boolean).join(' to ')])
  }
  if (fields.lateMinutes) out.push(['Running late', `about ${fields.lateMinutes} minutes`])
  if (fields.clearLate) out.push(['Running late', 'no longer'])
  if (fields.position) out.push([LABELS.position, `${fields.position}${['st', 'nd', 'rd'][fields.position - 1] || 'th'} today`])
  if (fields.stageNote) out.push([LABELS.stageNote, fields.stageNote])
  return out
}

const WARNINGS = {
  no_time_promise: 'The time was left out of the note. TurnUp never promises a time; the hours above carry it instead.',
  window_backwards: 'The end was before the start, so only the start is kept.',
  nothing_to_agree: 'There are no hours from the customer to agree to on this job.',
  late_not_a_choice: 'Running late is 15, 30 or 60 minutes, the same as the buttons.',
}

export default function Assistant({ jobs, setup, onCreate, onUpdate }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [thread, setThread] = useState([])
  const [error, setError] = useState(null)
  const endRef = useRef(null)

  // Read after mount: sessionStorage does not exist during the server render.
  useEffect(() => {
    try { const v = JSON.parse(sessionStorage.getItem(THREAD_KEY) || '[]'); if (Array.isArray(v)) setThread(v) } catch { /* nothing kept */ }
  }, [])
  const remember = (next) => {
    const kept = next.slice(-KEEP)
    setThread(kept)
    try { sessionStorage.setItem(THREAD_KEY, JSON.stringify(kept)) } catch { /* private window */ }
  }
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'nearest' }) }, [thread.length])

  const ask = async (said) => {
    said = (said ?? text).trim()
    if (!said || busy) return
    setBusy(true); setError(null); setText('')
    const mine = { who: 'you', text: said }
    const history = thread.filter((m) => m.text).map((m) => ({ who: m.who, text: m.text }))
    remember([...thread, mine])
    try {
      const r = await fetch('/api/dashboard/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: said, history }),
      })
      if (!r.ok) {
        let reason = null
        try { reason = (await r.json())?.error } catch { /* no body */ }
        const known = REASONS[reason] || DB_REASONS[reason]
        setError(known || (r.status === 401
          ? { title: 'Signed out', fix: 'Sign in again to carry on.' }
          : { title: 'Could not read that', fix: 'Try again, or use the form.' }))
        return
      }
      const { proposal } = await r.json()
      const reply = proposal.kind === 'answer'
        ? { who: 'turnup', text: proposal.say }
        : proposal.kind === 'unclear'
          ? { who: 'turnup', text: `${proposal.say} ${proposal.question}`.trim() }
          : { who: 'turnup', text: proposal.say, proposal, state: 'open' }
      remember([...thread, mine, reply])
    } catch {
      setError({ title: 'Could not reach the server', fix: 'Check your connection and try again.' })
    } finally { setBusy(false) }
  }

  const settle = (index, state) => remember(thread.map((m, i) => (i === index ? { ...m, state } : m)))

  const confirm = async (index) => {
    const m = thread[index]
    const p = m?.proposal
    if (!p || busy) return
    setBusy(true)
    try {
      const f = p.fields
      let ok = false
      if (p.kind === 'create_job') {
        ok = await onCreate({
          sm8JobNumber: f.sm8JobNumber || '',
          customerName: f.customerName || '', customerPhone: f.customerPhone || '',
          jobSummary: f.jobSummary || '', jobAddress: f.jobAddress || '', jobRef: f.jobRef || '',
          scheduledFor: f.scheduledFor || '',
          stage: f.stage || 'BOOKED', stageNote: f.stageNote || '',
          windowStart: timeOn(f.scheduledFor, f.windowStart), windowEnd: timeOn(f.scheduledFor, f.windowEnd),
          position: f.position || null,
        })
      } else if (p.kind === 'update_job') {
        const job = jobs.find((j) => j.id === p.jobId)
        const day = f.scheduledFor || (job?.scheduledFor ? new Date(job.scheduledFor).toISOString().slice(0, 10) : null)
        // Running late is its own request on the server, so it goes first and
        // on its own; the rest follows as one patch.
        if (f.lateMinutes || f.clearLate) {
          ok = await onUpdate(p.jobId, { lateMinutes: f.clearLate ? null : f.lateMinutes })
          if (!ok) return
        }
        const body = {}
        for (const key of ['customerName', 'jobSummary', 'jobAddress', 'jobRef', 'stage', 'stageNote', 'position', 'scheduledFor']) {
          if (f[key] !== undefined) body[key] = f[key]
        }
        if (f.windowAgree) body.windowAgree = true
        else if (f.windowClear) body.windowClear = true
        else {
          if (f.windowStart) body.windowStart = timeOn(day, f.windowStart)
          if (f.windowEnd) body.windowEnd = timeOn(day, f.windowEnd)
        }
        ok = Object.keys(body).length ? await onUpdate(p.jobId, body) : true
      }
      if (ok) settle(index, 'done')
    } finally { setBusy(false) }
  }

  const jobLine = (id) => {
    const j = jobs.find((x) => x.id === id)
    if (!j) return null
    return `${j.customerName || 'Unnamed customer'}${j.jobRef ? ` · #${j.jobRef}` : ''}${j.jobAddress ? ` — ${j.jobAddress}` : ''}`
  }

  return (
    <section className="glass r-outer mt-5 p-4">
      {thread.length === 0 && (
        <p className="mb-2 text-[14px] muted">Ask it or tell it.</p>
      )}

      {thread.length > 0 && (
        <ol className="mb-3 space-y-2.5">
          {thread.map((m, i) => (
            <li key={i} className={m.who === 'you' ? 'flex justify-end' : ''}>
              {m.who === 'you' ? (
                <p className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-[15px]"
                   style={{ background: 'var(--mts-accent)', color: '#fff' }}>{m.text}</p>
              ) : (
                <div className="max-w-[92%]">
                  <p className="rounded-2xl rounded-bl-md px-3.5 py-2 text-[15px] whitespace-pre-line"
                     style={{ background: 'rgb(var(--glass-line) / 0.09)' }}>{m.text}</p>
                  {m.proposal && (
                    <div className={`r-inner mt-2 p-3.5 ${m.proposal.fields?.stage ? `tone-${STAGES[m.proposal.fields.stage]?.tone}` : ''}`}
                         style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
                      {m.proposal.kind === 'update_job' && jobLine(m.proposal.jobId) && (
                        <p className="text-[13px] font-semibold muted">{jobLine(m.proposal.jobId)}</p>
                      )}
                      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                        {rows(m.proposal.fields).map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="muted">{k}</dt>
                            <dd className="min-w-0 break-words font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {(m.proposal.warnings || []).map((w) => WARNINGS[w] && (
                        <p key={w} className="mt-2 text-[13px] muted">{WARNINGS[w]}</p>
                      ))}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.state === 'done' ? (
                          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: 'var(--stage-done)' }}>
                            <TickIcon size={15} /> Done
                          </span>
                        ) : m.state === 'dropped' ? (
                          <span className="text-[14px] muted">Not done</span>
                        ) : (
                          <>
                            <button type="button" onClick={() => confirm(i)} disabled={busy} className="btn btn-filled !min-h-[40px] !px-4 !text-[14px]">
                              <TickIcon size={15} /> {m.proposal.kind === 'create_job' ? 'Create the job' : 'Confirm'}
                            </button>
                            <button type="button" onClick={() => settle(i, 'dropped')} disabled={busy} className="btn btn-grey !min-h-[40px] !px-3.5 !text-[14px]">Not that</button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
          <li ref={endRef} aria-hidden="true" />
        </ol>
      )}

      {error && (
        <div className="r-inner mb-3 px-4 py-3" style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          <p className="text-[14px] font-semibold">{error.title}</p>
          {error.fix && <p className="mt-0.5 text-[13px]">{error.fix}</p>}
        </div>
      )}

      {/* What you would most likely say right now: a customer waiting on an
          answer first, then the job you are moving, then the time of day.
          See suggestions() in src/lib/tips.js. One tap sends it. */}
      {!busy && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestions({ jobs, setup }).map((h) => (
            <button key={h} type="button" onClick={() => ask(h)}
                    className="btn btn-grey !min-h-[34px] !rounded-full !px-3 !text-[13px]">{h}</button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea value={text} rows={1} aria-label="Ask or tell TurnUp"
                  placeholder={busy ? 'Reading it…' : 'Ask or tell TurnUp'}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
                  className="field !min-h-[48px] flex-1 resize-none" />
        <button type="button" onClick={() => ask()} disabled={busy || !text.trim()} aria-label="Send"
                className="btn btn-filled !min-h-[48px] !w-12 !px-0">
          <MessageIcon size={18} />
        </button>
      </div>
      {thread.length > 0 && (
        <button type="button" onClick={() => remember([])} className="mt-2 text-[12px] muted underline">Clear this chat</button>
      )}
    </section>
  )
}
