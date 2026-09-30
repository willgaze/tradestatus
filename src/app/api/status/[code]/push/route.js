import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pushConfigured } from '@/lib/push'
import { dbReason } from '@/lib/db-errors'

/**
 * A customer's browser asking to be told when their job moves.
 *
 * Public, like the rest of /api/status/[code]: the customer has no account and
 * never will, so the tracking code is the credential. Which means the same
 * rules apply — a revoked link cannot subscribe, and nothing here ever hands
 * back a row.
 *
 * What is stored is the browser's push endpoint and its own public key. Those
 * are not credentials for anything of ours: they let this server encrypt a
 * message to one browser and nothing else. They are still never read back out
 * by any route, because there is no reason for anything to read them but the
 * sender.
 */
export const dynamic = 'force-dynamic'

const MAX_ENDPOINT = 1024
const MAX_KEY = 256

/** The code has to name a live job before anything is written. */
async function liveJob(code) {
  if (!code || code.length > 32) return null
  const row = await prisma.tradeStatus.findUnique({
    where: { code: String(code).toUpperCase() },
    select: { id: true, isActive: true },
  })
  return row?.isActive ? row : null
}

export async function POST(request, { params }) {
  if (!pushConfigured()) {
    return NextResponse.json({ error: 'push_not_configured' }, { status: 503 })
  }

  const { code } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 })
  }

  // Everything below arrives from a browser and is whatever it sent. Checked
  // for shape and length rather than assumed — an endpoint is a URL at a push
  // service, not a place to store someone's clipboard.
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  const p256dh = typeof body?.keys?.p256dh === 'string' ? body.keys.p256dh.trim() : ''
  const auth = typeof body?.keys?.auth === 'string' ? body.keys.auth.trim() : ''

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'bad_subscription' }, { status: 400 })
  }
  if (endpoint.length > MAX_ENDPOINT || p256dh.length > MAX_KEY || auth.length > MAX_KEY) {
    return NextResponse.json({ error: 'bad_subscription' }, { status: 400 })
  }
  if (!/^https:\/\//i.test(endpoint)) {
    return NextResponse.json({ error: 'bad_subscription' }, { status: 400 })
  }

  try {
    const job = await liveJob(code)
    if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // Upsert on the endpoint, which the browser keeps stable: a customer who
    // taps the button three times gets one notification, not three. It also
    // moves a re-used endpoint onto the current job rather than leaving it
    // pointing at an old one.
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh, auth, tradeStatusId: job.id },
      update: { p256dh, auth, tradeStatusId: job.id, failureCount: 0 },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('push subscribe failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

/** Turning notifications off again. Idempotent: gone is gone. */
export async function DELETE(request, { params }) {
  const { code } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 })
  }

  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  if (!endpoint) return NextResponse.json({ error: 'bad_subscription' }, { status: 400 })

  try {
    const job = await liveJob(code)
    if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // Scoped to this job as well as this endpoint, so holding a link to one
    // job cannot switch off notifications for another.
    await prisma.pushSubscription.deleteMany({ where: { endpoint, tradeStatusId: job.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('push unsubscribe failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
