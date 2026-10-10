import { NextResponse } from 'next/server'

/**
 * A GPS fix turned into three words.
 *
 * INVISIBLE UNTIL CONFIGURED, like push. what3words charge for the conversion
 * — the free tier does not reliably cover convert-to-3wa — so without
 * WHAT3WORDS_API_KEY this answers "not configured" and the page shows a link
 * to their site instead of a button that does nothing. The gate is read by the
 * client through GET before it renders anything, so there is never a control
 * that opens onto an error.
 *
 * The key never reaches the browser. That is the whole reason this route
 * exists rather than the conversion happening on the page: a what3words key is
 * billable, and a billable key in client JavaScript is somebody else's monthly
 * invoice.
 *
 * Public, because the customer's own page uses it — so it is throttled, and it
 * takes two numbers and returns three words. There is nothing here to enumerate
 * and nothing of ours to leak; the coordinates come from the caller's own phone
 * and are not stored.
 */
export const dynamic = 'force-dynamic'

const KEY = process.env.WHAT3WORDS_API_KEY

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_IP = 60
const hits = new Map()

function tooMany(key) {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k)
  }
  return recent.length >= MAX_PER_IP
}

/** Whether the button may be shown at all. */
export async function GET() {
  return NextResponse.json({ configured: Boolean(KEY) })
}

export async function POST(request) {
  if (!KEY) return NextResponse.json({ error: 'w3w_not_configured' }, { status: 503 })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') || 'unknown'
  if (tooMany(ip)) return NextResponse.json({ error: 'too_many' }, { status: 429 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'bad_body' }, { status: 400 }) }

  // Numbers, checked as numbers. A string here would be pasted straight into
  // somebody else's URL.
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'bad_coords' }, { status: 400 })
  }

  try {
    hits.set(ip, [...(hits.get(ip) || []), Date.now()])
    const url = new URL('https://api.what3words.com/v3/convert-to-3wa')
    url.searchParams.set('coordinates', `${lat},${lng}`)
    url.searchParams.set('language', 'en')
    url.searchParams.set('format', 'json')
    const r = await fetch(url, {
      headers: { 'X-Api-Key': KEY },
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json().catch(() => ({}))
    // Their errors carry a shape of their own; none of it is passed through,
    // because an upstream message is not ours to put in front of a customer.
    if (!r.ok || !data?.words) {
      console.error('w3w convert failed:', r.status, data?.error?.code)
      return NextResponse.json({ error: 'lookup_failed' }, { status: 502 })
    }
    return NextResponse.json({ words: String(data.words).slice(0, 80) })
  } catch (error) {
    console.error('w3w convert errored:', error?.name || error?.message)
    return NextResponse.json({ error: 'lookup_failed' }, { status: 502 })
  }
}
