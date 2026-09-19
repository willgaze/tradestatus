import { NextResponse } from 'next/server'
import { createSession, clearSession } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const expected = process.env.OPERATOR_PASSWORD
  if (!expected || !process.env.JWT_SECRET) {
    // Fail closed: an unconfigured install is not an open one.
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const { password } = await request.json().catch(() => ({}))
  if (typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
