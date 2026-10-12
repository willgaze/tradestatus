import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { sm8Configured, fetchUpcoming, fetchJob, fetchJobContact, findOrCreateForJob, fetchNextBooking, sendSms } from '@/lib/servicem8'
import { linkText, toE164 } from '@/lib/sm8-words'
import { CANONICAL_HOST, TRADE_NAME } from '@/lib/trade'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * This week in ServiceM8: every booking in the next seven days, whether the
 * link went (ServiceM8's own email and SMS history), and whether a TurnUp
 * card follows the job yet. Operator only: it carries the customer's mobile,
 * so the trade can text the link themselves in one tap.
 */
export async function GET(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  if (!sm8Configured()) return NextResponse.json({ configured: false, bookings: [] })
  const url = new URL(request.url)
  const days = Math.min(14, Math.max(1, Number(url.searchParams.get('days')) || 7))
  try {
    const bookings = await fetchUpcoming({ days, fresh: url.searchParams.get('fresh') === '1' })
    return NextResponse.json({ configured: true, days, bookings })
  } catch (e) {
    const status = e.message === 'sm8_key_rejected' ? 401 : e.message === 'bad_number' ? 409 : 502
    return NextResponse.json({ error: e.message }, { status })
  }
}

/**
 * Two actions on a booking:
 *   card      — make the TurnUp card before the customer opens the link
 *   send_link — text the link through ServiceM8, so it lands in the job's
 *               own SMS history and diary and costs one of the account's
 *               SMS credits, exactly as if ServiceM8 had sent it
 */
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const body = await request.json().catch(() => ({}))
  try {
    const job = await fetchJob({ uuid: body.jobUuid, number: body.jobNumber })
    if (!job) return NextResponse.json({ error: 'sm8_job_not_found' }, { status: 404 })
    const contact = await fetchJobContact(job.uuid).catch(() => null)
    if (body.action === 'send_link') {
      const to = toE164(contact?.mobile || contact?.phone)
      if (!to) return NextResponse.json({ error: 'no_mobile' }, { status: 409 })
      const booking = await fetchNextBooking(job.uuid).catch(() => null)
      const first = (await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }).catch(() => null))?.engineerName?.split(' ')[0] || TRADE_NAME.split(' ')[0]
      const message = linkText({ tradeName: TRADE_NAME, first, customerName: contact ? [contact.first, contact.last].filter(Boolean).join(' ') : null, start: booking?.start, end: booking?.end, host: CANONICAL_HOST, jobNumber: job.generated_job_id })
      const r = await sendSms({ to, message, jobUuid: job.uuid })
      return NextResponse.json({ ok: true, sent: true, to: r.to, message })
    }
    const { tracker, created } = await findOrCreateForJob(job, contact)
    return NextResponse.json({ ok: true, created, code: tracker.code, id: tracker.id })
  } catch (e) {
    const status = e.message === 'sm8_key_rejected' ? 401 : e.message === 'bad_number' ? 409 : 502
    return NextResponse.json({ error: e.message }, { status })
  }
}
