import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { rpFromRequest, stashChallenge } from '@/lib/webauthn'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

// Enrolling a device is an operator action: you prove who you are first, then
// add the device. That is the bootstrap, and it is why the password survives.
export async function POST() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  try {
    const { rpID } = await rpFromRequest()
    const existing = await prisma.passkey.findMany()

    const options = await generateRegistrationOptions({
      rpName: 'My Trade Status',
      rpID,
      userName: process.env.OPERATOR_EMAIL || 'operator',
      userDisplayName: process.env.NEXT_PUBLIC_TRADE_NAME || 'Operator',
      attestationType: 'none',
      // Don't offer to enrol a device that is already enrolled — the browser
      // says "you already have one of these" instead of making a duplicate.
      excludeCredentials: existing.map((k) => ({
        id: k.credentialId,
        transports: k.transports ? k.transports.split(',') : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'required',      // discoverable, so signing in needs no username
        userVerification: 'required', // Face ID / Touch ID, not merely "a device"
      },
    })

    await stashChallenge(options.challenge)
    return NextResponse.json({ options })
  } catch (error) {
    console.error('passkey register options failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
