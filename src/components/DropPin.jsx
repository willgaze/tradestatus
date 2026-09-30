'use client'

import { useState } from 'react'
import { PinIcon } from '@/components/icons'
import { coordsPinUrl } from '@/lib/places'

/**
 * "Use where I am now" — one tap instead of pasting a link.
 *
 * Used from both ends. The customer taps it standing at their own door; the
 * trade taps it standing at the door on the first visit, which is the better
 * moment because they are the one who will need to find it again.
 *
 * Deliberately a tap, never automatic. Asking a phone for its location the
 * moment a page opens is hostile, and iOS refuses a prompt that did not come
 * from a gesture, so "automatic" would mean a permission dialog nobody asked
 * for followed by a denial that cannot be undone without going into Settings.
 * One tap is both politer and the only thing that works.
 *
 * ACCURACY IS THE WHOLE PROBLEM. A phone indoors in a village can be a hundred
 * metres out, which in a terrace is four doors down and on a farm is the wrong
 * field. So the fix is never taken on trust: the reading comes back with a
 * radius, and anything vague enough to point at a neighbour says so and asks
 * to be redone outside. A pin that is confidently wrong is worse than none —
 * it sends a van somewhere with certainty.
 *
 * What comes back goes to the trade and to the tapping device, never onto the
 * public page. A precise location is the last thing that should ride on a link
 * that gets forwarded.
 */

// Beyond this the pin could be a neighbour's door, so it is offered with a
// warning rather than silently accepted.
const VAGUE_METRES = 60

export default function DropPin({ onPin, label = 'Use where I am now', className = 'btn btn-tinted w-full' }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)
  const [problem, setProblem] = useState(null)

  const drop = () => {
    setProblem(null)
    setNote(null)

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return setProblem('This browser cannot give a location. Paste a pin from Maps instead.')
    }
    // Browsers only hand out a location over https. Production is; a phone on
    // a local network testing build is not, and the error is otherwise silent.
    if (!window.isSecureContext) {
      return setProblem('Location needs a secure connection. Paste a pin from Maps instead.')
    }

    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false)
        const url = coordsPinUrl(coords.latitude, coords.longitude)
        if (!url) return setProblem('That reading did not make sense. Try again.')

        const metres = Math.round(coords.accuracy || 0)
        onPin?.(url, metres)
        setNote(
          metres && metres > VAGUE_METRES
            ? `Pin set, but your phone is only sure to about ${metres}m — that could be a few doors away. Worth redoing outside.`
            : metres
              ? `Pin set, accurate to about ${metres}m.`
              : 'Pin set.',
        )
      },
      (err) => {
        setBusy(false)
        // 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT. Each needs a
        // different thing from the person holding the phone, so each gets its
        // own sentence rather than "something went wrong".
        setProblem(
          err?.code === 1
            ? 'Your phone is not letting this page see where you are. Allow location for it in Settings, or paste a pin from Maps.'
            : err?.code === 3
              ? 'That took too long. Try again outside, away from thick walls.'
              : 'Your phone could not get a fix. Try again outside.',
        )
      },
      // High accuracy is the point of the feature; 15s because a cold GPS fix
      // indoors genuinely takes that long. maximumAge 0 so a stale fix from
      // the last town is never handed back as this doorstep.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <div>
      <button type="button" onClick={drop} disabled={busy} className={className}>
        <PinIcon size={18} />
        {busy ? 'Finding you…' : label}
      </button>

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
