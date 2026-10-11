/**
 * The booking terms, in the customer's words, agreed with one tap.
 *
 * Three things a customer should know before the visit, and the law behind
 * each:
 *
 *   1. Moving or cancelling — how much notice the trade asks for, and what a
 *      shorter-notice cancellation costs if the trade charges for one. A
 *      charge like that holds only if it was shown and agreed BEFORE the day,
 *      is a fair estimate of the loss, and can be avoided by giving notice
 *      (Consumer Rights Act 2015, Schedule 2; GOV.UK's cancellation guide).
 *      So the page shows it, the customer taps, and the tap is recorded.
 *   2. If no one is in — what the trade does at the door, and that a missed
 *      visit with no notice is the same thing as a short-notice cancellation.
 *   3. The right to cancel — a booking made at a distance or at the door
 *      carries a 14-day cooling-off period (Consumer Contracts Regulations
 *      2013, Part 3). A trade who starts inside that fortnight without an
 *      express request can end up unpaid (regulation 36), so "Got it, go
 *      ahead" is that request, in words a customer can read, with the time.
 *
 * TurnUp STATES a fee. It never takes one, never adds one to a bill and never
 * decides one is owed; the trade does that, by hand, with the record. The
 * numbers come from the trade's profile; the words come from here, so what the
 * customer reads and what gets stored against the job are the same text.
 *
 * No JSX and no database in this file: it is imported by the customer's page,
 * the dashboard and two API routes.
 */
export const TERMS_VERSION = 1

export const DEFAULT_TERMS = { noticeHours: 24, fee: null }

const int = (v, lo, hi, dflt) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return dflt
  return Math.min(hi, Math.max(lo, Math.round(n)))
}

/** The terms as configured, from a TradeProfile row (or nothing). */
export function termsFrom(profile) {
  const fee = profile?.shortNoticeFee
  return {
    noticeHours: int(profile?.noticeHours, 1, 336, DEFAULT_TERMS.noticeHours),
    fee: fee === null || fee === undefined || fee === '' ? null : int(fee, 0, 9999, 0) || null,
  }
}

/** "24 hours", "48 hours", "3 days". Days only once it is past two of them. */
export function noticeLabel(hours) {
  const h = int(hours, 1, 336, 24)
  if (h >= 72 && h % 24 === 0) return `${h / 24} days`
  return `${h} hours`
}

/**
 * The three paragraphs, exactly as the customer reads them. `first` is the
 * trade's first name, because "Tell Will" is how a customer thinks of it.
 */
export function termsParagraphs(terms, first = 'us') {
  const t = { ...DEFAULT_TERMS, ...(terms || {}) }
  const notice = noticeLabel(t.noticeHours)
  const fee = t.fee ? `£${t.fee}` : null
  return [
    {
      key: 'notice',
      head: 'Moving or cancelling',
      body: fee
        ? `Tell ${first} at least ${notice} before the booked time and there is nothing to pay. With less notice than that, a cancelled visit is ${fee}: the cost of a slot that cannot be filled at short notice. If something has happened, say so.`
        : `Tell ${first} at least ${notice} before the booked time. With less notice than that the slot usually cannot be refilled, so please ring as soon as you know.`,
    },
    {
      key: 'no-access',
      head: 'If no one is in',
      body: fee
        ? `${first} waits ten minutes or so, knocks, rings and texts, then leaves a message on this page with three ways to pick a new time. A visit where no one is in and no notice was given counts as a short-notice cancellation, so the same ${fee} applies.`
        : `${first} waits ten minutes or so, knocks, rings and texts, then leaves a message on this page with three ways to pick a new time. Nothing is charged for a missed visit.`,
    },
    {
      key: 'cooling-off',
      head: 'Your right to cancel',
      body: `A booking made by phone, email or online, or agreed at your home, can be cancelled within 14 days of making it, for any reason and at no cost. Tapping Go ahead asks ${first} to do the work before those 14 days are up; if you then cancel after work has started, you pay for the part already done. Urgent repairs you asked for straight away sit outside the 14 days, though anything extra agreed on the day does not.`,
    },
  ]
}

/** The same three paragraphs as one piece of text, for the record. */
export function termsText(terms, first) {
  return termsParagraphs(terms, first).map((p) => `${p.head}. ${p.body}`).join('\n\n')
}

/** What is stored against the job when the customer taps. */
export function termsSnapshot(terms, first) {
  const t = termsFrom({ noticeHours: terms?.noticeHours, shortNoticeFee: terms?.fee })
  return { version: TERMS_VERSION, noticeHours: t.noticeHours, fee: t.fee, first, text: termsText(t, first) }
}

/** One line for the dashboard: "24 hours’ notice · £75 at short notice". */
export function termsSummary(terms) {
  const t = { ...DEFAULT_TERMS, ...(terms || {}) }
  return `${noticeLabel(t.noticeHours)}’ notice · ${t.fee ? `£${t.fee} at short notice` : 'no charge for short notice'}`
}
