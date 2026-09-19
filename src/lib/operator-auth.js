import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

const COOKIE = 'mts-session'

const secret = () => {
  const s = process.env.JWT_SECRET
  // Fail closed. No secret configured means nobody is an operator — never the
  // other way round, which is how auth checks usually go wrong.
  return s ? new TextEncoder().encode(s) : null
}

export async function createSession() {
  const key = secret()
  if (!key) throw new Error('JWT_SECRET is not set')
  const token = await new SignJWT({ role: 'operator' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

/**
 * The one check for anything only the trade should see or do.
 * Every handler calls this itself — middleware is a convenience, never the
 * only lock.
 *
 * @returns {Promise<true | { error: string, status: number }>}
 */
export async function requireOperator() {
  const key = secret()
  if (!key) return { error: 'not_configured', status: 503 }

  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return { error: 'unauthorised', status: 401 }

  try {
    await jwtVerify(token, key)
    return true
  } catch {
    return { error: 'unauthorised', status: 401 }
  }
}

export async function isOperator() {
  return (await requireOperator()) === true
}
