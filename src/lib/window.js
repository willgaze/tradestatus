// Relative for the same reason as in trade-status.js: the public-shape
// check loads this chain with plain node.
import { timeOnly, dayOnly } from './when.js'

/**
 * Agreeing a window, rather than announcing one.
 *
 * A window has always been a two-way arrangement pretending to be a broadcast.
 * The trade picks "between 9 and 11", the customer is on a call until half
 * eleven, and the first either of them knows about it is a missed doorbell and
 * a second appointment. Both of them lose an hour to something a single
 * exchange would have settled.
 *
 * WHY THIS IS NOT A CALENDAR INVITE. Email invites have had this since the
 * nineties — METHOD:REQUEST, and the recipient's client offers Accept, Decline
 * and Propose New Time. It is the obvious answer and it does not work here: it
 * needs the invite to arrive as an email, in an email client, with a reply
 * address to send the REPLY back to. This product sends a LINK, by text, and
 * an .ics opened from a link just adds an event — no buttons, nobody to reply
 * to. So the negotiation lives in the product, where it works over a texted
 * link, and the calendar file carries the RESULT once there is one.
 *
 * THE STATE MACHINE IS DELIBERATELY ONE OFFER DEEP. A counter-offer is simply
 * a new proposal from the other side, so there is never a queue of competing
 * times to reconcile — only what is on the table and who put it there:
 *
 *     (nothing)  --propose-->  PROPOSED by TRADE
 *     PROPOSED   --agree---->  AGREED
 *     PROPOSED   --counter-->  PROPOSED by the other side
 *     AGREED     --propose-->  PROPOSED   (plans change; it reopens)
 *
 * WHAT IS PUBLISHABLE. `publicShape()` carries what the trade told the
 * customer and never the reverse, and a window obeys that like everything
 * else: a time the TRADE proposed is theirs to publish, and a time the
 * CUSTOMER proposed is not — "I am free between 2 and 4" is a statement about
 * when a house is occupied. Once the trade agrees it, it becomes something the
 * trade is asserting and goes public. `publicWindow()` below is the only place
 * that decides, and `scripts/check-public-shape.mjs` proves it.
 */

export const WINDOW_STATES = ['PROPOSED', 'AGREED']
export const WINDOW_PARTIES = ['TRADE', 'CUSTOMER']

export const isWindowState = (v) => WINDOW_STATES.includes(v)
export const isWindowParty = (v) => WINDOW_PARTIES.includes(v)

/**
 * The window as the customer's page is allowed to see it.
 *
 * Returns the times only when the trade is the one putting them forward — as
 * a proposal of their own, or as an agreement they have signed up to. While
 * the customer's own counter-offer is on the table, the page gets the fact
 * that it is waiting and not the hours in it; their own device remembers what
 * they asked for, and the trade sees it on the dashboard.
 *
 * @returns {{state: string|null, by: string|null, start: string|null, end: string|null, at: string|null}}
 */
export function publicWindow(row) {
  const state = isWindowState(row.windowState) ? row.windowState : null
  const by = isWindowParty(row.windowBy) ? row.windowBy : null
  const at = row.windowAt ? row.windowAt.toISOString() : null

  // A customer's pending counter is the customer telling the trade something.
  // It is not published back, for the same reason "No, I'm out" is not.
  const fromTrade = state === 'AGREED' || by === 'TRADE'
  if (!fromTrade) return { state, by, start: null, end: null, at, ...revisionShape(row) }

  return {
    state,
    by,
    start: row.windowStart ? row.windowStart.toISOString() : null,
    end: row.windowEnd ? row.windowEnd.toISOString() : null,
    at,
    ...revisionShape(row),
  }
}

/**
 * The revision, as the page sees it. `was` is the FIRST hours the trade
 * published — only ever written by the trade's own writes (revisionFor below),
 * so a customer's counter can never land here; the check script proves it.
 */
function revisionShape(row) {
  const first = row.windowFirstStart
    ? { start: row.windowFirstStart.toISOString(), end: row.windowFirstEnd ? row.windowFirstEnd.toISOString() : null, at: row.windowFirstAt ? row.windowFirstAt.toISOString() : null }
    : null
  return {
    was: first,
    revisedAt: row.windowRevisedAt ? row.windowRevisedAt.toISOString() : null,
    revisedBy: isWindowParty(row.windowRevisedBy) ? row.windowRevisedBy : null,
    revisions: row.windowRevisions || 0,
  }
}

/** "Between 09:00 and 11:00", or "From 09:00" when it is open-ended. */
export function windowHours({ start, end }) {
  if (!start) return null
  return end ? `Between ${timeOnly(start)} and ${timeOnly(end)}` : `From ${timeOnly(start)}`
}

/**
 * One line saying where the arrangement stands, in the reader's own terms.
 * `side` is who is reading: 'CUSTOMER' or 'TRADE'.
 */
export function windowSummary(win, side = 'CUSTOMER') {
  if (!win?.state) return null
  const hours = windowHours(win)
  const mine = win.by === side

  if (win.state === 'AGREED') return hours ? `${hours} — agreed` : 'Agreed'

  // Waiting on the other side.
  if (mine) return hours ? `${hours} — waiting for them` : 'Waiting for them'

  // They are waiting on the reader.
  if (!hours) return side === 'TRADE' ? 'They have asked for a different time' : 'They have suggested a time'
  return side === 'TRADE' ? `They asked for ${hours.toLowerCase()}` : `${hours} — does that suit?`
}

const sameInstant = (a, b) => (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null)
const sameHours = (a, b) => sameInstant(a?.start, b?.start) && sameInstant(a?.end, b?.end)

/**
 * A revised promise is shown as revised, and the original is kept.
 *
 * Call this with the row as it stands and the hours the TRADE is about to
 * publish — their own proposal, a customer's counter they are agreeing, a
 * booking moved in ServiceM8, or nothing (a withdrawal). It returns the extra
 * columns to write alongside. The first published hours are written once and
 * never again; every later change of published hours stamps a revision.
 *
 * The customer's own counter-offer never comes through here: it is not the
 * trade publishing anything, so it is neither a first nor a revision.
 */
export function revisionFor(current, next, { by = 'TRADE' } = {}) {
  const now = new Date()
  const start = next?.start ?? null
  const end = next?.end ?? null
  // What the customer could last see. Kept on its own columns because the
  // row's hours are overwritten by a customer's counter, and agreeing that
  // counter has to be compared with what stood before it, not with itself.
  const out = { windowShownStart: start, windowShownEnd: end }
  if (!current.windowFirstStart) {
    if (!start) return out
    return { ...out, windowFirstStart: start, windowFirstEnd: end, windowFirstAt: now }
  }
  if (sameHours(lastShown(current), { start, end })) return out
  return { ...out, windowRevisedAt: now, windowRevisedBy: isWindowParty(by) ? by : 'TRADE', windowRevisions: (current.windowRevisions || 0) + 1 }
}

/** The hours the customer could last see, for the line in the record. */
export const lastShown = (current) => ({ start: current.windowShownStart ?? null, end: current.windowShownEnd ?? null })

/** The day moved: keep the day first booked, once, and stamp the move. */
export function dayMoveFor(current, nextDay) {
  if (!current.scheduledFor || !nextDay) return {}
  const a = new Date(current.scheduledFor), b = new Date(nextDay)
  if (a.toDateString() === b.toDateString()) return {}
  return { scheduledWas: current.scheduledWas || current.scheduledFor, scheduledMovedAt: new Date() }
}

/**
 * One line saying the hours changed, and from what. `side` is who is reading.
 * Null until something has been revised, so a first window carries no line.
 */
export function windowRevisionLine(win, side = 'CUSTOMER', { time = (v) => timeOnly(v) } = {}) {
  if (!win?.revisedAt) return null
  const first = win.was?.start ? windowHours(win.was) : null
  const changed = first && !sameHours(win.was, win) ? `${side === 'TRADE' ? 'You' : 'They'} first said ${first.toLowerCase()}.` : null
  const when = time(win.revisedAt)
  if (!win.state) {
    return [`The hours were withdrawn at ${when}; the day stands.`, changed].filter(Boolean).join(' ')
  }
  if (win.revisedBy === 'CUSTOMER') {
    return [`Changed at ${side === 'TRADE' ? 'their' : 'your'} request, ${when}.`, changed].filter(Boolean).join(' ')
  }
  return [`Revised ${when}.`, changed].filter(Boolean).join(' ')
}

/** The day the window falls on, for a heading. */
export const windowDay = (win) => (win?.start ? dayOnly(win.start) : null)

/**
 * Build the write for a new proposal.
 *
 * A proposal always replaces whatever was on the table, because there is only
 * ever one offer. Agreeing keeps the times and only moves the state, so
 * agreeing to something cannot quietly change it.
 */
export function proposeWindow({ start, end, by, note }) {
  return {
    windowStart: start,
    windowEnd: end,
    windowState: 'PROPOSED',
    windowBy: isWindowParty(by) ? by : 'TRADE',
    windowNote: note ?? null,
    windowAt: new Date(),
  }
}

export function agreeWindow({ by }) {
  return {
    windowState: 'AGREED',
    windowBy: isWindowParty(by) ? by : 'TRADE',
    windowAt: new Date(),
  }
}

/** Dropping the whole arrangement — back to "the day, and nothing more". */
export function clearWindow() {
  return {
    windowStart: null,
    windowEnd: null,
    windowState: null,
    windowBy: null,
    windowNote: null,
    windowAt: new Date(),
  }
}
