import { NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicShape } from '@/lib/trade-status'
import { publicProfile, publicBrand } from '@/lib/profile'
import { syncIfStale } from '@/lib/servicem8'
import { nudgeIfDue } from '@/lib/nudge'

// Public on purpose — the customer has no account and never will. The code is
// the credential, so it is unguessable and revocable, and this hands back only
// publicShape(), never the row.
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  try {
    const row = await prisma.tradeStatus.findUnique({
      where: { code: code.toUpperCase() },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    })
    if (!row || !row.isActive) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // No view counted here. StatusTracker polls this route every 30 seconds,
    // so counting a view per response meant a customer who left the tab open
    // logged 120 "views" an hour and the number meant nothing. The page itself
    // counts the visit; this route only answers the poll.

    // Pull on read: if this job follows a ServiceM8 job and we have not looked
    // for a minute, look — AFTER the response has gone, so the page is never a
    // millisecond slower or a byte wronger for it. The poll every 30 seconds
    // picks up whatever moved.
    after(async () => { await syncIfStale(row); await nudgeIfDue(row) })

    const status = publicShape(row)
    const arriving = status.stage === 'ON_MY_WAY' || status.stage === 'ON_SITE'
    const [profile, brand] = await Promise.all([arriving ? publicProfile() : null, publicBrand()])

    return NextResponse.json({ status, profile, brand }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('status lookup failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
