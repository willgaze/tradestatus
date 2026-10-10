import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ask } from '@/lib/nudge'

export const dynamic = 'force-dynamic'

// "Are you still coming?" — public, like the page; the code is the credential.
// Once per ten minutes per job, then it buzzes the trade's phones.
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive || row.stage === 'DONE') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const r = await ask(row)
    return NextResponse.json({ ok: true, askedAt: new Date().toISOString(), repeated: Boolean(r.repeated), devices: r.devices ?? null })
  } catch (error) {
    console.error('ask failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
