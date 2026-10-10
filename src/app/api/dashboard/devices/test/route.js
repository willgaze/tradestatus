import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { pushTrade, pushConfigured } from '@/lib/push'

/**
 * "Did that work?" answered by the phone buzzing, rather than by reading a
 * line of text that says it should have.
 *
 * Setting push up is four screens across two devices, and at the end of it
 * the only confirmation was a sentence saying a phone was registered. That is
 * not the same as a notification arriving, and the gap between them is where
 * somebody gives up. One tap, one buzz, no job to move and nothing to
 * interpret.
 *
 * Guards itself like every handler under /api/dashboard — it makes somebody's
 * phone light up, which is not a thing a stranger gets to do.
 */
export const dynamic = 'force-dynamic'

export async function POST() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  if (!pushConfigured()) return NextResponse.json({ error: 'push_not_configured' }, { status: 503 })

  // Deliberately looks like a real nudge rather than a lorem-ipsum test, so
  // what lands on the lock screen is what will land on it at 8am. It still
  // obeys the lock-screen rule: no customer, no address, no job.
  const { sent, dropped } = await pushTrade({
    title: 'TurnUp — test',
    body: 'Notifications are working on this phone.',
    url: '/dashboard',
    tag: 'turnup-test',
  })
  return NextResponse.json({ sent, dropped })
}
