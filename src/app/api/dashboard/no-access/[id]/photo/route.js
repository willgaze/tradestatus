import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// The door photo. Operator only — it is evidence for the trade, never shown
// on the customer's page, which says only that one was taken and when.
export async function GET(_request, { params }) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const { id } = await params
  const row = await prisma.noAccess.findUnique({ where: { id }, select: { photo: true } }).catch(() => null)
  if (!row?.photo) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return new NextResponse(Buffer.from(row.photo), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600' } })
}
