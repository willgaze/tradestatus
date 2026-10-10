import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { prisma } from '@/lib/prisma'
import { recordNoAccess } from '@/lib/no-access'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const { id } = await params
  try {
    const tracker = await prisma.tradeStatus.findUnique({ where: { id } })
    if (!tracker || !tracker.isActive) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const body = await request.json()
    const r = await recordNoAccess(tracker, body)
    return NextResponse.json(r, { status: 201 })
  } catch (error) {
    if (error?.message === 'photo_too_big') return NextResponse.json({ error: 'photo_too_big' }, { status: 413 })
    console.error('no-access failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
