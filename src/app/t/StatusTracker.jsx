'use client'

import { useCallback, useEffect, useState } from 'react'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import AccessNotes from './AccessNotes'
import Presence from './Presence'
import Disclosure from '@/components/Disclosure'
import { presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import { windowLabel, positionLabel } from '@/lib/calendar'

const TONE = {
  booked: { dot: 'bg-stage-booked', text: 'text-stage-booked', soft: 'bg-slate-500/10' },
  onway:  { dot: 'bg-stage-onway',  text: 'text-stage-onway',  soft: 'bg-amber-500/10' },
  onsite: { dot: 'bg-stage-onsite', text: 'text-stage-onsite', soft: 'bg-blue-500/10' },
  paused: { dot: 'bg-stage-paused', text: 'text-stage-paused', soft: 'bg-orange-600/10' },
  done:   { dot: 'bg-stage-done',   text: 'text-stage-done',   soft: 'bg-green-600/10' },
}

const time = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const dayAndTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
const day = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export default function StatusTracker({ initialStatus, initialProfile }) {
  const [status, setStatus] = useState(initialStatus)
  const [profile, setProfile] = useState(initialProfile || null)
  const [pulse, setPulse] = useState(false)
  // Which rows are open. Nothing is, at rest: the page is a glance and a list.
  const [openRow, setOpenRow] = useState(null)
  const toggle = (k) => setOpenRow((o) => (o === k ? null : k))

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/status/${initialStatus.code}`, { cache: 'no-store' })
      if (!r.ok) return
      const { status: next, profile: nextProfile } = await r.json()
      setProfile(nextProfile || null)
      setStatus((prev) => {
        // Flash the card only when the stage actually moves, not on every poll.
        if (next.stage !== prev.stage) { setPulse(true); setTimeout(() => setPulse(false), 700) }
        return next
      })
    } catch { /* a failed poll is not worth telling anyone about */ }
  }, [initialStatus.code])

  useEffect(() => {
    const timer = setInterval(refresh, 30000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh])

  const stage = stageOf(status.stage)
  const tone = TONE[stage.tone] || TONE.booked
  const step = STAGE_ORDER.indexOf(stage.key)
  const isLive = stage.key === 'ON_MY_WAY' || stage.key === 'ON_SITE'
  const icsUrl = `/api/status/${status.code}/calendar`

  return (
    <main className="mx-auto max-w-xl px-5 pb-16 pt-safe">
      {/* who is coming — the only thing the customer cares about first */}
      <header className="animate-rise pt-2">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-600">
          {TRADE_NAME}
        </p>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
          {status.customerName ? `Hello ${status.customerName}` : 'Your job'}
        </h1>
        {status.jobSummary && <p className="mt-1.5 text-[17px] muted">{status.jobSummary}</p>}
      </header>

      {/* the glance */}
      <section
        className={`surface animate-rise mt-6 rounded-4xl p-6 shadow-card transition-transform duration-300 ${
          pulse ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={{ animationDelay: '60ms' }}
      >
        <div className="flex items-start gap-4">
          <span className="relative mt-1.5 flex h-3.5 w-3.5 shrink-0">
            {isLive && <span className={`absolute inline-flex h-full w-full rounded-full ${tone.dot} animate-ring`} />}
            <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${tone.dot}`} />
          </span>
          <div className="min-w-0">
            <p className={`text-[15px] font-semibold ${tone.text}`}>{stage.label}</p>
            <p className="mt-1 text-[22px] font-semibold leading-snug tracking-[-0.01em]">
              {stage.customerLine}
            </p>
            {status.stageNote && (
              <p className={`mt-4 rounded-2xl px-4 py-3 text-[16px] ${tone.soft}`}>{status.stageNote}</p>
            )}
            {status.arrivingAt && stage.key !== 'BOOKED' && (
              <p className="mt-3 text-[15px] muted">Set off at {time(status.arrivingAt)}.</p>
            )}

            {(windowLabel(status) || positionLabel(status.position)) && stage.key !== 'DONE' && (
              <div className="mt-4 flex flex-wrap gap-2">
                {windowLabel(status) && (
                  <span className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold ${tone.soft} ${tone.text}`}>
                    {windowLabel(status)}
                  </span>
                )}
                {positionLabel(status.position) && (
                  <span className="rounded-full bg-black/[.05] px-3.5 py-1.5 text-[14px] font-semibold dark:bg-white/[.07]">
                    {positionLabel(status.position)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* progress */}
        <div className="mt-7">
          <div className="flex items-center">
            {STAGE_ORDER.map((s, i) => (
              <div key={s} className={`flex items-center ${i ? 'flex-1' : ''}`}>
                {i > 0 && (
                  <div className="mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                    <div className={`h-full rounded-full transition-all duration-700 ${i <= step ? tone.dot : ''}`}
                         style={{ width: i <= step ? '100%' : '0%' }} />
                  </div>
                )}
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-500 ${
                  i <= step ? tone.dot : 'bg-black/[.12] dark:bg-white/15'}`} />
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex justify-between text-[12px] muted">
            {STAGE_ORDER.map((s, i) => (
              <span key={s} className={i === step ? 'font-semibold text-[color:var(--mts-text)]' : ''}>
                {stageOf(s).label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* the rows. Closed, each says the one thing worth knowing. */}
      <div className="mt-4 space-y-3">

        {profile && (profile.engineerName || profile.vehicle) && (
          <Disclosure icon="👋" title="Who to expect" delay="120ms"
                      summary={[profile.engineerName, profile.vehicle].filter(Boolean).join(' · ')}
                      open={openRow === 'who'} onToggle={() => toggle('who')}>
            <div className="flex items-center gap-4">
              {profile.engineerPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.engineerPhoto} alt={profile.engineerName || 'Your engineer'}
                     className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-50 text-[24px] dark:bg-white/5">👋</span>
              )}
              <div className="min-w-0">
                <p className="text-[19px] font-semibold">{profile.engineerName || 'Your engineer'}</p>
                {profile.aboutLine && <p className="text-[14px] muted">{profile.aboutLine}</p>}
              </div>
            </div>
            {(profile.vehicle || profile.vehicleReg) && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-black/[.035] p-4 dark:bg-white/[.05]">
                {profile.vehiclePhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.vehiclePhoto} alt={profile.vehicle || 'The van'}
                       className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-black/[.05] text-[26px] dark:bg-white/[.06]">🚐</span>
                )}
                <div className="min-w-0">
                  <p className="text-[13px] muted">Look out for</p>
                  {profile.vehicle && <p className="text-[16px] font-semibold">{profile.vehicle}</p>}
                  {profile.vehicleReg && (
                    <p className="mt-1 inline-block rounded-md bg-[#f5d32a] px-2 py-0.5 font-mono text-[15px] font-bold tracking-wide text-black">
                      {profile.vehicleReg}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Disclosure>
        )}

        {status.stage !== 'DONE' && (() => {
          const cur = presenceOf(status.presence)
          const fresh = presenceIsFresh(status.presenceAt)
          const answered = cur && fresh
          return (
            <Disclosure icon="🏠" title="Will someone be in?" delay="150ms" accent={!answered}
                        summary={answered
                          ? `You said: ${cur.short}${status.presenceNote ? ` — ${status.presenceNote}` : ''} · ${presenceAgeLabel(status.presenceAt)}`
                          : 'Tap to answer — saves them a wasted trip'}
                        open={openRow === 'in'} onToggle={() => toggle('in')}>
              <Presence status={status} onSaved={(n) => setStatus((s) => ({ ...s, ...n }))} />
            </Disclosure>
          )
        })()}

        <Disclosure icon="📍" title="The job" delay="180ms"
                    summary={[
                      status.scheduledFor && day(status.scheduledFor),
                      status.jobAddress,
                    ].filter(Boolean).join(' · ')}
                    open={openRow === 'job'} onToggle={() => toggle('job')}>
          <dl className="space-y-3.5">
            {status.scheduledFor && (
              <Row label="Booked for" value={day(status.scheduledFor)}
                   hint={windowLabel(status) || 'No arrival time is promised'} />
            )}
            {status.jobAddress && <Row label="Address" value={status.jobAddress} />}
            {status.jobSummary && <Row label="Work" value={status.jobSummary} />}
            {status.jobRef && <Row label="Job reference" value={status.jobRef} />}
            {status.updatedAt && <Row label="Last updated" value={dayAndTime(status.updatedAt)} />}
          </dl>
          {status.scheduledFor && (
            <a href={icsUrl}
               className="mt-5 flex min-h-[52px] items-center gap-3 rounded-2xl bg-black/[.04] px-4 dark:bg-white/[.06]">
              <CalendarGlyph date={new Date(status.scheduledFor)} />
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold">Put it in my calendar</span>
                <span className="block text-[13px] muted">{windowLabel(status) || 'All day — no arrival time promised'}</span>
              </span>
              <span className="muted text-[20px]">›</span>
            </a>
          )}
        </Disclosure>

        <Disclosure icon="🔑" title="Help them find you" delay="210ms"
                    summary={(status.doorToUse || status.petsOnSite || status.what3words || status.accessNotes)
                      ? 'Saved — tap to change'
                      : 'Which door, parking, the dog'}
                    open={openRow === 'find'} onToggle={() => toggle('find')}>
          <AccessNotes status={status} onSaved={(notes) => setStatus((s) => ({ ...s, ...notes }))} />
        </Disclosure>

        {status.events?.length > 0 && (
          <Disclosure icon="🕒" title="What has happened" delay="240ms"
                      summary={`${status.events.length} update${status.events.length === 1 ? '' : 's'} · last ${time(status.events[status.events.length - 1].at)}`}
                      open={openRow === 'log'} onToggle={() => toggle('log')}>
            <ol className="space-y-4">
              {[...status.events].reverse().map((e, i) => {
                const s2 = stageOf(e.stage)
                const t = TONE[s2.tone] || TONE.booked
                return (
                  <li key={`${e.stage}-${e.at}-${i}`} className="flex gap-3.5">
                    <span className="relative flex flex-col items-center">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${t.dot}`} />
                      {i < status.events.length - 1 && <span className="mt-1 w-px flex-1 bg-black/[.09] dark:bg-white/10" />}
                    </span>
                    <span className="min-w-0 pb-1">
                      <span className="block text-[16px] font-semibold">{s2.label}</span>
                      <span className="block text-[14px] muted">{dayAndTime(e.at)}</span>
                      {e.note && <span className="mt-1 block text-[15px]">{e.note}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Disclosure>
        )}
      </div>

      {/* the one action that is never hidden */}
      {TRADE_PHONE && (
        <a href={`tel:${TRADE_PHONE_TEL}`}
           className="animate-rise mt-5 flex min-h-[58px] items-center justify-center gap-2 rounded-4xl bg-brand-700 text-[17px] font-semibold text-white shadow-lift transition-transform active:scale-[.99]"
           style={{ animationDelay: '270ms' }}>
          Call {TRADE_NAME.split(' ')[0]} · {TRADE_PHONE}
        </a>
      )}

      <p className="mt-8 text-center text-[13px] muted">This page updates itself.</p>
      <span className="mt-3 flex items-center justify-center gap-2 pb-safe opacity-60">
        <Mark className="h-4 w-auto" id="foot" />
        <span className="text-[12px] muted">Job tracking by My Trade Status</span>
      </span>
      <span className="mt-2 flex justify-center pb-safe"><BuildStamp /></span>
    </main>
  )
}

function Row({ label, value, hint }) {
  return (
    <div>
      <dt className="text-[13px] muted">{label}</dt>
      <dd className="mt-0.5 text-[16px] font-semibold">{value}</dd>
      {hint && <dd className="mt-0.5 text-[13px] muted">{hint}</dd>}
    </div>
  )
}

// A little tear-off calendar, so the date is readable before the words are.
function CalendarGlyph({ date }) {
  return (
    <span className="grid h-11 w-11 shrink-0 grid-rows-[14px_1fr] overflow-hidden rounded-xl border hairline">
      <span className="bg-brand-600" />
      <span className="grid place-items-center text-[17px] font-bold leading-none">
        {date.getDate()}
      </span>
    </span>
  )
}
