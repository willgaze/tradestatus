import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const keys = await prisma.passkey.findMany({ orderBy: { createdAt: 'asc' } })
    // Never return publicKey or counter: the dashboard has no use for either,
    // and a list endpoint should hand back the least it can.
    return NextResponse.json({
      passkeys: keys.map((k) => ({
        id: k.id, label: k.label,
        createdAt: k.createdAt, lastUsedAt: k.lastUsedAt,
      })),
    })
  } catch (error) {
    console.error('passkey list failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function DELETE(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const { id } = await request.json()
    await prisma.passkey.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    console.error('passkey delete failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
