/**
 * ServiceM8, kept at arm's length.
 *
 * The rule that makes this robust: a webhook is a DOORBELL, never a message.
 * Whatever ServiceM8 sends us, we throw the body away except for the job's
 * uuid, then ask their API what is actually true and derive the stage from
 * that. So a replayed, forged, reordered or half-delivered webhook cannot move
 * a card anywhere the real job is not; and a missed one costs nothing, because
 * the same derivation runs when a customer opens their page (pull on read) and
 * when the trade opens the dashboard.
 *
 * Auth is an API key (ServiceM8 → Settings → API Keys), sent as X-API-Key.
 * Nothing here is reachable without SM8_API_KEY; without it every function
 * says so and the dashboard shows what to do.
 *
 * Mapping, deliberately conservative — only what ServiceM8 can actually know:
 *   Completed                        → Job done
 *   a recorded check-in still open   → On site
 *   checked out, job not completed   → Paused ("away from site for now")
 *   Work Order, nothing recorded     → Booked in (never regresses On my way:
 *                                      setting off is TurnUp's own tap)
 *   Quote / Unsuccessful             → no change, noted in the log
 */
import { prisma } from './prisma'
import { notifyStage } from './push'
import { cleanText } from './clean-text'

// SM8_API_BASE exists so a test can stand a fake ServiceM8 up on localhost.
// Production never sets it.
const BASE = (process.env.SM8_API_BASE || 'https://api.servicem8.com').replace(/\/$/, '')
const API = `${BASE}/api_1.0`
const HOOKS = `${BASE}/webhook_subscriptions/event`
export const EVENTS = ['job.status_changed', 'job.checked_in', 'job.checked_out', 'job.completed', 'job.updated']
const STALE_MS = 60_000
const TIMEOUT_MS = 6_000     // ServiceM8 wants a 2xx inside 10s; leave room
// The one note this file writes. It is also the one it is allowed to erase:
// a pause we announced must not outlive the pause.
const AWAY_NOTE = 'Away from site for now — back to finish.'

export const sm8Configured = () => Boolean(process.env.SM8_API_KEY)
export const webhookToken = () => process.env.SM8_WEBHOOK_TOKEN || null

const UUID = /^[0-9a-f-]{32,36}$/i
const isNull = (d) => !d || String(d).startsWith('0000-00-00')

async function api(path, init = {}) {
  if (!sm8Configured()) throw new Error('sm8_not_configured')
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(path.startsWith('http') ? path : `${API}/${path}`, {
      ...init,
      signal: ctl.signal,
      headers: { Accept: 'application/json', 'X-API-Key': process.env.SM8_API_KEY, ...(init.headers || {}) },
    })
    if (r.status === 401 || r.status === 403) throw new Error('sm8_key_rejected')
    const text = await r.text()
    if (!r.ok) {
      // Carry ServiceM8's own sentence up. On 9 Oct 2026 the first subscribe
      // on a real account came back 429 "Webhook Events is being activated on
      // this account. Please try again in a few moments." — a code alone
      // would have sent Will looking for a bug that was not there.
      let msg = ''
      try { msg = JSON.parse(text)?.message || '' } catch { msg = text.slice(0, 120) }
      const e = new Error(`sm8_http_${r.status}${msg ? `: ${msg}` : ''}`)
      e.status = r.status
      throw e
    }
    return text ? JSON.parse(text) : null
  } finally { clearTimeout(t) }
}

const filter = (field, value) => `$filter=${encodeURIComponent(`${field} eq '${String(value).replace(/'/g, "''")}'`)}`

/** The job, by uuid or by the number the trade knows it as. */
export async function fetchJob({ uuid, number }) {
  if (uuid && UUID.test(uuid)) return api(`job/${uuid}.json`)
  if (number) {
    const rows = await api(`job.json?${filter('generated_job_id', String(number).trim())}`)
    return Array.isArray(rows) && rows.length ? rows[0] : null
  }
  return null
}

/** Recorded (not scheduled) check-ins for a job, newest first. */
export async function fetchActivities(jobUuid) {
  const rows = await api(`jobactivity.json?${filter('job_uuid', jobUuid)}`)
  return (Array.isArray(rows) ? rows : [])
    .filter((a) => Number(a.active ?? 1) === 1 && Number(a.activity_was_recorded ?? 0) === 1)
    .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
}

/** The person on the job, for pre-filling a new tracker. */
export async function fetchJobContact(jobUuid) {
  const rows = await api(`jobcontact.json?${filter('job_uuid', jobUuid)}`)
  const list = Array.isArray(rows) ? rows.filter((c) => Number(c.active ?? 1) === 1) : []
  return list.find((c) => c.type === 'JOB') || list[0] || null
}

/** Pure: what stage the ServiceM8 facts imply, given where the card is now. */
export function deriveStage({ job, activities, current }) {
  const status = String(job?.status || '')
  if (status === 'Completed') return { stage: 'DONE', why: 'completed in ServiceM8' }
  const open = activities.find((a) => !isNull(a.start_date) && isNull(a.end_date))
  if (open) return { stage: 'ON_SITE', why: 'checked in' }
  const latest = activities[0]
  if (latest && !isNull(latest.end_date) && current === 'ON_SITE') {
    return { stage: 'PAUSED', why: 'checked out, job not finished', note: AWAY_NOTE }
  }
  if (status === 'Work Order') {
    if (['ON_MY_WAY', 'PAUSED', 'BOOKED', 'ON_SITE'].includes(current)) return { stage: current, why: 'work order, nothing new' }
    return { stage: 'BOOKED', why: 'work order' }
  }
  return { stage: current, why: `status ${status || 'unknown'} — not ours to move` }
}

async function log(entry) {
  // The log is a convenience. If its table is not there yet, the sync still is.
  try { await prisma.sm8Event.create({ data: entry }) } catch (e) { console.error('sm8 log:', e?.code || e?.message) }
}

/**
 * Bring one tracker into line with its ServiceM8 job. Idempotent: running it
 * twice does nothing the second time. Never throws; returns what it did.
 */
export async function syncTracker(tracker, { source = 'sync' } = {}) {
  const jobUuid = tracker.externalId
  if (!jobUuid || !UUID.test(jobUuid)) return { outcome: 'unlinked' }
  try {
    const [job, activities] = await Promise.all([fetchJob({ uuid: jobUuid }), fetchActivities(jobUuid)])
    if (!job) { await log({ event: source, jobUuid, tradeStatusId: tracker.id, outcome: 'job_missing' }); return { outcome: 'job_missing' } }
    const { stage, why, note } = deriveStage({ job, activities, current: tracker.stage })
    let outcome = 'unchanged'
    if (stage !== tracker.stage) {
      const keep = tracker.stageNote === AWAY_NOTE ? null : tracker.stageNote
      const data = { stage, stageNote: note ? cleanText(note) : keep, events: { create: { stage, note: `From ServiceM8: ${why}` } } }
      // Same rule as the stage button: setting off is stamped on the way into
      // On my way only, and cleared only by going back to Booked in.
      if (stage === 'ON_MY_WAY') data.arrivingAt = new Date()
      else if (stage === 'BOOKED') data.arrivingAt = null
      const updated = await prisma.tradeStatus.update({ where: { id: tracker.id }, data })
      notifyStage(updated, stage).catch(() => {})
      outcome = `moved:${stage}`
    }
    await prisma.sm8Link.upsert({
      where: { tradeStatusId: tracker.id },
      create: { tradeStatusId: tracker.id, jobUuid, jobNumber: job.generated_job_id ? String(job.generated_job_id) : null, syncedAt: new Date(), lastStatus: job.status, lastOutcome: outcome },
      update: { syncedAt: new Date(), lastStatus: job.status, lastOutcome: outcome, jobNumber: job.generated_job_id ? String(job.generated_job_id) : undefined },
    }).catch((e) => console.error('sm8 link:', e?.code || e?.message))
    await log({ event: source, jobUuid, tradeStatusId: tracker.id, outcome })
    return { outcome, stage, why }
  } catch (error) {
    const outcome = `error:${error?.message || 'unknown'}`
    await log({ event: source, jobUuid, tradeStatusId: tracker.id, outcome })
    return { outcome }
  }
}

/** Find the tracker following a ServiceM8 job uuid, then sync it. */
export async function syncByJobUuid(jobUuid, { source }) {
  const tracker = await prisma.tradeStatus.findFirst({ where: { externalId: jobUuid, isActive: true } })
  if (!tracker) { await log({ event: source, jobUuid, outcome: 'unlinked' }); return { outcome: 'unlinked' } }
  return syncTracker(tracker, { source })
}

/**
 * Pull on read: called from the customer's status route. Cheap when there is
 * nothing to do, never awaited by the caller for longer than it takes to
 * decide, never allowed to break the page.
 */
export async function syncIfStale(tracker) {
  if (!sm8Configured() || !tracker?.externalId || !UUID.test(tracker.externalId)) return
  try {
    const link = await prisma.sm8Link.findUnique({ where: { tradeStatusId: tracker.id } }).catch(() => null)
    if (link?.syncedAt && Date.now() - new Date(link.syncedAt).getTime() < STALE_MS) return
    await syncTracker(tracker, { source: 'sync.read' })
  } catch (e) { console.error('sm8 syncIfStale:', e?.message) }
}

/** Pull the uuid out of whatever shape the webhook came in. */
export function jobUuidFromDelivery(body) {
  const cands = [
    body?.entry?.[0]?.uuid, body?.entry?.[0]?.job_uuid, body?.eventArgs?.entry?.[0]?.uuid,
    body?.job_uuid, body?.uuid, body?.object_uuid,
  ]
  for (const c of cands) if (c && UUID.test(String(c))) return String(c)
  const url = body?.resource_url || body?.eventArgs?.resource_url || ''
  const m = String(url).match(/([0-9a-f-]{36})\.json/i)
  return m ? m[1] : null
}

export const eventNameFromDelivery = (body, fallback = 'webhook') =>
  String(body?.event || body?.eventName || body?.event_name || fallback).slice(0, 60)

/* ---- subscriptions ------------------------------------------------------- */

export const callbackUrl = (origin) => (webhookToken() ? `${origin}/api/servicem8/webhook/${webhookToken()}` : null)

export async function listSubscriptions() {
  const rows = await api(HOOKS)
  return Array.isArray(rows) ? rows : rows?.data || []
}

export async function subscribe(origin) {
  const url = callbackUrl(origin)
  if (!url) throw new Error('sm8_no_webhook_token')
  const results = []
  for (const event of EVENTS) {
    const body = new URLSearchParams({ event, callback_url: url, unique_id: 'turnup' })
    try {
      const r = await api(HOOKS, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      results.push({ event, ok: Boolean(r?.success ?? true) })
    } catch (e) { results.push({ event, ok: false, error: e.message }) }
  }
  return results
}

export async function unsubscribe() {
  const subs = await listSubscriptions()
  const mine = subs.filter((s) => s.unique_id === 'turnup' || String(s.callback_url || '').includes('/api/servicem8/webhook/'))
  for (const s of mine) {
    const id = s.uuid || s.id
    if (id) await api(`${HOOKS}/${id}`, { method: 'DELETE' }).catch(() => {})
  }
  return mine.length
}
