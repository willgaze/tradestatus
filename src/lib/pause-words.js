// Plain words, no server imports: the customer page and the dashboard read
// these in the browser. The writes live in src/lib/pause.js.
import { timeOnly } from '@/lib/when'

export const PAUSE_BACK = {
  MIN_30:      { chip: '30 min',       line: 'back in about 30 minutes', minutes: 30 },
  HOUR_1:      { chip: '1 hour',       line: 'back in about an hour', minutes: 60 },
  HOUR_2:      { chip: '2 hours',      line: 'back in about two hours', minutes: 120 },
  AFTER_LUNCH: { chip: 'After lunch',  line: 'back after lunch', minutes: null },
  LATER_TODAY: { chip: 'Later today',  line: 'back later today', minutes: null },
  TOMORROW:    { chip: 'Tomorrow',     line: 'back tomorrow', minutes: null, day: true },
  ANOTHER_DAY: { chip: 'Another day',  line: 'back another day', minutes: null, day: true },
}
export const PAUSE_BACK_KEYS = Object.keys(PAUSE_BACK)
export const isPauseBack = (v) => PAUSE_BACK_KEYS.includes(v)

/** "Back in about an hour, said at 10:40." — the one sentence, for every surface. */
export function pauseBackLine(key, saidAt, { who = null } = {}) {
  const c = PAUSE_BACK[key]
  if (!c || !saidAt) return null
  const said = `said at ${timeOnly(saidAt)}`
  const line = `${c.line.charAt(0).toUpperCase()}${c.line.slice(1)}`
  return who ? `${who} says: ${c.line}, ${said}.` : `${line}, ${said}.`
}

/**
 * When "about an hour" runs out, as an instant — only for the minute-shaped
 * choices. Lets the page say "that was 11:40 and it is still paused", which
 * is a fact about the clock, not a new estimate.
 */
export function pauseBackDue(key, saidAt) {
  const c = PAUSE_BACK[key]
  if (!c?.minutes || !saidAt) return null
  return new Date(new Date(saidAt).getTime() + c.minutes * 60_000)
}

