/**
 * Turning a forwarded email into something coming to a door.
 *
 * THE WHOLE STRATEGY IS IN THIS FILE. Getting delivery companies to integrate
 * is a cold start nobody wins: every one of them has to say yes before a
 * customer sees anything. But they are all already sending the customer an
 * email. So the customer forwards those emails to an address of their own, and
 * the card fills itself. Nobody has to sign up but the person who benefits.
 *
 * WHERE THIS DIFFERS FROM SHOP. Shopify's Shop app does the same trick and
 * says so in its own help pages: forwarding "only works for English emails
 * with a tracking number", and orders it cannot read are simply not tracked.
 * That is the gap. A plumber has no tracking number. A sofa with two men and a
 * Tuesday morning window has no tracking number. A boiler service has no
 * tracking number. **This parses arrivals, not parcels** — if something is
 * coming to the door, it belongs on the card, tracking number or not.
 *
 * THE NO-INVENTED-TIME RULE HOLDS HERE TOO, and it is worth being exact about
 * why this is allowed. The product may never work out when something will
 * arrive. But a carrier writing "expected Tuesday" in an email is the carrier
 * asserting it, the same way a trade proposing a window is the trade asserting
 * it. So a date is carried only when the email states one, it is always
 * attributed to whoever said it, and nothing here ever interpolates, averages
 * or guesses. An email with no date produces an arrival with no date.
 */

import { cleanText } from './clean-text.js'

/** Stages an arrival moves through. Deliberately the shape of a parcel's life
 *  and a trade's day at once, because the card shows both in one list. */
export const ARRIVAL_STAGES = ['ORDERED', 'BOOKED', 'ON_THE_WAY', 'OUT_FOR_DELIVERY', 'MISSED', 'DONE']

/**
 * Carriers, by the domain the mail actually comes from.
 *
 * Matched on the SENDING DOMAIN rather than on words in the body, because a
 * subject line can say "Royal Mail" in a phishing email and a domain is harder
 * to fake past SPF. `track` builds the carrier's own tracking URL from the
 * reference, so the card can hand the customer straight to the horse's mouth
 * rather than re-stating what it scraped.
 */
const CARRIERS = [
  { id: 'royalmail', name: 'Royal Mail', domains: [/(^|\.)royalmail\.com$/i],
    ref: [/\b([A-Z]{2}\d{9}GB)\b/], track: (r) => `https://www.royalmail.com/track-your-item#/tracking-results/${r}` },
  { id: 'parcelforce', name: 'Parcelforce', domains: [/(^|\.)parcelforce\.(com|net)$/i],
    ref: [/\b([A-Z]{2}\d{7,10})\b/], track: (r) => `https://www.parcelforce.com/track-trace?trackNumber=${r}` },
  { id: 'evri', name: 'Evri', domains: [/(^|\.)evri\.com$/i, /(^|\.)hermes(-europe)?\.co\.uk$/i],
    ref: [/\b(H[0-9A-Z]{15,19})\b/, /\b(\d{16})\b/], track: (r) => `https://www.evri.com/track/parcel/${r}` },
  { id: 'dpd', name: 'DPD', domains: [/(^|\.)dpd\.co\.uk$/i, /(^|\.)dpdgroup\.co\.uk$/i],
    ref: [/\b(\d{14})\b/], track: (r) => `https://track.dpd.co.uk/search?reference=${r}` },
  { id: 'yodel', name: 'Yodel', domains: [/(^|\.)yodel\.co\.uk$/i],
    ref: [/\b(JJD\d{15,18})\b/, /\b([A-Z0-9]{10,16})\b/], track: (r) => `https://www.yodel.co.uk/track/${r}` },
  { id: 'dhl', name: 'DHL', domains: [/(^|\.)dhl\.(com|co\.uk|de)$/i],
    ref: [/\b(\d{10,12})\b/], track: (r) => `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${r}` },
  { id: 'ups', name: 'UPS', domains: [/(^|\.)ups\.com$/i],
    ref: [/\b(1Z[0-9A-Z]{16})\b/], track: (r) => `https://www.ups.com/track?tracknum=${r}` },
  { id: 'fedex', name: 'FedEx', domains: [/(^|\.)fedex\.com$/i],
    ref: [/\b(\d{12,15})\b/], track: (r) => `https://www.fedex.com/fedextrack/?trknbr=${r}` },
  { id: 'amazon', name: 'Amazon', domains: [/(^|\.)amazon\.(co\.uk|com)$/i],
    ref: [/\b(\d{3}-\d{7}-\d{7})\b/], track: () => 'https://www.amazon.co.uk/gp/css/order-history' },
  { id: 'dxdelivery', name: 'DX', domains: [/(^|\.)dxdelivery\.com$/i], ref: [/\b(\d{10,14})\b/] },
  { id: 'tuffnells', name: 'Tuffnells', domains: [/(^|\.)tuffnells\.co\.uk$/i], ref: [/\b(\d{8,12})\b/] },
  { id: 'arrowxl', name: 'ArrowXL', domains: [/(^|\.)arrowxl\.co\.uk$/i], ref: [/\b([A-Z0-9]{8,14})\b/] },
  { id: 'panther', name: 'Panther Logistics', domains: [/(^|\.)pantherlogistics\.co\.uk$/i], ref: [/\b(\d{6,12})\b/] },
]

/**
 * What the email is telling you, in the order a parcel's life happens.
 *
 * Ordered last-to-first on purpose: an email that says both "your order has
 * shipped" and "out for delivery today" is describing the later state, and the
 * later state is the one worth showing. Phrases are the ones UK carriers
 * actually write, not a tidy taxonomy.
 */
const STAGE_PHRASES = [
  // "delivered" ALONE IS A TRAP. "Your parcel will be delivered between 1pm
  // and 2pm" is a parcel that has not arrived, and reading it as arrived is
  // the worst mistake this file can make — it drops a thing off the card at
  // the moment the customer most wants it there. Every pattern here is
  // explicitly past tense, and the future-tense guard below is belt and braces.
  ['DONE', [/\b(has|have|was|were) been delivered\b/i, /\b(was|were) delivered\b/i,
    /\bwe delivered\b/i, /\bdelivered (to|at|on|in|your|it)\b/i,
    /\bdelivery (is )?complete(d)?\b/i, /\byour (parcel|order|item) is here\b/i]],

  ['MISSED', [/\bsorry we missed you\b/i, /\bwe missed you\b/i, /\bunable to deliver\b/i,
    /\bdelivery attempt(ed)? (was )?unsuccessful\b/i, /\bnobody (was )?(in|home)\b/i,
    /\bcard (was )?left\b/i, /\bno one was (in|home)\b/i]],

  ['OUT_FOR_DELIVERY', [/\bout for delivery\b/i, /\bon (its|it's|the) way to you today\b/i,
    /\bwith (your|the) (driver|courier)\b/i, /\barriving today\b/i,
    /\b(is|are|being) (being )?delivered today\b/i, /\bwill be delivered .{0,30}today\b/i]],

  ['ON_THE_WAY', [/\b(has|have) (been )?(dispatched|despatched|shipped)\b/i, /\bon its way\b/i,
    /\byour (parcel|order) is on the way\b/i, /\bleft (our|the) (warehouse|depot)\b/i,
    /\bin transit\b/i, /\bwe('| ha)ve got your (parcel|item)\b/i]],

  // THE CASE SHOP DROPS. A sofa, a fridge, a boiler service: a real date, two
  // people turning up, and no tracking number anywhere. Shop's own help page
  // says forwarding "only works for English emails with a tracking number".
  // These phrases are how those senders actually write, and catching them is
  // most of why this product is not just a worse Shop.
  ['BOOKED', [/\bwill (be )?deliver(ed|ing|y)?\b/i, /\bdelivery (is |has been )?(booked|confirmed|scheduled|arranged)\b/i,
    /\byour (delivery|installation|appointment|visit|engineer|service) (date|slot|is|will)\b/i,
    /\bbooked (you )?in for\b/i, /\bwe('| wi)ll be with you\b/i, /\bscheduled for\b/i,
    /\b(is |are )?(due|arriving|coming) on\b/i, /\bappointment (is )?confirmed\b/i]],

  ['ORDERED', [/\border (confirmation|confirmed|received)\b/i, /\bthanks? for your order\b/i,
    /\bwe('| ha)ve received your order\b/i, /\byour order( is)? (is )?being (prepared|picked|processed)\b/i]],
]

// Said anywhere near "delivered", these mean it has not happened yet.
const FUTURE_TENSE = /\b(will be|to be|due to be|being|scheduled to be|expected to be)\s+deliver/i

/** Dates a carrier actually wrote. Never a date this code worked out. */
const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
}
const DAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

/**
 * A stated delivery date, as `{ at, said }` — the instant, and the words the
 * carrier used, so the card can show the claim rather than a number this code
 * produced. Returns null when the email names no date, which is common and
 * entirely fine: an arrival with no date is still an arrival.
 */
export function statedDate(text, now = new Date()) {
  const s = String(text || '')

  // "Tuesday 14 October", "14 Oct", "14th October 2026"
  const dmy = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s*(\d{4})?/i)
  if (dmy) {
    const day = Number(dmy[1])
    const month = MONTHS[dmy[2].toLowerCase().slice(0, dmy[2].toLowerCase().startsWith('sept') ? 4 : 3)]
    const year = dmy[3] ? Number(dmy[3]) : guessYear(month, day, now)
    if (Number.isFinite(day) && Number.isFinite(month)) {
      return { at: new Date(Date.UTC(year, month, day, 12, 0, 0)), said: dmy[0].trim() }
    }
  }

  // "today" / "tomorrow" — relative to when the email arrived, not to now.
  if (/\btoday\b/i.test(s)) return { at: atNoon(now, 0), said: 'today' }
  if (/\btomorrow\b/i.test(s)) return { at: atNoon(now, 1), said: 'tomorrow' }

  // A bare weekday: the NEXT one, which is what a carrier means by it.
  const wd = s.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i)
  if (wd) {
    const want = DAYS[wd[1].toLowerCase()]
    const ahead = (want - now.getUTCDay() + 7) % 7 || 7
    return { at: atNoon(now, ahead), said: wd[1] }
  }
  return null
}

const atNoon = (from, plusDays) => {
  const d = new Date(from)
  d.setUTCDate(d.getUTCDate() + plusDays)
  d.setUTCHours(12, 0, 0, 0)
  return d
}

// A carrier writing "14 Oct" in December means next year, not ten months ago.
function guessYear(month, day, now) {
  const y = now.getUTCFullYear()
  const asThisYear = Date.UTC(y, month, day)
  return asThisYear < now.getTime() - 60 * 24 * 3600 * 1000 ? y + 1 : y
}

/** "between 1pm and 2pm", "13:00 - 14:00", "1-2pm" */
export function statedWindow(text) {
  const s = String(text || '')
  const m =
    s.match(/\bbetween\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:and|-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
    s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (!m) return null
  const h = (hh, mm, ap) => {
    let n = Number(hh)
    if (/pm/i.test(ap || '') && n < 12) n += 12
    if (/am/i.test(ap || '') && n === 12) n = 0
    return { h: n, m: Number(mm || 0) }
  }
  // A trailing am/pm applies to both ends: "1-2pm" is 13:00 to 14:00.
  const end = h(m[4], m[5], m[6])
  const start = h(m[1], m[2], m[3] || m[6])
  if (start.h > 23 || end.h > 23) return null
  return { start, end, said: m[0].trim() }
}

const domainOf = (from) => (String(from || '').match(/@([^\s>]+)/) || [])[1]?.toLowerCase() || ''

/** The name a person would use for who it is from, when no carrier matched. */
function senderName(from, domain) {
  const named = String(from || '').match(/^\s*"?([^"<@]+?)"?\s*</)
  const label = named?.[1]?.trim()
  if (label && label.length <= 60 && !/^no-?reply/i.test(label)) return label
  const bare = domain.replace(/^(www|mail|email|e|notifications?|updates?)\./, '').split('.')[0]
  return bare ? bare.charAt(0).toUpperCase() + bare.slice(1) : 'A sender'
}

/**
 * Read one forwarded email.
 *
 * Returns null when nothing about it says something is coming — a receipt, a
 * newsletter, a password reset. Returning null is the common case and is not a
 * failure: the card would rather miss a parcel than invent one.
 */
export function readArrivalEmail({ from, subject, text, receivedAt } = {}) {
  const now = receivedAt instanceof Date ? receivedAt : new Date(receivedAt || Date.now())
  const subj = cleanText(subject, 300) || ''
  const body = String(text || '').slice(0, 20000)
  const hay = `${subj}\n${body}`
  const domain = domainOf(from)

  const carrier = CARRIERS.find((c) => c.domains.some((d) => d.test(domain))) || null

  let stage = null
  for (const [name, patterns] of STAGE_PHRASES) {
    // Never read a future delivery as a past one, however the sentence is
    // built. This guard costs one regex and prevents the one unrecoverable
    // error: a parcel marked arrived while the customer is still waiting in.
    if (name === 'DONE' && FUTURE_TENSE.test(hay)) continue
    if (patterns.some((p) => p.test(hay))) { stage = name; break }
  }

  // Nothing says a thing is coming, and no known carrier sent it. Leave it.
  if (!stage && !carrier) return null
  // A known carrier with no recognisable stage is still worth showing as on
  // its way: they do not email about parcels that are not moving.
  if (!stage) stage = 'ON_THE_WAY'

  let reference = null
  for (const re of carrier?.ref || []) {
    const m = hay.match(re)
    if (m) { reference = m[1]; break }
  }
  if (!reference) {
    const generic = hay.match(/\b(?:tracking|consignment|parcel|order)\s*(?:number|no\.?|#|reference|ref)?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{5,24})\b/i)
    if (generic) reference = generic[1]
  }

  const when = statedDate(hay, now)
  const window = statedWindow(hay)
  const who = carrier?.name || senderName(from, domain)

  return {
    kind: carrier ? 'PARCEL' : 'DELIVERY',
    source: 'EMAIL',
    carrier: who,
    carrierId: carrier?.id || null,
    title: subj || `Something from ${who}`,
    reference: reference || null,
    stage,
    // Attributed, always. The card says "Evri said Tuesday", never "Tuesday".
    expectedFor: when?.at || null,
    expectedSaid: when?.said || null,
    window: window ? { start: window.start, end: window.end, said: window.said } : null,
    trackUrl: reference && carrier?.track ? carrier.track(reference) : null,
  }
}
