import { prisma } from '@/lib/prisma'
import { sm8Configured, fetchJob, fetchJobContact, fetchMessages, confirmationState, findOrCreateForJob, sendSms, londonDate, fetchNextBooking, fetchActivitiesEditedSince } from '@/lib/servicem8'
import { linkText, moveText, bookingMoved, toE164 } from '@/lib/sm8-words'
import { CANONICAL_HOST, TRADE_NAME } from '@/lib/trade'
import { diaryFor } from '@/lib/sm8-oauth'

/**
 * Follow every ServiceM8 booking.
 *
 * Until now a card existed only once the customer opened the link, and the
 * link went only if ServiceM8's Booking Confirmation automation fired, which
 * it does not for a job dragged onto the calendar, and does not by text unless
 * a tick is on. So on 10 Oct 2026 a real booking got an email and no text, and
 * nobody knew until the diary was read two days later.
 *
 * This sweep, from the five-minute cron: every booking made or changed in the
 * last few hours gets its card at once, and ten minutes after the booking was
 * made gets the link texted through ServiceM8 — unless ServiceM8's own
 * automation already texted it, which the SMS history shows. Ten minutes is
 * the head start that automation gets, so the two never race to the same
 * phone. One text per job, ever, recorded in linkSentAt.
 *
 * And when a booking the customer has been told about MOVES in ServiceM8,
 * one more text with the new hours, once the move has settled for the same
 * ten minutes (a job dragged three times in two minutes is one text, not
 * three). What they were told is kept on the card (toldStart/toldEnd); the
 * window follows the move at once, the message follows it once.
 *
 * Off unless the trade switches it on (TradeProfile.autoFollow): it spends
 * their SMS credits, and that is their call.
 */
export const AUTO_DELAY_MS = 10 * 60_000
const LOOKBACK_MS = 6 * 60 * 60_000
const FOLLOW_STATUSES = new Set(['Work Order', 'Quote'])

const stamp = (d) => {
  const z = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d)
  const g = Object.fromEntries(z.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]))
  return `${g.year}-${g.month}-${g.day} ${g.hour % 24 === 24 ? '00' : g.hour}:${g.minute}:${g.second}`
}

export async function autoFollowOn() {
  try { return Boolean((await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }))?.autoFollow) } catch { return false }
}

/** Bookings made or changed recently: one per job, newest booking edit first. */
async function recentBookings(now) {
  const since = stamp(new Date(now.getTime() - LOOKBACK_MS))
  const rows = await fetchActivitiesEditedSince(since)
  const byJob = new Map()
  for (const a of rows) {
    if (Number(a.active ?? 1) !== 1 || Number(a.activity_was_scheduled ?? 0) !== 1) continue
    const start = londonDate(a.start_date); if (!start || start < new Date(now.getTime() - 60 * 60_000)) continue
    const edited = londonDate(a.edit_date) || now
    const cur = byJob.get(a.job_uuid)
    if (!cur || edited > cur.edited) byJob.set(a.job_uuid, { jobUuid: a.job_uuid, edited, start })
  }
  return [...byJob.values()]
}

/** One job: make the card; text the link if it is time and nobody has. */
export async function followJob(jobUuid, { now = new Date(), edited = null, send = true } = {}) {
  const job = await fetchJob({ uuid: jobUuid })
  if (!job || Number(job.active ?? 1) !== 1 || !FOLLOW_STATUSES.has(job.status)) return { outcome: 'skipped:status' }
  const contact = await fetchJobContact(jobUuid).catch(() => null)
  const { tracker, created } = await findOrCreateForJob(job, contact)
  if (tracker.linkSentAt) {
    if (!send) return { outcome: 'already', created }
    return resendIfMoved(tracker, job, contact, { now, edited })
  }
  if (!send) return { outcome: created ? 'card' : 'unchanged', created }

  const messages = await fetchMessages(jobUuid)
  const c = confirmationState(messages)
  if (c.linkTexted) {
    // ServiceM8's own automation got there. Note it, with the hours as they
    // stand, and never text twice.
    const b = await fetchNextBooking(jobUuid).catch(() => null)
    await prisma.tradeStatus.update({ where: { id: tracker.id }, data: { linkSentAt: c.textedAt || now, toldStart: b?.start || null, toldEnd: b?.end || null, toldAt: c.textedAt || now } })
    return { outcome: 'already:servicem8', created }
  }
  const age = edited ? now - edited : AUTO_DELAY_MS
  if (age < AUTO_DELAY_MS) return { outcome: 'waiting', created }

  const to = toE164(contact?.mobile || contact?.phone)
  if (!to) return { outcome: 'skipped:no_mobile', created }
  const booking = await fetchNextBooking(jobUuid).catch(() => null)
  const first = (await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }).catch(() => null))?.engineerName?.split(' ')[0] || TRADE_NAME.split(' ')[0]
  const message = linkText({ tradeName: TRADE_NAME, first, customerName: tracker.customerName, start: booking?.start, end: booking?.end, host: CANONICAL_HOST, jobNumber: job.generated_job_id })
  await sendSms({ to, message, jobUuid })
  const updated = await prisma.tradeStatus.update({ where: { id: tracker.id }, data: { linkSentAt: now, toldStart: booking?.start || null, toldEnd: booking?.end || null, toldAt: now, events: { create: { stage: tracker.stage, note: 'Booking text with the link sent through ServiceM8.' } } } })
  diaryFor(updated, `Booking link texted via ServiceM8 to ${to}`).catch(() => {})
  return { outcome: 'sent', created, to }
}

/**
 * The customer was told one time and the booking now says another: one text
 * with the new hours, once the move is ten minutes old. Only for jobs still
 * Booked in: once the trade has set off, a moved diary entry is bookkeeping.
 */
async function resendIfMoved(tracker, job, contact, { now, edited }) {
  if (!tracker.toldStart || tracker.stage !== 'BOOKED') return { outcome: 'already' }
  const booking = await fetchNextBooking(job.uuid).catch(() => null)
  if (!booking) return { outcome: 'already' } // taken off the diary: not ours to announce
  if (!bookingMoved({ start: tracker.toldStart, end: tracker.toldEnd }, booking)) return { outcome: 'already' }
  const age = edited ? now - edited : AUTO_DELAY_MS
  if (age < AUTO_DELAY_MS) return { outcome: 'moved:waiting' }
  const to = toE164(contact?.mobile || contact?.phone)
  if (!to) return { outcome: 'moved:no_mobile' }
  const first = (await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }).catch(() => null))?.engineerName?.split(' ')[0] || TRADE_NAME.split(' ')[0]
  const message = moveText({ tradeName: TRADE_NAME, first, customerName: tracker.customerName, start: booking.start, end: booking.end, oldStart: tracker.toldStart, oldEnd: tracker.toldEnd, host: CANONICAL_HOST, jobNumber: job.generated_job_id })
  await sendSms({ to, message, jobUuid: job.uuid })
  const updated = await prisma.tradeStatus.update({ where: { id: tracker.id }, data: { toldStart: booking.start, toldEnd: booking.end, toldAt: now, events: { create: { stage: tracker.stage, note: 'The booking moved in ServiceM8. The customer was texted the new time.' } } } })
  diaryFor(updated, `Booking moved; customer texted the new time via ServiceM8 to ${to}`).catch(() => {})
  return { outcome: 'moved:sent', to }
}

/** The sweep. Never throws; one line per job in the result for the log. */
export async function autoFollow({ now = new Date() } = {}) {
  if (!sm8Configured()) return { on: false }
  if (!(await autoFollowOn())) return { on: false }
  const out = []
  let bookings = []
  try { bookings = await recentBookings(now) } catch (e) { return { on: true, error: e.message } }
  for (const b of bookings) {
    try {
      const r = await followJob(b.jobUuid, { now, edited: b.edited })
      out.push({ jobUuid: b.jobUuid, ...r })
      if (!['waiting', 'unchanged', 'already', 'moved:waiting'].includes(r.outcome)) {
        await prisma.sm8Event.create({ data: { event: 'auto.follow', jobUuid: b.jobUuid, outcome: r.outcome } }).catch(() => {})
      }
    } catch (e) {
      out.push({ jobUuid: b.jobUuid, outcome: `error:${e.message}` })
      await prisma.sm8Event.create({ data: { event: 'auto.follow', jobUuid: b.jobUuid, outcome: `error:${String(e.message).slice(0, 80)}` } }).catch(() => {})
    }
  }
  return { on: true, checked: bookings.length, followed: out }
}
