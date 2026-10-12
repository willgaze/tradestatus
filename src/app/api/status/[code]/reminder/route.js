import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { replyReminder } from '@/lib/nudge'

export const dynamic = 'force-dynamic'

// The customer's reply to the day-before reminder: still fine, someone else
// will be in, or move it. Public, like the page; the code is the credential.
// A reply can be changed (plans do) and each one reaches the trade's phone.
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive || row.stage !== 'BOOKED') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const body = await request.json().catch(() => ({}))
    const r = await replyReminder(row, String(body.choice || '').toUpperCase())
    return NextResponse.json(r)
  } catch (error) {
    if (error?.message === 'bad_choice') return NextResponse.json({ error: 'bad_choice' }, { status: 400 })
    console.error('reminder reply failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
