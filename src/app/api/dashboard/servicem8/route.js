import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { sm8Configured, webhookToken, callbackUrl, listSubscriptions, subscribe, unsubscribe, syncTracker, fetchJob, EVENTS } from '@/lib/servicem8'

export const dynamic = 'force-dynamic'

const origin = (request) => {
  const h = request.headers
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || (String(host).startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** What the panel shows: configured? subscribed? what happened lately? */
export async function GET(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const state = { configured: sm8Configured(), hasToken: Boolean(webhookToken()), callbackUrl: callbackUrl(origin(request)), events: EVENTS }
  if (state.configured) {
    try {
      const subs = await listSubscriptions()
      state.subscriptions = subs.filter((s) => s.unique_id === 'turnup' || String(s.callback_url || '').includes('/api/servicem8/webhook/'))
        .map((s) => ({ event: s.event, callback_url: s.callback_url, active: s.active ?? 1 }))
    } catch (e) { state.subscriptionsError = e.message }
  }
  try {
    state.recent = await prisma.sm8Event.findMany({ orderBy: { receivedAt: 'desc' }, take: 12 })
    state.linked = await prisma.sm8Link.count()
  } catch (e) { state.tablesMissing = true }
  return NextResponse.json(state)
}

/** Actions: subscribe, unsubscribe, sync (all linked), link (one tracker to a job number). */
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const body = await request.json().catch(() => ({}))
  try {
    if (body.action === 'subscribe') {
      const results = await subscribe(origin(request))
      // "Being activated" is not a failure, it is a wait. Say so with a code
      // the panel can act on, rather than a list of five identical errors.
      const activating = results.some((x) => !x.ok && /being activated|try again/i.test(x.error || ''))
      return NextResponse.json({ results, activating }, { status: activating ? 202 : 200 })
    }
    if (body.action === 'unsubscribe') return NextResponse.json({ removed: await unsubscribe() })
    if (body.action === 'sync') {
      const linked = await prisma.tradeStatus.findMany({ where: { isActive: true, externalId: { not: null } } })
      const results = []
      for (const t of linked) results.push({ id: t.id, code: t.code, ...(await syncTracker(t, { source: 'sync.manual' })) })
      return NextResponse.json({ results })
    }
    if (body.action === 'link') {
      const job = await fetchJob({ number: body.jobNumber })
      if (!job) return NextResponse.json({ error: 'sm8_job_not_found' }, { status: 404 })
      const tracker = await prisma.tradeStatus.update({ where: { id: String(body.id) }, data: { externalId: job.uuid, jobRef: String(job.generated_job_id || body.jobNumber) } })
      return NextResponse.json({ tracker, ...(await syncTracker(tracker, { source: 'sync.link' })) })
    }
    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  } catch (e) {
    const status = e.message === 'sm8_key_rejected' ? 401 : e.message === 'sm8_not_configured' ? 409 : 502
    return NextResponse.json({ error: e.message }, { status })
  }
}
