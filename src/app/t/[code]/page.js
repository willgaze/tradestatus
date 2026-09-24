import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { publicShape } from '@/lib/trade-status'
import { TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import StatusTracker from '../StatusTracker'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your job | My Trade Status', robots: { index: false, follow: false } }

export default async function TrackPage({ params }) {
  const { code } = await params

  let status = null
  let unavailable = false
  try {
    const row = await prisma.tradeStatus.findUnique({
      where: { code: String(code).toUpperCase() },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    })
    if (row?.isActive) {
      status = publicShape(row)
      // One visit, one count — this runs per page load (force-dynamic) rather
      // than per poll. Deliberately not awaited: a counter must never hold up
      // or break the customer's page.
      prisma.tradeStatus
        .update({ where: { id: row.id }, data: { viewCount: { increment: 1 }, lastViewedAt: new Date() } })
        .catch(() => {})
    }
  } catch (error) {
    console.error('track lookup failed:', error)
    unavailable = true
  }

  if (!status) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 text-center">
        <h1 className="text-3xl font-bold">
          {unavailable ? 'Status unavailable right now' : 'That link has expired'}
        </h1>
        <p className="mt-4 text-slate-600">
          {unavailable
            ? 'Try again in a minute. If it still will not load, ring and someone will tell you where things are.'
            : 'Tracking links are switched off once a job is finished and settled.'}
        </p>
        {TRADE_PHONE && (
          <a href={`tel:${TRADE_PHONE_TEL}`}
             className="mx-auto mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">
            Call {TRADE_PHONE}
          </a>
        )}
        <p className="mt-8 text-sm text-slate-400"><Link href="/" className="underline">My Trade Status</Link></p>
      </main>
    )
  }

  return <StatusTracker initialStatus={status} />
}
