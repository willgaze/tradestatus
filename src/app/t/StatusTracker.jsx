'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import AccessNotes from './AccessNotes'
import Presence from './Presence'
import Disclosure from '@/components/Disclosure'
import { presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import { windowLabel, positionLabel } from '@/lib/calendar'
import { w3wUrl, mapsSearchUrl } from '@/lib/places'
import { timeOnly, dayOnly, dayAndTime, dayNumber } from '@/lib/when'
import { StageIcon, PhoneIcon, PinIcon, KeyIcon, HouseIcon, WaveIcon, VanIcon, ClockIcon, ChevronIcon, CompassIcon } from '@/components/icons'

// Dates come from src/lib/when.js and never from toLocaleString(): this page
// renders on the server and again on the phone, and the two ship different
// locale data, which tore the page down mid-hydration.

export default function StatusTracker({ initialStatus, initialProfile, initialBrand }) {
  const [status, setStatus] = useState(initialStatus)
  const [profile, setProfile] = useState(initialProfile || null)
  const [brand, setBrand] = useState(initialBrand || null)
  const [pulse, setPulse] = useState(false)
  // Which rows are open. Nothing is, at rest: the page is a glance and a list.
  const [openRow, setOpenRow] = useState(null)
  const toggle = (k) => setOpenRow((o) => (o === k ? null : k))
  const chrome = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/status/${initialStatus.code}`, { cache: 'no-store' })
      if (!r.ok) return
      const { status: next, profile: nextProfile, brand: nextBrand } = await r.json()
      setProfile(nextProfile || null)
      setBrand(nextBrand || null)
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
  const step = STAGE_ORDER.indexOf(stage.key)
  const isPaused = stage.key === 'PAUSED'
  const icsUrl = `/api/status/${status.code}/calendar`

  // Paused deliberately does not light On site: a job can be paused before
  // anyone has arrived, and lighting it would say someone is there.
  const reached = isPaused ? STAGE_ORDER.indexOf('ON_MY_WAY') : step
  const fill = (reached / (STAGE_ORDER.length - 1)) * 100

  // Tint the browser's own chrome to match the page. The blend is computed by
  // the stylesheet so a stage colour stays defined in one place — but a custom
  // property computes to its own text rather than to a colour, so it has to be
  // read back off something that actually paints.
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

  return (
    <div className={`relative min-h-screen tone-${stage.tone}`}>
    <div className="stage-wash" aria-hidden="true" />
    <div ref={chrome} aria-hidden="true" className="pointer-events-none fixed h-px w-px opacity-0"
         style={{ backgroundColor: 'color-mix(in srgb, var(--tint) 14%, var(--mts-bg))' }} />
    <main className="relative z-10 mx-auto max-w-xl px-4 pb-16 pt-safe">
      {/* who is coming — the only thing the customer cares about first */}
      <header className="animate-rise">
        {brand?.logo ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logo} alt={TRADE_NAME} className="h-9 w-9 rounded-[10px] object-cover bg-white/60" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <p className="text-[15px] font-semibold" style={{ color: 'var(--tint)' }}>{TRADE_NAME}</p>
          </div>
        ) : (
          <p className="text-[15px] font-semibold" style={{ color: 'var(--tint)' }}>{TRADE_NAME}</p>
        )}
        <h1 className="mt-2 text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
          {status.customerName ? `Hello ${status.customerName}` : 'Your job'}
        </h1>
        {status.jobSummary && <p className="mt-1.5 text-[17px] muted">{status.jobSummary}</p>}
      </header>

      {/* the glance */}
      <section
        aria-live="polite"
        className={`glass r-outer animate-rise mt-6 p-5 transition-transform duration-300 ${
          pulse ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={{ animationDelay: '60ms' }}
      >
        <div className="flex items-start gap-4">
          <span className="icon-well"><StageIcon tone={stage.tone} size={26} /></span>
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

        {/* progress */}
        <div className="mt-7 px-1">
          <div className="relative">
            <div className="rail-track"><div className="rail-fill" style={{ width: `${fill}%` }} /></div>
            <ol className="relative flex justify-between">
              {STAGE_ORDER.map((s, i) => (
                <li key={s} aria-current={s === stage.key ? 'step' : undefined}
                    className={`rail-dot ${
                      i === reached && stage.key !== 'DONE' ? 'rail-dot-live'
                      : i <= reached ? 'rail-dot-done' : ''}`} />
              ))}
            </ol>
          </div>
          <div className="mt-3 flex justify-between">
            {STAGE_ORDER.map((s, i) => (
              <span key={s}
                    className={`flex-1 text-[12px] ${
                      i === 0 ? 'text-left' : i === STAGE_ORDER.length - 1 ? 'text-right' : 'text-center'}`}
                    style={s === stage.key
                      ? { color: 'var(--tint)', fontWeight: 600 }
                      : { color: 'var(--label-3)' }}>
                {stageOf(s).label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* the rows. Closed, each says the one thing worth knowing. */}
      <div className="mt-4 space-y-3">

        {profile && (profile.engineerName || profile.vehicle) && (
          <Disclosure icon={<WaveIcon size={21} />} title="Who to expect" delay="120ms"
                      summary={[profile.engineerName, profile.vehicle].filter(Boolean).join(' · ')}
                      open={openRow === 'who'} onToggle={() => toggle('who')}>
            <div className="flex items-center gap-4">
              {profile.engineerPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.engineerPhoto} alt={profile.engineerName || 'Your engineer'}
                     className="h-16 w-16 shrink-0 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
                      style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
                  <WaveIcon size={28} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[19px] font-semibold">{profile.engineerName || 'Your engineer'}</p>
                {profile.aboutLine && <p className="text-[14px] muted">{profile.aboutLine}</p>}
              </div>
            </div>
            {(profile.vehicle || profile.vehicleReg) && (
              <div className="r-inner mt-4 flex items-center gap-4 p-4"
                   style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
                {profile.vehiclePhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.vehiclePhoto} alt={profile.vehicle || 'The van'}
                       className="h-16 w-24 shrink-0 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl"
                        style={{ color: 'var(--tint)', background: 'rgb(var(--glass-line) / 0.08)' }}>
                    <VanIcon size={32} />
                  </span>
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
            <Disclosure icon={<HouseIcon size={21} />} title="Will someone be in?" delay="150ms" accent={!answered}
                        summary={answered
                          ? `You said: ${cur.short}${status.presenceNote ? ` — ${status.presenceNote}` : ''} · ${presenceAgeLabel(status.presenceAt)}`
                          : 'Tap to answer — saves them a wasted trip'}
                        open={openRow === 'in'} onToggle={() => toggle('in')}>
              <Presence status={status} onSaved={(n) => setStatus((s) => ({ ...s, ...n }))} />
            </Disclosure>
          )
        })()}

        <Disclosure icon={<PinIcon size={21} />} title="The job" delay="180ms"
                    summary={[
                      status.scheduledFor && dayOnly(status.scheduledFor),
                      status.jobAddress,
                    ].filter(Boolean).join(' · ')}
                    open={openRow === 'job'} onToggle={() => toggle('job')}>
          <dl className="space-y-3.5">
            {status.scheduledFor && (
              <Row label="Booked for" value={dayOnly(status.scheduledFor)}
                   hint={windowLabel(status) || 'No arrival time is promised'} />
            )}
            {status.jobAddress && <Row label="Address" value={status.jobAddress} />}
            {(status.jobAddress || status.what3words || status.mapPin) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {status.jobAddress && (
                  <a href={mapsSearchUrl(status.jobAddress)} target="_blank" rel="noreferrer"
                     className="btn btn-tinted !min-h-[40px] !px-3.5 !text-[14px]">
                    <CompassIcon size={15} /> Open in Maps
                  </a>
                )}
                {status.what3words && (
                  <a href={w3wUrl(status.what3words)} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[40px] !px-3.5 !text-[14px]">
                    ///{status.what3words}
                  </a>
                )}
                {status.mapPin && (
                  <a href={status.mapPin} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[40px] !px-3.5 !text-[14px]">
                    <PinIcon size={15} /> Your pin
                  </a>
                )}
              </div>
            )}
            {(status.housePhoto || status.doorPhoto) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[[status.housePhoto, 'The house from the road'], [status.doorPhoto, 'The door to come to']]
                  .filter(([src]) => src)
                  .map(([src, label]) => (
                    <figure key={label} className="min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={label} className="r-inner aspect-[4/3] w-full object-cover"
                           onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }} />
                      <figcaption className="mt-1 text-[13px] muted">{label}</figcaption>
                    </figure>
                  ))}
              </div>
            )}
            {status.jobSummary && <Row label="Work" value={status.jobSummary} />}
            {status.jobRef && <Row label="Job reference" value={status.jobRef} />}
            {status.updatedAt && <Row label="Last updated" value={dayAndTime(status.updatedAt)} />}
          </dl>
          {status.scheduledFor && (
            <a href={icsUrl}
               className="r-inner mt-5 flex min-h-[56px] items-center gap-3 px-4 transition-transform active:scale-[.99]"
               style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
              <CalendarGlyph date={status.scheduledFor} />
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold">Put it in my calendar</span>
                <span className="block text-[13px] muted">{windowLabel(status) || 'All day — no arrival time promised'}</span>
              </span>
              <ChevronIcon size={17} style={{ color: 'var(--label-3)' }} />
            </a>
          )}
        </Disclosure>

        <Disclosure icon={<KeyIcon size={21} />} title="Help them find you" delay="210ms"
                    summary={(status.doorToUse || status.petsOnSite || status.what3words || status.accessNotes)
                      ? 'Saved — tap to change'
                      : 'Which door, parking, the dog'}
                    open={openRow === 'find'} onToggle={() => toggle('find')}>
          <AccessNotes status={status} onSaved={(notes) => setStatus((s) => ({ ...s, ...notes }))} />
        </Disclosure>

        {status.events?.length > 0 && (
          <Disclosure icon={<ClockIcon size={21} />} title="What has happened" delay="240ms"
                      summary={`${status.events.length} update${status.events.length === 1 ? '' : 's'} · last ${timeOnly(status.events[status.events.length - 1].at)}`}
                      open={openRow === 'log'} onToggle={() => toggle('log')}>
            <ol className="space-y-4">
              {[...status.events].reverse().map((e, i, all) => {
                const s2 = stageOf(e.stage)
                return (
                  <li key={`${e.stage}-${e.at}-${i}`} className={`relative flex gap-3.5 tone-${s2.tone}`}>
                    {i < all.length - 1 && (
                      <span aria-hidden="true" className="absolute left-[1.0625rem] top-9 h-[calc(100%-1rem)] w-px"
                            style={{ background: 'rgb(var(--glass-line) / 0.3)' }} />
                    )}
                    <span className="grid h-[2.125rem] w-[2.125rem] flex-none place-items-center rounded-full"
                          style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
                      <StageIcon tone={s2.tone} size={18} />
                    </span>
                    <span className="min-w-0 flex-1 pt-1">
                      <span className="block text-[16px] font-semibold leading-tight">{s2.label}</span>
                      <span className="mt-0.5 block text-[13px]" style={{ color: 'var(--label-3)' }}>{dayAndTime(e.at)}</span>
                      {e.note && <span className="mt-1.5 block text-[15px] leading-snug muted">{e.note}</span>}
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
        <a href={`tel:${TRADE_PHONE_TEL}`} className="btn btn-filled animate-rise mt-5 w-full"
           style={{ animationDelay: '270ms' }}>
          <PhoneIcon size={19} className="shrink-0" />
          {/* The number is kept whole: split across two lines it stops being a
              phone number and becomes two half-numbers. */}
          <span>Call {TRADE_NAME.split(' ')[0]} · <span className="whitespace-nowrap">{TRADE_PHONE}</span></span>
        </a>
      )}

      <p className="mt-8 text-center text-[13px] muted">This page updates itself.</p>
      <span className="mt-3 flex items-center justify-center gap-2 pb-safe opacity-60">
        <Mark className="h-4 w-auto" id="foot" />
        <span className="text-[12px] muted">Job tracking by My Trade Status</span>
      </span>
      <span className="mt-2 flex justify-center pb-safe"><BuildStamp /></span>
    </main>
    </div>
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
    <span className="grid h-11 w-11 shrink-0 grid-rows-[13px_1fr] overflow-hidden rounded-xl"
          style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--glass-line) / var(--glass-line-alpha))' }}>
      <span style={{ background: 'var(--tint)' }} />
      <span className="grid place-items-center text-[17px] font-bold leading-none">
        {dayNumber(date)}
      </span>
    </span>
  )
}
