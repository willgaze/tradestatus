import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chooseAfterMissed } from '@/lib/nudge'

export const dynamic = 'force-dynamic'

// After a missed window: wait, later today, or another day. Public, like the
// page; only accepted once the page has actually been told (missedAt set).
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive || !row.missedAt || ['ON_SITE', 'DONE'].includes(row.stage)) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const body = await request.json().catch(() => ({}))
    const choice = String(body?.choice || '').toUpperCase()
    if (!['WAIT', 'LATER', 'REBOOK'].includes(choice)) return NextResponse.json({ error: 'bad_choice' }, { status: 400 })
    await chooseAfterMissed(row, choice)
    return NextResponse.json({ ok: true, missedChoice: choice, missedChoiceAt: new Date().toISOString() })
  } catch (error) {
    console.error('missed choice failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
