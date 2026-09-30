/**
 * Dates, formatted so that the server and the browser cannot disagree.
 *
 * The customer's page renders twice — once in a serverless function, once on
 * the phone — and React throws the whole tree away if the two produce
 * different text. Two separate things cause that, and both bite here:
 *
 *   The zone.  A bare toLocaleString() uses whichever zone each side is in. A
 *              function runs in UTC and a phone in Wiltshire does not, so
 *              "Set off at 07:42" rendered an hour out on one of them.
 *
 *   The data.  Naming the zone is not enough. Node and mobile Safari ship
 *              different versions of the Unicode locale data, and en-GB has
 *              genuinely changed between them: one writes "Tue 29 Sept", the
 *              newer one "Tue, 29 Sept", and September is "Sep" on one and
 *              "Sept" on the other. That difference alone tore the page down
 *              in testing.
 *
 * So Intl is used only for the numbers, where it is doing the one job nothing
 * else can — working out what the clock said in a given zone. The month names,
 * the day names and every separator are ours, and are therefore identical
 * everywhere.
 *
 * Any new date on a page that renders on both sides goes through here.
 */

// Relative: see the note in trade-status.js.
import { TRADE_TIMEZONE } from './trade.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n) => String(n).padStart(2, '0')

/** The calendar and clock values in the trade's zone — numbers only. */
export function zoned(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const got = {}
  for (const part of new Intl.DateTimeFormat('en-GB', {
    timeZone: TRADE_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)) {
    if (part.type !== 'literal') got[part.type] = part.value
  }

  const year = Number(got.year)
  const month = Number(got.month)
  const day = Number(got.day)
  return {
    year, month, day,
    // Midnight comes back as hour 24 rather than 0 in some builds.
    hour: Number(got.hour) % 24,
    minute: Number(got.minute),
    // Derived from the zoned calendar date, so it needs no locale data at all.
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
  }
}

/** "07:42" */
export function timeOnly(value) {
  const t = zoned(value)
  return t ? `${pad(t.hour)}:${pad(t.minute)}` : ''
}

/** "Tuesday 29 September" */
export function dayOnly(value) {
  const t = zoned(value)
  return t ? `${DAYS[t.weekday]} ${t.day} ${MONTHS[t.month - 1]}` : ''
}

/** "Tue 29 Sep, 07:42" */
export function dayAndTime(value) {
  const t = zoned(value)
  return t ? `${DAYS_SHORT[t.weekday]} ${t.day} ${MONTHS_SHORT[t.month - 1]}, ${pad(t.hour)}:${pad(t.minute)}` : ''
}

/** "29 Sep" */
export function dayAndMonth(value) {
  const t = zoned(value)
  return t ? `${t.day} ${MONTHS_SHORT[t.month - 1]}` : ''
}

/**
 * "09:00" on a given day, as an instant — in the trade's zone, not UTC.
 *
 * A customer picking 9am means nine o'clock where they are, and Britain is an
 * hour ahead of UTC for seven months of the year. Building the instant with
 * setUTCHours(9) stores 09:00Z, which is displayed straight back to them as
 * 10:00 — the window they did not ask for.
 *
 * Done by guess and correct rather than by a table of offsets: assume the wall
 * time is UTC, ask what that instant actually reads as in the zone, and shift
 * by the difference. Twice, because the first correction can itself land on
 * the other side of a clock change — an 01:30 on the last Sunday in October is
 * two different instants and this settles on one of them rather than
 * oscillating.
 */
export function atLocalTime(day, hhmm) {
  if (typeof hhmm !== 'string' || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null
  const [hour, minute] = hhmm.split(':').map(Number)
  if (hour > 23 || minute > 59) return null

  const on = zoned(day ? new Date(day) : new Date())
  if (!on) return null

  const wall = Date.UTC(on.year, on.month - 1, on.day, hour, minute)
  let instant = wall
  for (let i = 0; i < 2; i += 1) {
    const seen = zoned(new Date(instant))
    if (!seen) return null
    const seenWall = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute)
    instant = wall - (seenWall - instant)
  }
  return new Date(instant)
}

/** The day of the month on its own, for the tear-off calendar glyph. */
export function dayNumber(value) {
  const t = zoned(value)
  return t ? t.day : ''
}
