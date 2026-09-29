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

import { TRADE_TIMEZONE } from '@/lib/trade'

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

/** The day of the month on its own, for the tear-off calendar glyph. */
export function dayNumber(value) {
  const t = zoned(value)
  return t ? t.day : ''
}
