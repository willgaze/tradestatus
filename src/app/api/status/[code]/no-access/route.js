import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { replyNoAccess } from '@/lib/no-access'

export const dynamic = 'force-dynamic'

// The customer's reply after "sorry we missed you": I'm here now, later
// today, another day. Public, like the page.
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() }, include: { noAccess: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true } } } })
    const latest = row?.noAccess?.[0]
    if (!row || !row.isActive || !latest || row.stage === 'DONE') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const body = await request.json().catch(() => ({}))
    const choice = String(body?.choice || '').toUpperCase()
    if (!['HERE', 'LATER', 'REBOOK'].includes(choice)) return NextResponse.json({ error: 'bad_choice' }, { status: 400 })
    await replyNoAccess(row, latest.id, choice)
    return NextResponse.json({ ok: true, reply: choice, replyAt: new Date().toISOString() })
  } catch (error) {
    console.error('no-access reply failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
