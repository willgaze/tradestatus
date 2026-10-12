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
