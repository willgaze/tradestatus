'use client'

import { useEffect, useState } from 'react'
import { PinIcon } from '@/components/icons'
import { W3W_SITE } from '@/lib/places'

/**
 * "I do not know my three words."
 *
 * The what3words box assumed you already had them. For the one person it is
 * for — somebody at a field gate with no house number — that is exactly the
 * assumption that does not hold.
 *
 * TWO VERSIONS OF THE SAME ANSWER, and which one shows depends on whether
 * anybody has paid what3words:
 *
 *   No key   a link to their site, which can find the phone itself. Two taps
 *            and a paste. A plain <a>, so nothing can block it.
 *   A key    one tap. The phone's own GPS, converted server-side, straight
 *            into the box.
 *
 * The link shows either way, because the GPS can fail and because a customer
 * sitting indoors on wifi may want to look at the map rather than trust a fix.
 *
 * WHY THE LINK IS A LINK AND NOT A BUTTON. Opening a tab after an await is a
 * popup, and iOS blocks popups that are not directly inside a tap. A real
 * anchor is never blocked, never needs permission, and works with JavaScript
 * having a bad day.
 *
 * ACCURACY, same rule as the pin: a phone indoors can be a hundred metres out,
 * and a what3words square is three metres. A fix that vague names the wrong
 * square with total confidence, so it is handed over with a warning that says
 * so rather than quietly written into the box.
 */

// Past this the square is likely a neighbour's, so say so.
const VAGUE_METRES = 60

export default function FindWords({ onWords }) {
  // null until asked, so nothing renders a button that might not work.
  const [configured, setConfigured] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)
  const [problem, setProblem] = useState(null)

  useEffect(() => {
    let live = true
    fetch('/api/w3w')
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => live && setConfigured(Boolean(j?.configured)))
      .catch(() => live && setConfigured(false))
    return () => { live = false }
  }, [])

  const find = () => {
    setProblem(null); setNote(null)
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return setProblem('This browser cannot give a location. Use the link below instead.')
    }
    if (!window.isSecureContext) {
      return setProblem('Location needs a secure connection. Use the link below instead.')
    }

    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const metres = Math.round(coords.accuracy || 0)
        try {
          const r = await fetch('/api/w3w', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: coords.latitude, lng: coords.longitude }),
          })
          const data = await r.json().catch(() => ({}))
          if (!r.ok || !data?.words) throw new Error('lookup')
          onWords?.(data.words)
          setNote(
            metres > VAGUE_METRES
              ? `Found ///${data.words}, but your phone is only sure to about ${metres}m — a square that size over is the wrong one. Worth redoing outside and checking it on the map.`
              : `Found ///${data.words}${metres ? `, accurate to about ${metres}m` : ''}.`,
          )
        } catch {
          setProblem('Could not turn that into three words just now. Use the link below instead.')
        } finally { setBusy(false) }
      },
      (err) => {
        setBusy(false)
        setProblem(
          err?.code === 1
            ? 'Your phone is not letting this page see where you are. Allow location in Settings, or use the link below.'
            : err?.code === 3
              ? 'That took too long. Try again outside, away from thick walls.'
              : 'Your phone could not get a fix. Try again outside, or use the link below.',
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <div className="mt-2.5">
      {/* NOT labelled "Use where I am now" — the pin button a few lines below
          says exactly that, and two identical buttons an inch apart doing
          different things is how somebody taps the wrong one in the rain. */}
      {configured && (
        <button type="button" onClick={find} disabled={busy} className="btn btn-tinted w-full">
          <PinIcon size={18} />
          {busy ? 'Finding you…' : 'Get my three words'}
        </button>
      )}

      <a href={W3W_SITE} target="_blank" rel="noreferrer"
         className={`inline-flex min-h-[40px] items-center text-[15px] font-medium ${configured ? 'mt-2' : ''}`}
         style={{ color: 'var(--tint)' }}>
        Don&apos;t know yours? Look them up ›
      </a>
      {!configured && (
        <span className="mt-0.5 block text-[13px]" style={{ color: 'var(--label-3)' }}>
          Their map finds you, then copy the three words back here.
        </span>
      )}

      {note && <p className="mt-2 text-[14px] leading-snug muted">{note}</p>}
      {problem && (
        <p className="r-inner mt-2 p-3 text-[14px] leading-snug"
           style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
          {problem}
        </p>
      )}
    </div>
  )
}
