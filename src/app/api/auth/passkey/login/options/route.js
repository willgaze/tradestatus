import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { rpFromRequest, stashChallenge } from '@/lib/webauthn'

export const dynamic = 'force-dynamic'

// Public by necessity — this is the sign-in. It hands out nothing but a random
// challenge: no credential ids, so it cannot be used to ask "does this install
// have any passkeys" or to enumerate devices.
export async function POST() {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }
  const { rpID } = await rpFromRequest()
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    // Empty: the passkey is discoverable, so the device offers what it has and
    // the customer-facing half of the flow needs no username at all.
    allowCredentials: [],
  })
  await stashChallenge(options.challenge)
  return NextResponse.json({ options })
}
