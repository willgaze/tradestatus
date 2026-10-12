import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { sm8Configured, fetchUpcoming, fetchJob, fetchJobContact, findOrCreateForJob } from '@/lib/servicem8'

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
    const status = e.message === 'sm8_key_rejected' ? 401 : 502
    return NextResponse.json({ error: e.message }, { status })
  }
}

/** Make the card for a booking before the customer opens the link, so it is ready. */
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const body = await request.json().catch(() => ({}))
  try {
    const job = await fetchJob({ uuid: body.jobUuid, number: body.jobNumber })
    if (!job) return NextResponse.json({ error: 'sm8_job_not_found' }, { status: 404 })
    const contact = await fetchJobContact(job.uuid).catch(() => null)
    const { tracker, created } = await findOrCreateForJob(job, contact)
    return NextResponse.json({ ok: true, created, code: tracker.code, id: tracker.id })
  } catch (e) {
    const status = e.message === 'sm8_key_rejected' ? 401 : 502
    return NextResponse.json({ error: e.message }, { status })
  }
}
