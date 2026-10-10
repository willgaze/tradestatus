import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'
import { requireOperator, createSession } from '@/lib/operator-auth'

/**
 * Moving a sign-in from one address to another, without a password.
 *
 * A passkey is bound to the host it was made on, so the Face ID that opens
 * tradestatus.vercel.app opens nothing on www.getturnup.com. The honest fix
 * is not "type the password you have not seen since July": it is to let the
 * address you ARE signed in on vouch for you on the one you are not.
 *
 * POST (operator only, on the old address): mint a token good for 90 seconds,
 * for one named destination host, tied to this browser's user agent. Answer
 * with the URL to open there.
 *
 * GET ?t= (on the new address): verify the token is for THIS host and THIS
 * browser, set a session, send them to the dashboard to enrol Face ID here.
 * Then the token is spent in the only sense that matters: ninety seconds.
 */
export const dynamic = 'force-dynamic'

const key = () => (process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null)
const hostOf = (request) => request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
const uaHash = (request) => createHash('sha256').update(request.headers.get('user-agent') || '').digest('hex').slice(0, 24)
const HOST_RE = /^[a-z0-9.-]+(:\d+)?$/i
// Redirect on the host the browser actually used, not whatever request.url
// resolved to behind a proxy.
const back = (request, path) => {
  const host = hostOf(request)
  const proto = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
  return NextResponse.redirect(`${proto}://${host}${path}`)
}

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const k = key(); if (!k) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  const { to } = await request.json().catch(() => ({}))
  const target = String(to || '').toLowerCase()
  if (!HOST_RE.test(target) || target === hostOf(request).toLowerCase()) return NextResponse.json({ error: 'bad_target' }, { status: 400 })
  const token = await new SignJWT({ purpose: 'handoff', uah: uaHash(request) })
    .setProtectedHeader({ alg: 'HS256' }).setAudience(target).setIssuedAt().setExpirationTime('90s').sign(k)
  const proto = target.startsWith('localhost') || target.startsWith('127.') ? 'http' : 'https'
  return NextResponse.json({ url: `${proto}://${target}/api/auth/handoff?t=${encodeURIComponent(token)}` })
}

export async function GET(request) {
  const k = key(); if (!k) return back(request, '/login?moved=failed')
  const t = new URL(request.url).searchParams.get('t') || ''
  try {
    const { payload } = await jwtVerify(t, k, { audience: hostOf(request).toLowerCase() })
    if (payload.purpose !== 'handoff' || payload.uah !== uaHash(request)) throw new Error('mismatch')
    await createSession()
    return back(request, '/dashboard?moved=1')
  } catch {
    return back(request, '/login?moved=failed')
  }
}
