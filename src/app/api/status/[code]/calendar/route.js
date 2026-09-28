import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicShape } from '@/lib/trade-status'
import { buildIcs } from '@/lib/calendar'
import { rpFromRequest } from '@/lib/webauthn'

export const dynamic = 'force-dynamic'

// Public, like the page: the code is the credential.
export async function GET(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const { origin } = await rpFromRequest()
    const ics = buildIcs(publicShape({ ...row, events: [] }), `${origin}/t/${row.code}`)
    if (!ics) return NextResponse.json({ error: 'no_date' }, { status: 404 })

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${row.code}.ics"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('calendar build failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
