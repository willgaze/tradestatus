/**
 * The texts TurnUp sends through ServiceM8, in plain ASCII.
 *
 * ServiceM8's SMS endpoint says special characters are not supported, and a
 * curly quote or an em dash can turn a 150-character text into two credits or
 * into question marks on an old handset. So these are written with straight
 * quotes, hyphens and nothing else. No JSX, no database: the dashboard panel
 * shows the same words the server sends.
 */
import { dayAndTime, timeOnly } from './when.js'

const ascii = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ')

/** The booking text with the link: who, when, where to follow it, and that the terms are there. */
export function linkText({ tradeName, first, customerName, start, end, host, jobNumber }) {
  const who = (customerName || '').trim().split(/\s+/)[0] || 'there'
  const when = start ? `${dayAndTime(start)}${end ? ` to ${timeOnly(end)}` : ''}` : 'as booked'
  return ascii(`Hi ${who}, ${first} here from ${tradeName}. Your booking is ${when}. Follow the job here - it says when I set off, when I arrive and when I am done, and has the booking terms and your right to cancel: https://${host}/j/${jobNumber}`)
}

/** A UK number as E.164, which is the only shape the SMS endpoint takes. */
export function toE164(raw, country = '44') {
  const d = String(raw || '').replace(/[^\d+]/g, '')
  if (!d) return null
  if (d.startsWith('+')) return /^\+[1-9]\d{6,14}$/.test(d) ? d : null
  if (d.startsWith('00')) return `+${d.slice(2)}`
  if (d.startsWith('0')) return `+${country}${d.slice(1)}`
  if (d.startsWith(country)) return `+${d}`
  return null
}

/** The booking moved: the new hours, the old ones in brackets, the same link. */
export function moveText({ tradeName, first, customerName, start, end, oldStart, oldEnd, host, jobNumber }) {
  const who = (customerName || '').trim().split(/\s+/)[0] || 'there'
  const span = (a, b) => (a ? `${dayAndTime(a)}${b ? ` to ${timeOnly(b)}` : ''}` : 'as booked')
  return ascii(`Hi ${who}, ${first} here from ${tradeName}. Your booking has moved to ${span(start, end)} (was ${span(oldStart, oldEnd)}). Same link as before: https://${host}/j/${jobNumber}`)
}

/** Has the booking moved enough to be worth a text? Five minutes either end. */
export function bookingMoved(told, booking, minutes = 5) {
  if (!told?.start || !booking?.start) return false
  const d = (a, b) => Math.abs(new Date(a).getTime() - (b ? new Date(b).getTime() : new Date(a).getTime()))
  return d(booking.start, told.start) >= minutes * 60_000 || (booking.end || told.end ? d(booking.end || booking.start, told.end || told.start) >= minutes * 60_000 : false)
}
