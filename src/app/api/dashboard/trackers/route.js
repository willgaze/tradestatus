import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { generateCode, isValidStage } from '@/lib/trade-status'
import { dbReason } from '@/lib/db-errors'
import { cleanText } from '@/lib/clean-text'
import { sm8Configured, fetchJob, fetchJobContact, syncTracker } from '@/lib/servicem8'

export const dynamic = 'force-dynamic'

/**
 * A day's run, in the order it happens.
 *
 * This used to be `updatedAt desc`, which sounds reasonable and puts the job
 * you have just finished at the top of the list — above the one you are
 * driving to next. Tapping "Done" pushed that job to the top; tomorrow's work
 * sank below yesterday's.
 *
 * So: unfinished work first, soonest booked day first, and finished jobs at
 * the bottom with the most recent of them first. A job with no day set has not
 * been arranged yet and sits after the ones that have.
 *
 * Done in JavaScript rather than SQL because "DONE last" is not an ordering
 * Postgres knows about and a CASE expression here would be harder to read than
 * the thing it replaces. The route takes 100 rows.
 */
const STAGE_RANK = { ON_SITE: 0, ON_MY_WAY: 1, PAUSED: 2, BOOKED: 3, DONE: 4 }
const FAR_FUTURE = 8.64e15

function inRunOrder(rows) {
  const day = (r) => (r.scheduledFor ? new Date(r.scheduledFor).getTime() : FAR_FUTURE)
  const finished = (r) => (r.stage === 'DONE' ? 1 : 0)
  return [...rows].sort((a, b) =>
    // A revoked link is not work; it goes to the very bottom either way.
    Number(b.isActive) - Number(a.isActive) ||
    finished(a) - finished(b) ||
    // Finished jobs read newest-first; everything else reads soonest-first.
    (finished(a) ? new Date(b.updatedAt) - new Date(a.updatedAt) : day(a) - day(b)) ||
    (STAGE_RANK[a.stage] ?? 9) - (STAGE_RANK[b.stage] ?? 9) ||
    new Date(b.updatedAt) - new Date(a.updatedAt),
  )
}

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  try {
    const trackers = await prisma.tradeStatus.findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
    })
    return NextResponse.json({ trackers: inRunOrder(trackers) })
  } catch (error) {
    console.error('tracker list failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  try {
    const body = await request.json()
    const stage = isValidStage(body.stage) ? body.stage : 'BOOKED'
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null
    if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ error: 'bad_scheduled_date' }, { status: 400 })
    }

    // A ServiceM8 job number is the whole form: name, mobile, address and the
    // job come from there, and the tracker follows the job from then on.
    let fromSm8 = null
    if (body.sm8JobNumber && sm8Configured()) {
      const job = await fetchJob({ number: body.sm8JobNumber }).catch(() => null)
      if (!job) return NextResponse.json({ error: 'sm8_job_not_found' }, { status: 404 })
      const contact = await fetchJobContact(job.uuid).catch(() => null)
      fromSm8 = {
        externalId: job.uuid,
        jobRef: String(job.generated_job_id || body.sm8JobNumber),
        customerName: [contact?.first, contact?.last].filter(Boolean).join(' ') || null,
        customerPhone: contact?.mobile || contact?.phone || null,
        jobAddress: String(job.job_address || '').replace(/\s*\n\s*/g, ', ') || null,
        jobSummary: String(job.job_description || '').split('\n')[0].slice(0, 120) || null,
      }
    }

    const stageNote = cleanText(body.stageNote)
    const fields = {
      jobRef: cleanText(body.jobRef) || fromSm8?.jobRef || null,
      externalId: cleanText(body.externalId) || fromSm8?.externalId || null,
      customerName: cleanText(body.customerName) || fromSm8?.customerName || null,
      customerPhone: cleanText(body.customerPhone, 32) || fromSm8?.customerPhone || null,
      jobAddress: cleanText(body.jobAddress) || fromSm8?.jobAddress || null,
      jobSummary: cleanText(body.jobSummary) || fromSm8?.jobSummary || null,
      stage,
      stageNote,
      scheduledFor,
      windowStart: body.windowStart ? new Date(body.windowStart) : null,
      windowEnd: body.windowEnd ? new Date(body.windowEnd) : null,
      position: body.position ? Math.max(1, Math.round(Number(body.position))) : null,
      events: { create: { stage, note: stageNote } },
    }

    // `code` is unique and generateCode() is random, so a collision is possible
    // even if it is vanishingly unlikely. Without this, that collision surfaces
    // as a P2002 in the catch below, which dbReason() reports as a database
    // fault — for something a second attempt fixes. Retry, then give up
    // honestly rather than pretending the database is broken.
    let tracker = null
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        tracker = await prisma.tradeStatus.create({ data: { ...fields, code: generateCode() } })
        break
      } catch (error) {
        const collided = error?.code === 'P2002' && String(error?.meta?.target ?? '').includes('code')
        if (!collided) throw error
      }
    }
    if (!tracker) return NextResponse.json({ error: 'code_collision' }, { status: 503 })
    // Linked at birth: take the job's real state straight away.
    if (fromSm8) await syncTracker(tracker, { source: 'sync.create' })

    return NextResponse.json({ tracker }, { status: 201 })
  } catch (error) {
    console.error('tracker create failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
