import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createSession, clearSession } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'

// One shared password on a URL anyone can find, so an unthrottled POST here is
// an open invitation to sit and guess.
//
// Honest about what this is: per-instance memory, so a serverless platform
// running several instances gives an attacker one bucket per instance, and a
// cold start clears it. That makes it a speed bump, not a lock. It is still
// worth having — it turns thousands of guesses a second into a handful — and
// the real defence remains a long random OPERATOR_PASSWORD, which setup.sh
// generates. Anything stronger needs shared state (Redis, Upstash) and this
// product does not have a second service yet.
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map()

function tooManyAttempts(key) {
  const now = Date.now()
  const hits = (attempts.get(key) || []).filter((t) => now - t < WINDOW_MS)
  attempts.set(key, hits)
  // Stop the map growing without bound on a long-lived instance.
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (!v.length || now - v[v.length - 1] > WINDOW_MS) attempts.delete(k)
  }
  return hits.length >= MAX_ATTEMPTS
}

function recordAttempt(key) {
  attempts.set(key, [...(attempts.get(key) || []), Date.now()])
}

// `a !== b` on a secret leaks its length and, in principle, its prefix through
// timing. Compare over a fixed width so neither shows.
function samePassword(given, expected) {
  const a = Buffer.from(String(given))
  const b = Buffer.from(String(expected))
  const width = Math.max(a.length, b.length, 1)
  const pad = (buf) => Buffer.concat([buf, Buffer.alloc(width - buf.length)], width)
  return timingSafeEqual(pad(a), pad(b)) && a.length === b.length
}

export async function POST(request) {
  const expected = process.env.OPERATOR_PASSWORD
  if (!expected || !process.env.JWT_SECRET) {
    // Fail closed: an unconfigured install is not an open one.
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429, headers: { 'Retry-After': '600' } })
  }

  const { password } = await request.json().catch(() => ({}))
  if (typeof password !== 'string' || !samePassword(password, expected)) {
    recordAttempt(ip)
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 })
  }

  // Clear the bucket on success, so a few fat-fingered attempts followed by the
  // right one leave no trace. Note this cannot rescue an already-full bucket:
  // the throttle above runs first, by design. Ten wrong in ten minutes means a
  // ten-minute wait even for the person who owns the password.
  attempts.delete(ip)
  await createSession()
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
