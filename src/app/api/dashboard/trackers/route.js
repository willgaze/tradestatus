import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { generateCode, isValidStage } from '@/lib/trade-status'
import { dbReason } from '@/lib/db-errors'
import { cleanText } from '@/lib/clean-text'

export const dynamic = 'force-dynamic'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  try {
    const trackers = await prisma.tradeStatus.findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
    })
    return NextResponse.json({ trackers })
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

    const stageNote = cleanText(body.stageNote)
    const fields = {
      jobRef: cleanText(body.jobRef),
      externalId: cleanText(body.externalId),
      customerName: cleanText(body.customerName),
      jobAddress: cleanText(body.jobAddress),
      jobSummary: cleanText(body.jobSummary),
      stage,
      stageNote,
      scheduledFor,
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

    return NextResponse.json({ tracker }, { status: 201 })
  } catch (error) {
    console.error('tracker create failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
