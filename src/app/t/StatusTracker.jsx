'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import AccessNotes from './AccessNotes'
import Presence from './Presence'
import Notify, { PUSH_CONFIGURED } from './Notify'
import Window from './Window'
import { readOwn } from './own-answers'
import Disclosure from '@/components/Disclosure'
import { presenceOf, presenceIsFresh, presenceAgeLabel } from '@/lib/presence'
import Mark from '@/components/Mark'
import BuildStamp from '@/components/BuildStamp'
import { windowLabel, positionLabel } from '@/lib/calendar'
import { windowSummary } from '@/lib/window'
import { w3wUrl, mapsSearchUrl } from '@/lib/places'
import { timeOnly, dayOnly, dayAndTime, dayNumber } from '@/lib/when'
import { StageIcon, PhoneIcon, PinIcon, KeyIcon, HouseIcon, WaveIcon, VanIcon, ClockIcon, ChevronIcon, CompassIcon, BellIcon } from '@/components/icons'

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

  // What THIS device told the trade. The server does not hand it back — a
  // tracking link gets forwarded, and the customer's own answers are not for
  // whoever it reaches. See ./own-answers.js. Read after mount: the server has
  // no localStorage, and anything guessed during the server render tears
  // hydration apart.
  const [own, setOwn] = useState({})
  useEffect(() => { setOwn(readOwn(initialStatus.code)) }, [initialStatus.code])

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
            <p className="text-[26px] font-bold leading-tight tracking-[-0.01em]">{stage.label}</p>
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
          /* Two facts that usually fit on one line and sometimes do not. A
             flex row with a gap gives the browser somewhere to break, and
             nowrap on each keeps a part whole — left to itself it broke "You
             are / 2nd today", and forced onto one line it ran off the card. */
          <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {windowLabel(status) && (
              <span className="whitespace-nowrap text-[15px] font-semibold" style={{ color: 'var(--tint)' }}>
                {windowLabel(status)}
              </span>
            )}
            {positionLabel(status.position) && (
              <span className="whitespace-nowrap text-[14px] font-medium muted">{positionLabel(status.position)}</span>
            )}
          </p>
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
          {/* Only the stage it is at is named. The heading above is already
              the largest thing on the page and says the same word. */}
          <div className="mt-2.5 flex justify-between">
            {STAGE_ORDER.map((s, i) => (
              <span key={s}
                    className={`flex-1 text-[12px] ${
                      i === 0 ? 'text-left' : i === STAGE_ORDER.length - 1 ? 'text-right' : 'text-center'}`}
                    style={{ color: 'var(--tint)', fontWeight: 600 }}>
                {s === stage.key ? stageOf(s).label : '\u00A0'}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* the rows. Closed, each says the one thing worth knowing. */}
      <div className="mt-4 space-y-3">

        {profile && (profile.engineerName || profile.vehicle) && (
          <Disclosure icon={<WaveIcon size={19} />} title="Who to expect" delay="120ms"
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
          // The TIME of the answer comes from the server; the ANSWER comes
          // from this device. So a forwarded link can see that the question
          // was answered, and never what the answer was.
          const cur = presenceOf(own.presence)
          const fresh = presenceIsFresh(status.presenceAt)
          const answered = Boolean(status.presenceAt) && fresh
          return (
            <Disclosure icon={<HouseIcon size={19} />} title="Will someone be in?" delay="150ms" accent={!answered}
                        summary={!answered
                          ? 'Tap to answer — saves them a wasted trip'
                          : cur
                            ? `You said: ${cur.short} · ${presenceAgeLabel(status.presenceAt)}`
                            : `Answered ${presenceAgeLabel(status.presenceAt)} — tap to change`}
                        open={openRow === 'in'} onToggle={() => toggle('in')}>
              <Presence status={status} own={own}
                        onSaved={(fromServer, mine) => {
                          setStatus((s) => ({ ...s, ...fromServer }))
                          setOwn(mine)
                        }} />
            </Disclosure>
          )
        })()}

        {/* Nothing more is going to happen on a finished job, so there is
            nothing to be told about — and nothing to be told WITH until the
            deployment has VAPID keys, which is why the row itself is gated and
            not just its contents. */}
        {PUSH_CONFIGURED && status.stage !== 'DONE' && (
          <Disclosure icon={<BellIcon size={19} />} title="Tell me when they set off" delay="165ms"
                      summary="Set off, arrived, done — straight to your phone"
                      open={openRow === 'notify'} onToggle={() => toggle('notify')}>
            <Notify code={status.code} />
          </Disclosure>
        )}

        {/* A window is an arrangement, so it sits with the things the customer
            does rather than the things they read. Hidden once the job is done:
            there is nothing left to arrange. */}
        {status.scheduledFor && stage.key !== 'DONE' && (() => {
          const win = status.window || {}
          const needsThem = win.state === 'PROPOSED' && win.by === 'TRADE'
          return (
            <Disclosure icon={<ClockIcon size={19} />} title="When suits you?" delay="172ms"
                        accent={needsThem || !win.state}
                        summary={windowSummary(win, 'CUSTOMER') || 'No hours set — tap to ask for some'}
                        open={openRow === 'when'} onToggle={() => toggle('when')}>
              <Window status={status} onSaved={(patch) => setStatus((s) => ({ ...s, ...patch }))} />
            </Disclosure>
          )
        })()}

        <Disclosure icon={<PinIcon size={19} />} title="The job" delay="180ms"
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
            {(status.jobAddress || own.what3words || own.mapPin) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {status.jobAddress && (
                  <a href={mapsSearchUrl(status.jobAddress)} target="_blank" rel="noreferrer"
                     className="btn btn-tinted !min-h-[40px] !px-3.5 !text-[14px]">
                    <CompassIcon size={15} /> Open in Maps
                  </a>
                )}
                {/* From this device's own memory, not from the page payload:
                    a precise location is the last thing that should ride on a
                    forwarded link. */}
                {own.what3words && (
                  <a href={w3wUrl(own.what3words)} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[40px] !px-3.5 !text-[14px]">
                    ///{own.what3words}
                  </a>
                )}
                {own.mapPin && (
                  <a href={own.mapPin} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[40px] !px-3.5 !text-[14px]">
                    <PinIcon size={15} /> Your pin
                  </a>
                )}
              </div>
            )}
            {/* The house and door photos are NOT shown here, and are not in
                the page payload at all. They are wayfinding for the trade,
                they are on the dashboard behind a password, and the customer
                already knows what their own front door looks like. A photo of
                it next to "nobody is in" and a time window, on a link that
                gets forwarded, is the one item on this page worth most to
                somebody who should not have it. */}
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

        <Disclosure icon={<KeyIcon size={19} />} title="Help them find you" delay="210ms"
                    summary={(own.doorToUse || own.petsOnSite || own.what3words || own.mapPin || own.accessNotes)
                      ? 'Sent — they have it. Tap to change'
                      : 'Which door, parking, the dog'}
                    open={openRow === 'find'} onToggle={() => toggle('find')}>
          <AccessNotes status={status} onSaved={(mine) => setOwn(mine)} />
        </Disclosure>

        {status.events?.length > 0 && (
          <Disclosure icon={<ClockIcon size={19} />} title="What has happened" delay="240ms"
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

      {/* Three stacked lines of small print were 95px of page doing the work of
          one. The reassurance is the only part the customer needs; the mark and
          the build stamp ride alongside it. */}
      <p className="mt-7 text-center text-[13px] muted">This page updates itself.</p>
      <span className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pb-safe opacity-60">
        <Mark className="h-3.5 w-auto" id="foot" />
        <span className="text-[12px] muted">Job tracking by My Trade Status</span>
        <BuildStamp compact />
      </span>
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
