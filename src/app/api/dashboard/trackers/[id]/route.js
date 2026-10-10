import { NextResponse } from 'next/server'
import { runningLate, answeredByStage } from '@/lib/nudge'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { isValidStage } from '@/lib/trade-status'
import { dbReason } from '@/lib/db-errors'
import { cleanText } from '@/lib/clean-text'
import { notifyStage } from '@/lib/push'
import { proposeWindow, agreeWindow, clearWindow } from '@/lib/window'
import { normaliseW3w, normaliseMapPin, normalisePhotoUrl } from '@/lib/places'

export const dynamic = 'force-dynamic'

// What the one-tap stage buttons hit, so it does the least possible work.
export async function PATCH(request, { params }) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const { id } = await params
  try {
    const body = await request.json()
    const data = {}
    const current = await prisma.tradeStatus.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // "About 30 minutes late": the trade's own estimate, written to the card
    // with the time it was said, pushed to the customer, and it answers an
    // open "are you still coming?". Null clears it.
    if (body.lateMinutes !== undefined) {
      const updated = await runningLate(current, body.lateMinutes === null ? null : Number(body.lateMinutes))
      return NextResponse.json({ tracker: updated })
    }

    if (body.stage !== undefined) {
      if (!isValidStage(body.stage)) return NextResponse.json({ error: 'bad_stage' }, { status: 400 })
      data.stage = body.stage
      Object.assign(data, answeredByStage(current))
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

    for (const f of ['jobRef', 'customerName', 'customerPhone', 'jobAddress', 'jobSummary', 'stageNote']) {
      if (body[f] !== undefined) data[f] = cleanText(body[f])
    }
    // Finding the door. Photos are set from here, by the trade, on the first
    // visit — a URL for now, a camera button once there is somewhere to put
    // the file. The customer's public route deliberately cannot set these.
    if (body.housePhoto !== undefined) data.housePhoto = normalisePhotoUrl(body.housePhoto)
    if (body.doorPhoto !== undefined) data.doorPhoto = normalisePhotoUrl(body.doorPhoto)
    if (body.mapPin !== undefined) data.mapPin = normaliseMapPin(body.mapPin)
    if (body.what3words !== undefined) data.what3words = normaliseW3w(body.what3words)

    // A window is an arrangement now, not a field. Setting one is a PROPOSAL
    // the customer can agree to or counter; "windowAgree" takes their counter.
    // See the state machine in src/lib/window.js.
    if (body.windowAgree) {
      Object.assign(data, agreeWindow({ by: 'TRADE' }))
    } else if (body.windowClear) {
      Object.assign(data, clearWindow())
    } else if (body.windowStart !== undefined || body.windowEnd !== undefined) {
      const at = {}
      for (const f of ['windowStart', 'windowEnd']) {
        if (body[f] !== undefined) {
          const when = body[f] ? new Date(body[f]) : null
          if (when && Number.isNaN(when.getTime())) {
            return NextResponse.json({ error: 'bad_window' }, { status: 400 })
          }
          at[f] = when
        }
      }
      // Clearing the start clears the arrangement: there is nothing on the
      // table to agree to, and leaving a dangling end time would say there is.
      if (body.windowStart !== undefined && !at.windowStart) {
        Object.assign(data, clearWindow())
      } else {
        // Narrowing one end of a window that already exists keeps the other.
        const current = await prisma.tradeStatus.findUnique({
          where: { id },
          select: { windowStart: true, windowEnd: true },
        })
        const start = at.windowStart !== undefined ? at.windowStart : current?.windowStart ?? null
        const end = at.windowEnd !== undefined ? at.windowEnd : current?.windowEnd ?? null
        if (start && end && end <= start) {
          return NextResponse.json({ error: 'window_backwards' }, { status: 400 })
        }
        // Proposing again reopens it: a window the customer already agreed to
        // and the trade then moved is not still agreed.
        Object.assign(data, proposeWindow({ start, end, by: 'TRADE', note: null }))
      }
    }

    if (body.position !== undefined) {
      const n = Number(body.position)
      data.position = body.position === null || Number.isNaN(n) ? null : Math.max(1, Math.round(n))
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

    // Tell any device watching this job that it moved.
    //
    // Deliberately not awaited, and deliberately swallowed. This runs on the
    // tap of a stage button on a driveway: the trade is waiting on this
    // response, and it must not be held up by a round trip to Apple's push
    // service — nor fail because that service is having a bad afternoon.
    // notifyStage() never throws, but the catch is here anyway, because the
    // thing that must survive is the stage change.
    if (data.stage) {
      notifyStage(tracker, data.stage).catch((error) =>
        console.error('push: notify failed after stage change:', error?.message),
      )
    }

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
