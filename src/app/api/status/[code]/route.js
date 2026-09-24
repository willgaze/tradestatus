import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicShape } from '@/lib/trade-status'

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

    return NextResponse.json({ status: publicShape(row) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('status lookup failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
