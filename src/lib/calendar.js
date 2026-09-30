import { PRODUCT_NAME } from '@/lib/product'
import { TRADE_NAME, TRADE_PHONE } from '@/lib/trade'
import { timeOnly } from '@/lib/when'

/**
 * Putting the job in the customer's calendar.
 *
 * The product never promises an arrival time, so the event is ALL DAY. An
 * hour-long block at nine in the morning would be a promise, made in the one
 * place a customer will definitely look again — and they would be right to be
 * annoyed when it slipped. All day says "this is the day", which is true.
 */

const pad = (n) => String(n).padStart(2, '0')
const stampOf = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`

// RFC 5545: lines fold at 75 octets, and commas, semicolons and backslashes
// inside a value have to be escaped or the file silently fails to import.
const esc = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n')
const fold = (line) => {
  if (line.length <= 73) return line
  const out = [line.slice(0, 73)]
  let rest = line.slice(73)
  while (rest.length > 72) { out.push(' ' + rest.slice(0, 72)); rest = rest.slice(72) }
  if (rest) out.push(' ' + rest)
  return out.join('\r\n')
}

export function calendarSummary(status) {
  return `${status.jobSummary || 'Plumbing work'} — ${TRADE_NAME}`
}

export function calendarDescription(status, trackUrl) {
  const bits = [
    `${TRADE_NAME} is booked to do: ${status.jobSummary || 'plumbing work'}.`,
    '',
    `Track the job on the day: ${trackUrl}`,
    'It shows booked in, on my way, on site and done — no arrival time is promised.',
  ]
  if (status.jobRef) bits.push('', `Job reference: ${status.jobRef}`)
  if (TRADE_PHONE) bits.push(`Call: ${TRADE_PHONE}`)
  return bits.join('\n')
}

export function buildIcs(status, trackUrl) {
  if (!status.scheduledFor) return null
  const start = new Date(status.scheduledFor)
  if (Number.isNaN(start.getTime())) return null

  // With a window, this is a real block in the day and goes in as one. Without,
  // it stays all-day — DTEND is exclusive for an all-day VEVENT, so it lands on
  // the following date.
  const timed = Boolean(status.windowStart)
  const from = timed ? new Date(status.windowStart) : start
  const end = timed
    ? new Date(status.windowEnd || new Date(from.getTime() + 2 * 60 * 60 * 1000))
    : (() => { const e = new Date(start); e.setUTCDate(e.getUTCDate() + 1); return e })()

  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${PRODUCT_NAME}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // The UID suffix is the old working title on purpose: it is the event's
    // identity in the customer's calendar, and changing it would duplicate
    // every event already added.
    `UID:${status.code}@mytradestatus`,
    `DTSTAMP:${stamp}`,
    ...(timed
      ? [`DTSTART:${stampOf(from)}`, `DTEND:${stampOf(end)}`]
      : [`DTSTART;VALUE=DATE:${ymd(from)}`, `DTEND;VALUE=DATE:${ymd(end)}`]),
    fold(`SUMMARY:${esc(calendarSummary(status))}`),
    ...(status.jobAddress ? [fold(`LOCATION:${esc(status.jobAddress)}`)] : []),
    fold(`DESCRIPTION:${esc(calendarDescription(status, trackUrl))}`),
    fold(`URL:${trackUrl}`),
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',        // an all-day job should not mark them busy
    'BEGIN:VALARM',
    'TRIGGER:-PT12H',            // the evening before, which is when it is useful
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:${esc(`${TRADE_NAME} tomorrow`)}`),
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

/** Google Calendar's own add-event URL, for anyone not on iOS. */
export function googleCalendarUrl(status, trackUrl) {
  if (!status.scheduledFor) return null
  const start = new Date(status.scheduledFor)
  if (Number.isNaN(start.getTime())) return null
  const timed = Boolean(status.windowStart)
  const from = timed ? new Date(status.windowStart) : start
  const end = timed
    ? new Date(status.windowEnd || new Date(from.getTime() + 2 * 60 * 60 * 1000))
    : (() => { const e = new Date(start); e.setUTCDate(e.getUTCDate() + 1); return e })()

  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: calendarSummary(status),
    dates: timed ? `${stampOf(from)}/${stampOf(end)}` : `${ymd(from)}/${ymd(end)}`,
    details: calendarDescription(status, trackUrl),
    location: status.jobAddress || '',
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

/**
 * The window, said the way a person would.
 * No window at all returns null, and the caller falls back to the day — the
 * product would rather say less than promise more.
 */
export function windowLabel(status) {
  if (!status.windowStart) return null
  // Through when.js, not toLocaleTimeString: this label is rendered inside the
  // customer's page, which runs on the server and again on the phone, and the
  // two must produce byte-identical text.
  return status.windowEnd
    ? `Between ${timeOnly(status.windowStart)} and ${timeOnly(status.windowEnd)}`
    : `From ${timeOnly(status.windowStart)}`
}

/** "You are second today" — ordinal, because "position 2" is not English. */
export function positionLabel(position) {
  if (!position || position < 1) return null
  if (position === 1) return 'You are first today'
  const n = position % 100
  const suffix = n >= 11 && n <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[position % 10] || 'th'
  return `You are ${position}${suffix} today`
}
