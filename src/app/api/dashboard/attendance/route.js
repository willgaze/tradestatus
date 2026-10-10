import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { dbReason } from '@/lib/db-errors'
import { attendanceCsv } from '@/lib/attendance'
import { atLocalTime, isoDay } from '@/lib/when'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD
 * GET /api/dashboard/attendance?days=30
 *
 * The attendance record as a CSV: one row per visit, timestamped from the
 * trade's own taps. Operator only, like everything under /api/dashboard. The
 * range is in the trade's zone, inclusive at both ends, and a job is in it if
 * it was booked for a day in the range or anything happened to it then.
 */
const MAX_DAYS = 366
const DAY = 24 * 60 * 60 * 1000

function range(params) {
  const today = isoDay(new Date())
  const days = Math.min(MAX_DAYS, Math.max(1, Number(params.get('days')) || 30))
  const to = /^\d{4}-\d{2}-\d{2}$/.test(params.get('to') || '') ? params.get('to') : today
  const from = /^\d{4}-\d{2}-\d{2}$/.test(params.get('from') || '')
    ? params.get('from')
    : isoDay(new Date(atLocalTime(to, '00:00') - (days - 1) * DAY + DAY / 2))
  const start = atLocalTime(from, '00:00')
  const end = atLocalTime(new Date(atLocalTime(to, '00:00') + DAY + DAY / 2), '00:00')
  if (!start || !end || end <= start || end - start > (MAX_DAYS + 1) * DAY) return null
  return { from, to, start, end }
}

export async function GET(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const r = range(new URL(request.url).searchParams)
  if (!r) return NextResponse.json({ error: 'bad_range' }, { status: 400 })

  try {
    const trackers = await prisma.tradeStatus.findMany({
      where: {
        OR: [
          { scheduledFor: { gte: r.start, lt: r.end } },
          { events: { some: { createdAt: { gte: r.start, lt: r.end } } } },
        ],
      },
      include: { events: { orderBy: { createdAt: 'asc' } } },
      orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'asc' }],
      take: 2000,
    })
    const body = attendanceCsv(trackers)
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="turnup-attendance-${r.from}-to-${r.to}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('attendance export failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
