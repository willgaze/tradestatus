import { NextResponse } from 'next/server'
import { nudgeAll } from '@/lib/nudge'

export const dynamic = 'force-dynamic'

/**
 * Sweep every live job and send whatever nudge is due. Idempotent and cheap,
 * so it is left open: each level fires once and a repeat is paced to ten
 * minutes, whoever calls it. Point a scheduler at it every five minutes —
 * Vercel Cron on a plan that allows it, or any free pinger. Without one the
 * same check still runs every time a customer's page polls, which is when
 * it matters most.
 */
export async function GET() {
  try {
    const r = await nudgeAll()
    return NextResponse.json({ ok: true, at: new Date().toISOString(), ...r })
  } catch (error) {
    console.error('cron nudge failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
