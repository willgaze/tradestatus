'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import { timeOnly, dayOnly, dayAndTime, dayNumber } from '@/lib/when'
import AccessNotes from './AccessNotes'
import Presence from './Presence'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import { StageIcon, PhoneIcon, PinIcon, ChevronIcon, WaveIcon, VanIcon } from '@/components/icons'
import { windowLabel, positionLabel } from '@/lib/calendar'

export default function StatusTracker({ initialStatus, initialProfile }) {
  const [status, setStatus] = useState(initialStatus)
  const [profile, setProfile] = useState(initialProfile || null)
  const [pulse, setPulse] = useState(false)
  const [checkedAt, setCheckedAt] = useState(null)
  const [isApple, setIsApple] = useState(false)
  const chrome = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/status/${initialStatus.code}`, { cache: 'no-store' })
      if (!r.ok) return
      const { status: next, profile: nextProfile } = await r.json()
      setProfile(nextProfile || null)
      setCheckedAt(new Date())
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

  // Which maps app the address should open in. Decided after mount, because
  // the server cannot know what the customer is holding — and a guess rendered
  // on the server is a hydration mismatch.
  useEffect(() => { setIsApple(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)) }, [])

  const stage = stageOf(status.stage)
  const step = STAGE_ORDER.indexOf(stage.key)
  const isPaused = stage.key === 'PAUSED'
  const isLive = stage.key === 'ON_MY_WAY' || stage.key === 'ON_SITE'

  // Tint the browser's own chrome to match the page. The blend is computed by
  // the stylesheet so the stage colour stays defined in one place — but a
  // custom property computes to its own text rather than to a colour, so it
  // has to be read back off something that actually paints.
  useEffect(() => {
    const probe = chrome.current
    if (!probe) return
    const colour = getComputedStyle(probe).backgroundColor
    if (!colour || colour === 'rgba(0, 0, 0, 0)') return
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', colour)
  }, [status.stage])

  // Paused deliberately does not light On site: a job can be paused before
  // anyone has arrived, and lighting it would say someone is there.
  const reached = isPaused ? STAGE_ORDER.indexOf('ON_MY_WAY') : step
  const fill = (reached / (STAGE_ORDER.length - 1)) * 100

  const mapsHref = status.jobAddress
    ? isApple
      ? `https://maps.apple.com/?q=${encodeURIComponent(status.jobAddress)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(status.jobAddress)}`
    : null

  return (
    <div className={`relative min-h-screen tone-${stage.tone}`}>
      <div className="stage-wash" aria-hidden="true" />
      {/* Paints the blended chrome colour so it can be read back as an rgb(). */}
      <div ref={chrome} aria-hidden="true" className="pointer-events-none fixed h-px w-px opacity-0"
           style={{ backgroundColor: 'color-mix(in srgb, var(--tint) 14%, var(--mts-bg))' }} />

      <main className="relative z-10 mx-auto max-w-xl px-4 pb-14 pt-safe">
        <header className="animate-rise flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--tint)' }}>{TRADE_NAME}</p>
          <p className="flex shrink-0 items-center gap-1.5 text-[12px]" style={{ color: 'var(--label-3)' }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--tint)' }} />
            {checkedAt ? `Updated ${timeOnly(checkedAt)}` : 'Live'}
          </p>
        </header>

        <h1 className="animate-rise mt-3.5 text-[34px] font-bold leading-[1.08] tracking-[-0.02em]">
          {status.customerName ? `Hello ${status.customerName}` : 'Your job'}
        </h1>
        {status.jobSummary && <p className="mt-1 text-[17px] muted">{status.jobSummary}</p>}

        {/* The glance — the one thing they opened this for. */}
        <section
          aria-live="polite"
          className={`glass r-outer animate-rise mt-6 p-5 transition-transform duration-300 ${
            pulse ? 'scale-[1.02]' : 'scale-100'
          }`}
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-start gap-4">
            <span className="icon-well">
              <StageIcon tone={stage.tone} size={26} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[24px] font-bold leading-tight tracking-[-0.01em]">{stage.label}</p>
              <p className="mt-1 text-[17px] leading-snug muted">{stage.customerLine}</p>
            </div>
          </div>

          {status.stageNote && (
            <p className="r-inner mt-4 px-4 py-3 text-[16px] leading-snug"
               style={{ background: 'color-mix(in srgb, var(--tint) 11%, transparent)' }}>
              {status.stageNote}
            </p>
          )}

          {/* A record of what happened, never a prediction of what will. */}
          {status.arrivingAt && stage.key !== 'BOOKED' && (
            <p className="mt-3 text-[15px] muted">Set off at {timeOnly(status.arrivingAt)}.</p>
          )}

          {(windowLabel(status) || positionLabel(status.position)) && stage.key !== 'DONE' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {windowLabel(status) && (
                <span className="rounded-full px-3.5 py-1.5 text-[14px] font-semibold"
                      style={{ background: 'color-mix(in srgb, var(--tint) 14%, transparent)', color: 'var(--tint)' }}>
                  {windowLabel(status)}
                </span>
              )}
              {positionLabel(status.position) && (
                <span className="rounded-full px-3.5 py-1.5 text-[14px] font-semibold"
                      style={{ background: 'rgb(var(--glass-line) / 0.1)' }}>
                  {positionLabel(status.position)}
                </span>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="mt-7 px-1">
            <div className="relative">
              <div className="rail-track">
                <div className="rail-fill" style={{ width: `${fill}%` }} />
              </div>
              <ol className="relative flex justify-between">
                {STAGE_ORDER.map((s, i) => (
                  <li key={s}
                      aria-current={s === stage.key ? 'step' : undefined}
                      className={`rail-dot ${
                        i === reached && stage.key !== 'DONE' ? 'rail-dot-live'
                        : i <= reached ? 'rail-dot-done' : ''
                      }`} />
                ))}
              </ol>
            </div>
            <div className="mt-3 flex justify-between">
              {STAGE_ORDER.map((s, i) => (
                <span key={s}
                      className={`flex-1 text-[12px] ${
                        i === 0 ? 'text-left' : i === STAGE_ORDER.length - 1 ? 'text-right' : 'text-center'
                      }`}
                      style={s === stage.key
                        ? { color: 'var(--tint)', fontWeight: 600 }
                        : { color: 'var(--label-3)' }}>
                  {stageOf(s).label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Who is at the door — only once they are actually on the way. */}
        {profile && (profile.engineerName || profile.vehicle) && (
          <section className="glass r-outer animate-rise mt-4 p-5" style={{ animationDelay: '150ms' }}>
            <h2 className="text-[15px] font-semibold muted">Who to expect</h2>
            <div className="mt-4 flex items-center gap-4">
              {profile.engineerPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.engineerPhoto} alt={profile.engineerName || 'Your engineer'}
                     className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
                      style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
                  <WaveIcon size={28} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[20px] font-semibold">{profile.engineerName || 'Your engineer'}</p>
                {profile.aboutLine && <p className="text-[15px] muted">{profile.aboutLine}</p>}
              </div>
            </div>

            {(profile.vehicle || profile.vehicleReg) && (
              <div className="r-inner mt-5 flex items-center gap-4 p-4"
                   style={{ background: 'rgb(var(--glass-line) / 0.08)' }}>
                {profile.vehiclePhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.vehiclePhoto} alt={profile.vehicle || 'The van'}
                       className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl"
                        style={{ color: 'var(--tint)', background: 'rgb(var(--glass-line) / 0.07)' }}>
                    <VanIcon size={34} />
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

        {/* The details, as an inset grouped list — the shape iOS uses for facts. */}
        <section className="glass ios-list animate-rise mt-4" style={{ animationDelay: '120ms' }}>
          {status.scheduledFor && (
            <div className="ios-row">
              <span className="ios-row-label">Booked for</span>
              <span className="ios-row-value">
                {dayOnly(status.scheduledFor)}
                <span className="mt-0.5 block text-[13px] font-normal muted">
                  {windowLabel(status) || 'No arrival time is promised'}
                </span>
              </span>
            </div>
          )}
          {status.jobAddress && (
            <a className="ios-row" href={mapsHref} target="_blank" rel="noreferrer">
              <span className="ios-row-label">Address</span>
              <span className="ios-row-value inline-flex items-center gap-1.5" style={{ color: 'var(--tint)' }}>
                {status.jobAddress}
                <PinIcon size={16} />
              </span>
            </a>
          )}
          {status.jobRef && (
            <div className="ios-row">
              <span className="ios-row-label">Job reference</span>
              <span className="ios-row-value">{status.jobRef}</span>
            </div>
          )}
          {status.updatedAt && (
            <div className="ios-row">
              <span className="ios-row-label">Last updated</span>
              <span className="ios-row-value">{dayAndTime(status.updatedAt)}</span>
            </div>
          )}
        </section>

        {/* Calendar */}
        {status.scheduledFor && (
          <section className="animate-rise mt-4" style={{ animationDelay: '160ms' }}>
            <a href={`/api/status/${status.code}/calendar`}
               className="glass r-outer flex min-h-[64px] w-full items-center gap-4 px-5 transition-transform active:scale-[.99]">
              <CalendarGlyph date={status.scheduledFor} />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold">Put it in my calendar</span>
                <span className="block text-[14px] muted">
                  {windowLabel(status) || 'All day — no arrival time promised'}
                </span>
              </span>
              <ChevronIcon size={18} style={{ color: 'var(--label-3)' }} />
            </a>
          </section>
        )}

        {/* The question that saves a wasted trip */}
        {status.stage !== 'DONE' && (
          <Presence status={status} onSaved={(n) => setStatus((s) => ({ ...s, ...n }))} />
        )}

        {/* What the customer tells the trade */}
        <AccessNotes status={status} onSaved={(notes) => setStatus((s) => ({ ...s, ...notes }))} />

        {/* What has happened */}
        {status.events?.length > 0 && (
          <section className="glass r-outer animate-rise mt-4 p-5" style={{ animationDelay: '220ms' }}>
            <h2 className="text-[17px] font-semibold">What has happened</h2>
            <ol className="mt-4 space-y-4">
              {[...status.events].reverse().map((e, i, all) => {
                const s = stageOf(e.stage)
                return (
                  <li key={`${e.stage}-${e.at}-${i}`} className={`relative flex gap-3.5 tone-${s.tone}`}>
                    {/* The line joining one entry to the next, never past the last. */}
                    {i < all.length - 1 && (
                      <span aria-hidden="true"
                            className="absolute left-[1.0625rem] top-9 h-[calc(100%-1rem)] w-px"
                            style={{ background: 'rgb(var(--glass-line) / 0.3)' }} />
                    )}
                    <span className="grid h-[2.125rem] w-[2.125rem] flex-none place-items-center rounded-full"
                          style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
                      <StageIcon tone={s.tone} size={18} />
                    </span>
                    <span className="min-w-0 flex-1 pt-1">
                      <span className="block text-[16px] font-semibold leading-tight">{s.label}</span>
                      <span className="mt-0.5 block text-[13px]" style={{ color: 'var(--label-3)' }}>
                        {dayAndTime(e.at)}
                      </span>
                      {e.note && <span className="mt-1.5 block text-[15px] leading-snug muted">{e.note}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Contact */}
        {TRADE_PHONE && (
          <section className="animate-rise mt-5" style={{ animationDelay: '260ms' }}>
            <a href={`tel:${TRADE_PHONE_TEL}`} className="btn btn-filled w-full">
              <PhoneIcon size={19} />
              Call {TRADE_PHONE}
            </a>
            <p className="mt-3 text-center text-[15px] leading-snug muted">
              Need to change something? Call or message {TRADE_NAME} — it is the same person doing the work.
            </p>
          </section>
        )}

        <p className="mt-8 text-center text-[13px] muted">This page updates itself.</p>
        <span className="mt-3 flex items-center justify-center gap-2 opacity-60">
          <Mark className="h-4 w-auto" id="foot" />
          <span className="text-[12px] muted">Job tracking by My Trade Status</span>
        </span>
        <span className="mt-2 flex justify-center pb-safe"><BuildStamp /></span>
      </main>
    </div>
  )
}

// A little tear-off calendar, so the date is readable before the words are.
// The tear-off strip wears the stage tint, so it belongs to the page it is on.
function CalendarGlyph({ date }) {
  return (
    <span className="grid h-11 w-11 shrink-0 grid-rows-[13px_1fr] overflow-hidden rounded-xl"
          style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--glass-line) / var(--glass-line-alpha))' }}>
      <span style={{ background: 'var(--tint)' }} />
      <span className="grid place-items-center text-[17px] font-bold leading-none">
        {dayNumber(date)}
      </span>
    </span>
  )
}
