import { NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { rpFromRequest, takeChallenge } from '@/lib/webauthn'
import { cleanText } from '@/lib/clean-text'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  const expectedChallenge = await takeChallenge()
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'challenge_expired' }, { status: 400 })
  }

  try {
    const { rpID, origin } = await rpFromRequest()
    const body = await request.json()

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    })
    if (!verified || !registrationInfo) {
      return NextResponse.json({ error: 'not_verified' }, { status: 400 })
    }

    const { credential } = registrationInfo
    await prisma.passkey.create({
      data: {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter ?? 0),
        transports: credential.transports?.join(',') || null,
        label: cleanText(body.label, 60) || 'This device',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('passkey register verify failed:', error)
    if (error?.code === 'P2002') return NextResponse.json({ error: 'already_enrolled' }, { status: 409 })
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
