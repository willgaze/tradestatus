'use client'

import { useCallback, useEffect, useState } from 'react'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import AccessNotes from './AccessNotes'
import Mark from '@/components/Mark'
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

      {/* who is at the door — only once they are actually on the way */}
      {profile && (profile.engineerName || profile.vehicle) && (
        <section className="surface animate-rise mt-4 rounded-4xl p-6 shadow-card" style={{ animationDelay: '150ms' }}>
          <h2 className="text-[15px] font-semibold muted">Who to expect</h2>
          <div className="mt-4 flex items-center gap-4">
            {profile.engineerPhoto ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.engineerPhoto} alt={profile.engineerName || 'Your engineer'}
                   className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-50 text-[24px] dark:bg-white/5">
                👋
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[20px] font-semibold">{profile.engineerName || 'Your engineer'}</p>
              {profile.aboutLine && <p className="text-[15px] muted">{profile.aboutLine}</p>}
            </div>
          </div>

          {(profile.vehicle || profile.vehicleReg) && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-black/[.035] p-4 dark:bg-white/[.05]">
              {profile.vehiclePhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.vehiclePhoto} alt={profile.vehicle || 'The van'}
                     className="h-16 w-24 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-black/[.05] text-[26px] dark:bg-white/[.06]">
                  🚐
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[13px] muted">Look out for</p>
                {profile.vehicle && <p className="text-[17px] font-semibold">{profile.vehicle}</p>}
                {profile.vehicleReg && (
                  /* Set like a plate, because that is how it will be read from a window */
                  <p className="mt-1 inline-block rounded-md bg-[#f5d32a] px-2 py-0.5 font-mono text-[15px] font-bold tracking-wide text-black">
                    {profile.vehicleReg}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* the details */}
      <section className="surface animate-rise mt-4 rounded-4xl shadow-card" style={{ animationDelay: '120ms' }}>
        {status.scheduledFor && (
          <Row label="Booked for"
               value={day(status.scheduledFor)}
               hint={windowLabel(status) || 'No arrival time is promised'} />
        )}
        {status.jobAddress && <Row label="Address" value={status.jobAddress} />}
        {status.jobRef && <Row label="Job reference" value={status.jobRef} />}
        {status.updatedAt && <Row label="Last updated" value={dayAndTime(status.updatedAt)} last />}
      </section>

      {/* calendar */}
      {status.scheduledFor && (
        <section className="animate-rise mt-4" style={{ animationDelay: '160ms' }}>
          <a href={icsUrl}
             className="surface flex min-h-[60px] w-full items-center gap-4 rounded-4xl px-5 shadow-card active:scale-[.99] transition-transform">
            <CalendarGlyph date={new Date(status.scheduledFor)} />
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold">Put it in my calendar</span>
              <span className="block text-[14px] muted">{windowLabel(status) || "All day — no arrival time promised"}</span>
            </span>
            <span className="muted text-[22px] leading-none">›</span>
          </a>
        </section>
      )}

      {/* what the customer tells the trade */}
      <AccessNotes status={status} onSaved={(notes) => setStatus((s) => ({ ...s, ...notes }))} />

      {/* what has happened */}
      {status.events?.length > 0 && (
        <section className="surface animate-rise mt-4 rounded-4xl p-6 shadow-card" style={{ animationDelay: '220ms' }}>
          <h2 className="text-[17px] font-semibold">What has happened</h2>
          <ol className="mt-4 space-y-4">
            {[...status.events].reverse().map((e, i) => {
              const s = stageOf(e.stage)
              const t = TONE[s.tone] || TONE.booked
              return (
                <li key={`${e.stage}-${e.at}-${i}`} className="flex gap-3.5">
                  <span className="relative flex flex-col items-center">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${t.dot}`} />
                    {i < status.events.length - 1 && <span className="mt-1 w-px flex-1 bg-black/[.09] dark:bg-white/10" />}
                  </span>
                  <span className="min-w-0 pb-1">
                    <span className="block text-[16px] font-semibold">{s.label}</span>
                    <span className="block text-[14px] muted">{dayAndTime(e.at)}</span>
                    {e.note && <span className="mt-1 block text-[15px]">{e.note}</span>}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* contact */}
      {TRADE_PHONE && (
        <section className="animate-rise mt-4 overflow-hidden rounded-4xl bg-brand-700 p-6 text-white shadow-lift"
                 style={{ animationDelay: '260ms' }}>
          <h2 className="text-[19px] font-semibold">Need to change something?</h2>
          <p className="mt-1.5 text-[16px] text-white/85">
            Call or message {TRADE_NAME} — it is the same person doing the work.
          </p>
          <a href={`tel:${TRADE_PHONE_TEL}`}
             className="mt-5 flex min-h-[54px] items-center justify-center rounded-2xl bg-white text-[17px] font-semibold text-brand-700 active:scale-[.99] transition-transform">
            Call {TRADE_PHONE}
          </a>
        </section>
      )}

      <p className="mt-8 text-center text-[13px] muted">This page updates itself.</p>
      <span className="mt-3 flex items-center justify-center gap-2 pb-safe opacity-60">
        <Mark className="h-4 w-auto" id="foot" />
        <span className="text-[12px] muted">Job tracking by My Trade Status</span>
      </span>
    </main>
  )
}

function Row({ label, value, hint, last }) {
  return (
    <div className={`px-6 py-4 ${last ? '' : 'border-b hairline'}`}>
      <p className="text-[13px] muted">{label}</p>
      <p className="mt-0.5 text-[17px] font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-[14px] muted">{hint}</p>}
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
