import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { generateCode, isValidStage } from '@/lib/trade-status'

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
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
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

    const tracker = await prisma.tradeStatus.create({
      data: {
        code: generateCode(),
        jobRef: body.jobRef?.trim() || null,
        externalId: body.externalId?.trim() || null,
        customerName: body.customerName?.trim() || null,
        jobAddress: body.jobAddress?.trim() || null,
        jobSummary: body.jobSummary?.trim() || null,
        stage,
        stageNote: body.stageNote?.trim() || null,
        scheduledFor,
        events: { create: { stage, note: body.stageNote?.trim() || null } },
      },
    })
    return NextResponse.json({ tracker }, { status: 201 })
  } catch (error) {
    console.error('tracker create failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
