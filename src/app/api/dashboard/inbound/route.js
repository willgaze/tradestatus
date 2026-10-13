import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { dbReason } from '@/lib/db-errors'
import { INBOUND_HOST, ensureInboundToken, inboundToken, rotateInboundToken } from '@/lib/inbound-config'
import { CANONICAL_HOST } from '@/lib/trade'

/**
 * Switching the letterbox on, in one tap.
 *
 * This route exists to delete two steps. Before it, turning forwarding on
 * needed an environment variable in Vercel plus a redeploy (a laptop and a
 * Vercel login) and a Worker deployed with wrangler (a laptop again). Asked to
 * do that, the owner asked twice more for the whole thing to be set up for
 * him — which is the same signal as the push script being run zero times out
 * of four, and means the ask was wrong.
 *
 * So: the token is written here, and the Worker is handed back as finished
 * code with the address and the password already in it, to paste into
 * Cloudflare's own editor in a browser. What is left needs a Cloudflare login,
 * and nothing can remove that.
 *
 * THE WORKER SOURCE CARRIES THE TOKEN, and that is a considered trade. The
 * tidier form is a wrangler secret, which needs a terminal. Inside a Cloudflare
 * Worker the source is private to that account — the same place a secret would
 * live — so the cost is tidiness and the gain is that this can be done at all.
 */
export const dynamic = 'force-dynamic'

/** The whole Worker, with nothing left to fill in. */
function workerSource(url) {
  return `// TurnUp letterbox. Paste this whole thing into a Cloudflare Worker.
//
// It reads a forwarded email and posts it to TurnUp. It never throws: a
// thrown Email Worker bounces the message back to the carrier, which is
// worse than one parcel missing off a card.
export default {
  async email(message) {
    try {
      const raw = await new Response(message.raw).text()
      await fetch(${JSON.stringify(url)}, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: message.to,
          from: message.from,
          raw: raw.slice(0, 1000000),
        }),
      })
    } catch (error) {
      console.error('turnup inbound failed:', error && error.message)
    }
  },
}
`
}

const shape = (token) => {
  const base = `https://${CANONICAL_HOST}`
  const url = `${base}/api/inbound/${token}`
  return { host: INBOUND_HOST, webhookUrl: url, worker: workerSource(url) }
}

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const token = await inboundToken()
  // The token itself is only ever handed to the operator, who is behind a
  // password and is the person who has to paste it into Cloudflare.
  return NextResponse.json(token ? { configured: true, ...shape(token) } : { configured: false, host: INBOUND_HOST })
}

export async function POST() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const { token, error } = await ensureInboundToken()
    if (!token) {
      return NextResponse.json(
        { error: error === 'unavailable' ? 'Could not save it. Try again in a moment.' : 'Could not switch it on.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ configured: true, ...shape(token) })
  } catch (error) {
    console.error('inbound switch-on failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

/**
 * Start again with a new password.
 *
 * Deliberately its own verb rather than a side effect of pressing the button
 * twice: every Worker already deployed stops working the moment this runs, and
 * the only way back is pasting the new one in.
 */
export async function DELETE() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  if (process.env.INBOUND_EMAIL_TOKEN) {
    return NextResponse.json({ error: 'This deployment sets the token in its environment; change it there.' }, { status: 409 })
  }
  await rotateInboundToken()
  return NextResponse.json({ ok: true })
}
