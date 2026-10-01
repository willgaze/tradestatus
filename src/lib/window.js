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
  if (!fromTrade) return { state, by, start: null, end: null, at }

  return {
    state,
    by,
    start: row.windowStart ? row.windowStart.toISOString() : null,
    end: row.windowEnd ? row.windowEnd.toISOString() : null,
    at,
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
