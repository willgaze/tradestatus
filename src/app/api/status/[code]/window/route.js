import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanText } from '@/lib/clean-text'
import { proposeWindow, agreeWindow } from '@/lib/window'
import { dbReason } from '@/lib/db-errors'
import { atLocalTime } from '@/lib/when'

/**
 * The customer's half of agreeing a window: yes, or here is one that suits.
 *
 * Public, like the rest of `/api/status/[code]` — the customer has no account
 * and never will, so the code is the credential. Which means the same limits:
 * a revoked link cannot answer, and nothing here hands back a row.
 *
 * A counter-offer is simply a new proposal from the other side, so there is
 * only ever one window on the table and one party who last moved it. See the
 * state machine in src/lib/window.js.
 *
 * Note what this route does NOT return: the times it just stored. A customer's
 * pending counter says when a house is occupied, and this route is reachable
 * by anyone holding a forwarded link — so the answer is a confirmation, and
 * the sending device remembers what it asked for.
 */
export const dynamic = 'force-dynamic'

// A window is an arrangement for a day, not a booking system. Anything longer
// than a working day is a mistake or an attempt at one.
const MAX_HOURS = 12

/**
 * A time from the browser, held to the job's own booked day.
 *
 * Resolved in the trade's zone rather than UTC: somebody picking 9am means
 * nine o'clock where they are, and Britain is an hour ahead of UTC for seven
 * months of the year. Anchored to the job's own date so no string can move the
 * window onto a different day.
 */
const timeOnDay = (day, hhmm) => atLocalTime(day, hhmm)

export async function PUT(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 })
  }

  try {
    const row = await prisma.tradeStatus.findUnique({
      where: { code: String(code).toUpperCase() },
      select: { id: true, isActive: true, scheduledFor: true, windowState: true },
    })
    if (!row?.isActive) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // --- "That suits" ------------------------------------------------------
    if (body.action === 'agree') {
      // Nothing to agree to is not an error worth a stack trace, but it is not
      // an agreement either — saying yes to nothing must not create a window.
      if (row.windowState !== 'PROPOSED') {
        return NextResponse.json({ error: 'nothing_proposed' }, { status: 409 })
      }
      const updated = await prisma.tradeStatus.update({
        where: { id: row.id },
        data: agreeWindow({ by: 'CUSTOMER' }),
      })
      return NextResponse.json({ ok: true, state: updated.windowState, at: updated.windowAt })
    }

    // --- "Not then — how about this?" --------------------------------------
    if (body.action === 'counter') {
      const start = timeOnDay(row.scheduledFor, body.start)
      const end = body.end ? timeOnDay(row.scheduledFor, body.end) : null
      if (!start) return NextResponse.json({ error: 'bad_time' }, { status: 400 })
      if (end && end <= start) return NextResponse.json({ error: 'end_before_start' }, { status: 400 })
      if (end && end - start > MAX_HOURS * 3600 * 1000) {
        return NextResponse.json({ error: 'window_too_long' }, { status: 400 })
      }

      const updated = await prisma.tradeStatus.update({
        where: { id: row.id },
        data: proposeWindow({
          start,
          end,
          by: 'CUSTOMER',
          note: cleanText(body.note, 200),
        }),
      })
      return NextResponse.json({ ok: true, state: updated.windowState, at: updated.windowAt })
    }

    return NextResponse.json({ error: 'bad_action' }, { status: 400 })
  } catch (error) {
    console.error('window update failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
