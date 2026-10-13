import { prisma } from './prisma'
import { generateCode } from './trade-status'

/**
 * Where the letterbox's password lives.
 *
 * WHY THIS EXISTS. The first version needed `INBOUND_EMAIL_TOKEN` set in
 * Vercel and a redeploy — which means a Vercel login, on a laptop, from
 * somebody who works off a phone between jobs. Asked to do it, he asked again
 * for the whole thing to be set up instead. That is the same signal as the
 * push script being run zero times out of four: when an ask keeps not
 * happening, the ask is the thing to change.
 *
 * So the token can live in a row instead, written by one tap on the dashboard.
 * The environment variable still wins where it is set, so nothing that already
 * works stops working.
 *
 * Every read is wrapped: `InboundSecret` is a new table, which is the
 * migration case that fails soft. No table yet means no token, which means the
 * inbound route refuses everything — the safe direction.
 */

const ID = 'singleton'

export const INBOUND_HOST = process.env.INBOUND_EMAIL_HOST || 'in.getturnup.com'

/** The token, from the environment if set, otherwise from the row. */
export async function inboundToken() {
  if (process.env.INBOUND_EMAIL_TOKEN) return process.env.INBOUND_EMAIL_TOKEN
  try {
    const row = await prisma.inboundSecret.findUnique({ where: { id: ID } })
    return row?.token || null
  } catch { return null }
}

/** Is anything listening? Used to decide whether the setup panel renders. */
export async function inboundConfigured() {
  return Boolean(await inboundToken())
}

/**
 * Make the token if there is not one, and hand it back either way.
 *
 * Idempotent on purpose: tapping the button twice must not quietly rotate the
 * password and strand a Worker that is already deployed with the old one.
 * Rotating is a separate, deliberate act.
 */
export async function ensureInboundToken() {
  const existing = await inboundToken()
  if (existing) return { token: existing, fromEnv: Boolean(process.env.INBOUND_EMAIL_TOKEN) }

  // 24 characters of the unambiguous alphabet, lowercased: unguessable, and
  // safe in a URL path without escaping.
  const token = `${generateCode(12)}${generateCode(12)}`.toLowerCase()
  try {
    const row = await prisma.inboundSecret.upsert({
      where: { id: ID },
      create: { id: ID, token, host: INBOUND_HOST },
      update: {},
    })
    return { token: row.token, fromEnv: false }
  } catch (error) {
    console.error('inbound token write failed:', error?.code || error?.message)
    return { token: null, fromEnv: false, error: 'unavailable' }
  }
}

/** Throw the token away so a new one is made. Stops every deployed Worker. */
export async function rotateInboundToken() {
  try {
    await prisma.inboundSecret.deleteMany({ where: { id: ID } })
    return true
  } catch { return false }
}
