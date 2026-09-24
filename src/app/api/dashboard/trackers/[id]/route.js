import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { isValidStage } from '@/lib/trade-status'
import { dbReason } from '@/lib/db-errors'
import { cleanText } from '@/lib/clean-text'

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
      //
      // Only ever stamped on the way INTO On my way, and only cleared by going
      // back to Booked in. This used to read `: null` for every other stage,
      // which wiped the time the moment he arrived — so "Set off at 14:20"
      // vanished from the customer's page at exactly the point it became the
      // interesting part of the record.
      if (body.stage === 'ON_MY_WAY') data.arrivingAt = new Date()
      else if (body.stage === 'BOOKED') data.arrivingAt = null
    }

    for (const f of ['jobRef', 'customerName', 'jobAddress', 'jobSummary', 'stageNote']) {
      if (body[f] !== undefined) data[f] = cleanText(body[f])
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
      data.events = { create: { stage: data.stage, note: data.stageNote ?? cleanText(body.stageNote) } }
    }

    const tracker = await prisma.tradeStatus.update({ where: { id }, data })
    return NextResponse.json({ tracker })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    console.error('tracker update failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
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
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
