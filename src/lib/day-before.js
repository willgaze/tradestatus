/**
 * The day before: ask whether anyone will be in.
 *
 * Every trade and every courier asks this blind, and the customer can answer
 * it in two seconds — but only if they are asked at a moment when the answer
 * is worth something. Asked at booking it is a guess; asked on the morning it
 * is too late to change the run. So the ask goes out the afternoon before,
 * once, and the page keeps asking until it is answered.
 *
 * This file decides WHETHER it is due. It is pure and relative-imported so
 * scripts/check-day-before.mjs can run it without a database or a bundler.
 * nudge.js does the sending.
 *
 * Rules that must not drift:
 *   - It fires ONCE per job (presenceAskedAt), whoever calls the sweep.
 *   - It asks; it never says when the trade will come. The notification says
 *     "booked for tomorrow" and nothing else about time.
 *   - The hour is the trade's zone, never UTC (ASK_HOUR via zoned()).
 */
import { isoDay, zoned } from './when.js'
import { PRESENCE_FRESH_HOURS } from './presence.js'

/** Local hour, the day before, from which the ask is due. */
export const ASK_HOUR = 16

const DAY = 24 * 60 * 60 * 1000

/** "2026-10-12" if `now` is the afternoon of 2026-10-11 in the trade's zone, else null. */
export function askWindow(now = new Date()) {
  const here = zoned(now)
  if (!here || here.hour < ASK_HOUR) return null
  return isoDay(new Date(now.getTime() + DAY))
}

/**
 * Is the day-before ask due for this job right now?
 *
 * Due when: the job is live and still Booked in, it is booked for tomorrow in
 * the trade's zone, it is past ASK_HOUR today, nobody has asked yet, and the
 * customer has not answered within the last few hours (an answer older than
 * that is history, not information — see presenceIsFresh).
 */
export function dayBeforeAskDue(t, now = new Date()) {
  if (!t || !t.isActive || t.stage !== 'BOOKED' || t.presenceAskedAt) return false
  const day = t.windowStart || t.scheduledFor
  if (!day) return false
  const tomorrow = askWindow(now)
  if (!tomorrow || isoDay(day) !== tomorrow) return false
  if (t.presenceAt && now - new Date(t.presenceAt) < PRESENCE_FRESH_HOURS * 3600 * 1000) return false
  return true
}
