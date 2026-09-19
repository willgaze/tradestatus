import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { isValidStage } from '@/lib/trade-status'

export const dynamic = 'force-dynamic'

// What the one-tap stage buttons hit, so it does the least possible work.
export async function PATCH(request, { params }) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const { id } = await params
  try {
    const body = await request.json()
    const data = {}

    if (body.stage !== undefined) {
      if (!isValidStage(body.stage)) return NextResponse.json({ error: 'bad_stage' }, { status: 400 })
      data.stage = body.stage
      // Setting off is the moment worth stamping: the one the customer is
      // waiting on, and a record of what happened rather than a promise.
      data.arrivingAt = body.stage === 'ON_MY_WAY' ? new Date() : null
    }

    for (const f of ['jobRef', 'customerName', 'jobAddress', 'jobSummary', 'stageNote']) {
      if (body[f] !== undefined) data[f] = body[f]?.trim() || null
    }

    if (body.scheduledFor !== undefined) {
      const when = body.scheduledFor ? new Date(body.scheduledFor) : null
      if (when && Number.isNaN(when.getTime())) {
        return NextResponse.json({ error: 'bad_scheduled_date' }, { status: 400 })
      }
      data.scheduledFor = when
    }

    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 })
    }
    if (data.stage) {
      data.events = { create: { stage: data.stage, note: data.stageNote ?? body.stageNote ?? null } }
    }

    const tracker = await prisma.tradeStatus.update({ where: { id }, data })
    return NextResponse.json({ tracker })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    console.error('tracker update failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}

// Revoking a link deactivates it; the job history stays.
export async function DELETE(request, { params }) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const { id } = await params
  try {
    await prisma.tradeStatus.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    console.error('tracker revoke failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
