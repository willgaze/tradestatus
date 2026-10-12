import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'
const MAX = 450_000

/** The trade's own photo, from the phone's camera or roll. One, replaced on each upload. */
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const body = await request.json().catch(() => ({}))
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.photo || ''))
    if (!m) return NextResponse.json({ error: 'jpeg_only' }, { status: 400 })
    const buf = Buffer.from(m[1], 'base64')
    if (buf.length < 100 || buf.length > MAX) return NextResponse.json({ error: 'photo_too_big' }, { status: 413 })
    if (!(buf[0] === 0xff && buf[1] === 0xd8)) return NextResponse.json({ error: 'jpeg_only' }, { status: 400 })
    const now = new Date()
    await prisma.tradeProfile.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', engineerPhotoData: buf, engineerPhotoAt: now }, update: { engineerPhotoData: buf, engineerPhotoAt: now } })
    return NextResponse.json({ ok: true, url: `/api/profile/photo?v=${now.getTime()}`, bytes: buf.length })
  } catch (error) {
    console.error('profile photo failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}

export async function DELETE() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    await prisma.tradeProfile.update({ where: { id: 'singleton' }, data: { engineerPhotoData: null, engineerPhotoAt: null } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: true }) }
}
