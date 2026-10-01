import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'

/**
 * The waiting list, for the one person allowed to read it.
 *
 * Guards itself, like every route under /api/dashboard — there is no
 * middleware here and there should not be one. This is a list of other
 * people's email addresses; an unguarded handler is a leak of every one of
 * them at once.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  try {
    const waitlist = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({ waitlist })
  } catch (error) {
    // The table may not exist yet. An empty list is the honest answer for a
    // dashboard section — it must not take the whole screen down with it.
    console.error('waitlist read failed:', error?.code || error?.message)
    return NextResponse.json({ waitlist: [] })
  }
}

export async function PATCH(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 })
  }
  const id = typeof body?.id === 'string' ? body.id : null
  if (!id) return NextResponse.json({ error: 'bad_id' }, { status: 400 })

  try {
    await prisma.waitlist.update({ where: { id }, data: { contacted: Boolean(body.contacted) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('waitlist update failed:', error?.code || error?.message)
    return NextResponse.json({ error: 'not_saved' }, { status: 503 })
  }
}
