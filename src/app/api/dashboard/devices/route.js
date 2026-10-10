import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { prisma } from '@/lib/prisma'
import { pushConfigured, tradeDeviceCount } from '@/lib/push'

export const dynamic = 'force-dynamic'

// The trade's own phones, for nudges. Operator only.
export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  return NextResponse.json({ configured: pushConfigured(), count: await tradeDeviceCount() })
}

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const sub = await request.json()
    const endpoint = String(sub?.endpoint || '')
    const p256dh = String(sub?.keys?.p256dh || ''), auth = String(sub?.keys?.auth || '')
    if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) return NextResponse.json({ error: 'bad_subscription' }, { status: 400 })
    const label = String(request.headers.get('user-agent') || '').slice(0, 120)
    await prisma.tradeDevice.upsert({ where: { endpoint }, create: { endpoint, p256dh, auth, label }, update: { p256dh, auth, label, failureCount: 0 } })
    return NextResponse.json({ ok: true, count: await tradeDeviceCount() }, { status: 201 })
  } catch (error) {
    console.error('device save failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}

export async function DELETE(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const { endpoint } = await request.json()
    if (endpoint) await prisma.tradeDevice.deleteMany({ where: { endpoint: String(endpoint) } })
    return NextResponse.json({ ok: true, count: await tradeDeviceCount() })
  } catch (error) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
