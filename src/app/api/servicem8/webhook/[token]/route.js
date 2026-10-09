import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { webhookToken, jobUuidFromDelivery, eventNameFromDelivery, syncByJobUuid, sm8Configured } from '@/lib/servicem8'

/**
 * Where ServiceM8 rings the doorbell.
 *
 * Public by necessity — ServiceM8 calls it — and guarded three ways:
 *   1. The URL carries a long random token (SM8_WEBHOOK_TOKEN). Wrong or
 *      missing token answers 404, the same as any unknown page, so the route
 *      cannot be found by probing.
 *   2. The body is never trusted. We take the job uuid out of it and ask the
 *      ServiceM8 API, with our own key, what is actually true.
 *   3. Nothing it does cannot be redone: the sync is idempotent, so a replay,
 *      a duplicate or a delivery out of order lands on the same state.
 *
 * ServiceM8 wants a 2xx within 10 seconds or it marks the delivery failed and,
 * after enough failures, switches the subscription off. The API calls have a
 * 6-second ceiling, so the whole thing answers in time; and if it ever does
 * not, the next customer page load pulls the same truth anyway.
 */
export const dynamic = 'force-dynamic'

const same = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''))
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y)
}

export async function POST(request, { params }) {
  const { token } = await params
  const expected = webhookToken()
  if (!expected || !same(token, expected)) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (!sm8Configured()) return NextResponse.json({ ok: true, outcome: 'not_configured' })

  let body = {}
  try {
    const text = await request.text()
    try { body = JSON.parse(text) } catch { body = Object.fromEntries(new URLSearchParams(text)) }
  } catch { body = {} }

  const jobUuid = jobUuidFromDelivery(body)
  if (!jobUuid) return NextResponse.json({ ok: true, outcome: 'no_job_in_delivery' })

  const result = await syncByJobUuid(jobUuid, { source: eventNameFromDelivery(body) })
  return NextResponse.json({ ok: true, ...result })
}

// Some webhook consoles send a GET to check the URL exists. It does, quietly.
export async function GET(request, { params }) {
  const { token } = await params
  if (!same(token, webhookToken())) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
