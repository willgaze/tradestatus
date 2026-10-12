import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { dbReason } from '@/lib/db-errors'
import { attachTracker, detachTracker, trackersOnCard } from '@/lib/arrivals'

/**
 * Which of the trade's jobs sit on which household card.
 *
 * Attaching is a deliberate act by the trade, never a guess from a matching
 * address. Two flats at one postcode, a landlord and a tenant, a job at the
 * mother-in-law's — an address match would put somebody's name and booking on
 * a stranger's card, and that card is a link anyone can forward. One tap is
 * cheap; that mistake is not.
 */
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const code = new URL(request.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Which card?' }, { status: 400 })
  return NextResponse.json({ codes: await trackersOnCard(code) })
}

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const body = await request.json().catch(() => ({}))
    const place = String(body?.code || '').toUpperCase()
    const job = String(body?.trackerCode || '').toUpperCase()
    if (!place || !job) return NextResponse.json({ error: 'Need a card and a job.' }, { status: 400 })

    const tracker = await prisma.tradeStatus.findUnique({ where: { code: job } })
    if (!tracker) return NextResponse.json({ error: 'No such job.' }, { status: 404 })

    const result = await attachTracker(place, tracker)
    if (!result.ok) {
      const missing = result.why === 'no_such_card'
      return NextResponse.json({ error: missing ? 'No such card.' : 'Could not add it.' },
                               { status: missing ? 404 : 503 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('attach job to card failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function DELETE(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const body = await request.json().catch(() => ({}))
    await detachTracker(String(body?.code || ''), String(body?.trackerCode || ''))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('detach job from card failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
