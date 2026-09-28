import { NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/operator-auth'
import { rpFromRequest, takeChallenge } from '@/lib/webauthn'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const expectedChallenge = await takeChallenge()
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'challenge_expired' }, { status: 400 })
  }

  try {
    const { rpID, origin } = await rpFromRequest()
    const body = await request.json()

    const stored = await prisma.passkey.findUnique({ where: { credentialId: body.response?.id } })
    if (!stored) return NextResponse.json({ error: 'unknown_device' }, { status: 401 })

    const { verified, authenticationInfo } = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(stored.publicKey),
        counter: Number(stored.counter),
        transports: stored.transports ? stored.transports.split(',') : undefined,
      },
    })
    if (!verified) return NextResponse.json({ error: 'not_verified' }, { status: 401 })

    // The counter only ever goes up. A lower one means the response was
    // replayed, or the key was cloned — either way, do not sign in.
    const next = BigInt(authenticationInfo.newCounter ?? 0)
    if (stored.counter > 0n && next <= stored.counter) {
      console.error('passkey counter did not advance for', stored.credentialId)
      return NextResponse.json({ error: 'not_verified' }, { status: 401 })
    }

    await prisma.passkey.update({
      where: { credentialId: stored.credentialId },
      data: { counter: next, lastUsedAt: new Date() },
    })

    await createSession()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('passkey login verify failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
