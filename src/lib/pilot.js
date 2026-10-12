/**
 * The pilot, in four numbers.
 *
 * Decided 11 Oct 2026: the real pilot is the owner's own jobs, thirty days,
 * and the test is whether customers use the link, not whether the product is
 * clever. Four numbers answer that, and three of them come out of the rows
 * the product already keeps:
 *
 *   links opened      jobs whose page was opened at least once (viewCount)
 *   "in?" answered    jobs where the customer answered will-someone-be-in
 *   wasted trips      No one home records, one per visit that found nobody
 *   calls             "when are you coming?" calls to the booking line.
 *                     Nobody can count those from here; "Are you still
 *                     coming?" taps on the card are the nearest thing the
 *                     product sees, and they are shown as that, never as calls.
 *
 * Pure and relative-imported so scripts/check-pilot.mjs runs it without a
 * database. The route fetches the rows; this file only counts.
 */

const DAY = 24 * 60 * 60 * 1000

/** A job belongs to the window if it was booked for, or made, inside it. */
export function inWindow(t, since, until) {
  const day = t.scheduledFor ? new Date(t.scheduledFor) : new Date(t.createdAt)
  return day >= since && day < until
}

export function pilotNumbers(trackers, noAccess = [], { days = 30, now = new Date() } = {}) {
  const until = now
  const since = new Date(now.getTime() - days * DAY)
  const jobs = trackers.filter((t) => t.isActive !== false && inWindow(t, since, until))
  const ids = new Set(jobs.map((t) => t.id))
  const pct = (n) => (jobs.length ? Math.round((n / jobs.length) * 100) : null)

  const opened = jobs.filter((t) => (t.viewCount || 0) > 0).length
  const askedDayBefore = jobs.filter((t) => t.presenceAskedAt).length
  const answered = jobs.filter((t) => t.presenceAt).length
  const trips = noAccess.filter((n) => ids.has(n.tradeStatusId) && new Date(n.startedAt) >= since && new Date(n.startedAt) < until).length
  const stillComing = jobs.filter((t) => t.askedAt).length

  return {
    days, since: since.toISOString(), until: until.toISOString(),
    jobs: jobs.length,
    linksOpened: { n: opened, pct: pct(opened) },
    askedDayBefore: { n: askedDayBefore, pct: pct(askedDayBefore) },
    inAnswered: { n: answered, pct: pct(answered) },
    wastedTrips: { n: trips },
    stillComingAsks: { n: stillComing },
    // The fourth number is counted by a person, on purpose.
    calls: { n: null, note: 'Count "when are you coming?" calls to the booking line by hand. The product cannot see a phone ring.' },
  }
}
