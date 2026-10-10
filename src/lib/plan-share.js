import { createHash } from 'node:crypto'

/**
 * A read-only link to the plan for someone the owner wants to show it to.
 *
 * The owner signs in; a friend does not have a passkey here and should not
 * need one to read a plan. So /plan/<code> renders the plan read-only, and
 * the code is the credential, exactly as a customer's tracking link is.
 *
 * Where the code comes from, in order:
 *
 *   PLAN_SHARE_CODE   set it in Vercel to choose one, or set it to "off" to
 *                     stop every shared link at once
 *   derived           otherwise eight characters from a hash of JWT_SECRET,
 *                     so the link exists with no setup and changes if the
 *                     secret ever does
 *
 * No JWT_SECRET means no sharing, the same fail-closed rule as sign-in. The
 * alphabet is the tracking-code one: no 0/O, no 1/I/L, because it may be
 * read out over the phone.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function planShareCode() {
  const chosen = process.env.PLAN_SHARE_CODE
  if (chosen === 'off') return null
  if (chosen) return chosen
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  const digest = createHash('sha256').update(`plan-share:${secret}`).digest()
  let out = ''
  for (let i = 0; i < 8; i += 1) out += ALPHABET[digest[i] % ALPHABET.length]
  return out
}

/** Constant-time enough for an eight-character code: compare lengths, then every byte. */
export function planShareCodeMatches(candidate) {
  const code = planShareCode()
  if (!code || typeof candidate !== 'string' || candidate.length !== code.length) return false
  let diff = 0
  for (let i = 0; i < code.length; i += 1) diff |= code.charCodeAt(i) ^ candidate.charCodeAt(i)
  return diff === 0
}
