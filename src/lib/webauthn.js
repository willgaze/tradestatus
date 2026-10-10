import { cookies, headers } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

/**
 * Passkeys, the small amount of them this product needs.
 *
 * There is one operator, so there is no user lookup and no username: any
 * enrolled device signs in. That is the whole appeal — Face ID on the phone,
 * Touch ID on the laptop, nothing typed and nothing to remember.
 */

const CHALLENGE_COOKIE = 'mts-challenge'

// The relying party is the domain, and a passkey is bound to it. Read it from
// the request rather than hardcoding, so this works on localhost and in
// production without a second config value.
//
// NOTE for a future move to a custom domain: passkeys enrolled against
// tradestatus.vercel.app will NOT work on www.getturnup.com. They are bound
// to the origin by design — that is what stops a lookalike site replaying one.
// Enrol again on the new domain, and keep the password until that is done.
export async function rpFromRequest() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return { rpID: host.split(':')[0], origin: `${proto}://${host}` }
}

const secret = () => {
  const s = process.env.JWT_SECRET
  return s ? new TextEncoder().encode(s) : null
}

/**
 * The challenge has to survive the round trip between "give me options" and
 * "here is the signed answer". A serverless function keeps nothing in memory
 * between requests, so it goes in a short-lived signed cookie rather than a
 * table — no row to clean up, and it cannot be replayed after two minutes.
 */
export async function stashChallenge(challenge) {
  const key = secret()
  if (!key) throw new Error('JWT_SECRET is not set')
  const token = await new SignJWT({ challenge })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(key)
  const jar = await cookies()
  jar.set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 120,
  })
}

export async function takeChallenge() {
  const key = secret()
  if (!key) return null
  const jar = await cookies()
  const token = jar.get(CHALLENGE_COOKIE)?.value
  // One use only. Clear it whether or not it verifies, so a failed attempt
  // cannot be retried against the same challenge.
  jar.delete(CHALLENGE_COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key)
    return payload.challenge || null
  } catch {
    return null
  }
}
