import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { cleanText } from '@/lib/clean-text'
import { dbReason } from '@/lib/db-errors'
import { createPlace, inboxAddress, INBOUND_HOST, INBOUND_CONFIGURED } from '@/lib/arrivals'

/**
 * Household cards, from the trade's side.
 *
 * A card belongs to a door, not to a job: one address, everything coming to
 * it, the trade's own visit sitting in the list alongside four parcels. The
 * trade makes it, sends the link, and hands over the forwarding address — and
 * from then on the household feeds it themselves.
 *
 * Two secrets per card and they are never shown in the same breath: the code
 * is the read half and goes to the customer, the inbox key is the write half
 * and goes into a mail rule. Both are on this page because this page is
 * behind a password; neither is ever on the card itself.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const rows = await prisma.place.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { arrivals: true } } },
    })
    return NextResponse.json({
      configured: INBOUND_CONFIGURED,
      host: INBOUND_HOST,
      places: rows.map((p) => ({
        code: p.code,
        label: p.label,
        inbox: inboxAddress(p.inboxKey),
        arrivals: p._count.arrivals,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    // New tables fail soft: no migration yet means no cards, not a broken
    // dashboard. See the migration table in CLAUDE.md.
    if (error?.code === 'P2021' || error?.code === 'P2022') {
      return NextResponse.json({ configured: false, host: INBOUND_HOST, places: [] })
    }
    console.error('places read failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const body = await request.json().catch(() => ({}))
    const place = await createPlace(cleanText(body?.label, 80))
    if (!place) return NextResponse.json({ error: 'Could not make a card. Try again.' }, { status: 503 })
    return NextResponse.json({
      place: { code: place.code, label: place.label, inbox: inboxAddress(place.inboxKey), arrivals: 0 },
    })
  } catch (error) {
    console.error('place create failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function DELETE(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const body = await request.json().catch(() => ({}))
    const code = String(body?.code || '').toUpperCase()
    if (!code) return NextResponse.json({ error: 'Which card?' }, { status: 400 })
    // Revoked, never deleted: the same rule as a job link. The row stays so a
    // forwarded email to a dead inbox key has somewhere to be refused.
    await prisma.place.update({ where: { code }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'No such card.' }, { status: 404 })
    console.error('place revoke failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
