import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'

/** The dashboard saying "still here". Once a minute while it is open. */
export async function POST() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    await prisma.tradeProfile.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', lastSeenAt: new Date() }, update: { lastSeenAt: new Date() } })
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch { return NextResponse.json({ ok: false }, { status: 503 }) }
}
