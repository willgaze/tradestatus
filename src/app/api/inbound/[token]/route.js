import { NextResponse } from 'next/server'
import { fileEmail } from '@/lib/arrivals'
import { inboxKeyFrom } from '@/lib/inbox-address'
import { readRawEmail } from '@/lib/mime'

/**
 * Where forwarded emails land.
 *
 * PROVIDER-AGNOSTIC ON PURPOSE. Inbound mail is a commodity — SendGrid's
 * Inbound Parse, Mailgun routes, Postmark, Resend — and they all deliver the
 * same four facts in different envelopes. Reading all of their shapes costs
 * thirty lines and means the choice of provider is a DNS record rather than a
 * rewrite, which matters when the first one turns out to be wrong.
 *
 * The token in the path is the same pattern the ServiceM8 webhook already
 * uses: a shared secret only the provider knows, so a URL that leaks cannot be
 * posted to. The forwarding address is the other half — the one the customer
 * puts in a mail filter — and the two are deliberately separate secrets, so a
 * leaked card link can never be turned into a way to write to somebody's card.
 *
 * ALWAYS ANSWERS 200 ONCE THE TOKEN IS GOOD. An inbound provider retries a
 * 500, and a retry storm on a parse bug would put one parcel on a card twenty
 * times. What happened is in the body for anyone reading logs.
 */
export const dynamic = 'force-dynamic'

// A mail body can be enormous; nothing past the first few thousand characters
// of a delivery email has ever carried the tracking number.
const MAX_TEXT = 40000

/** Pull the four facts out of whichever provider sent this. */
async function readEnvelope(request) {
  const type = request.headers.get('content-type') || ''

  if (type.includes('application/json')) {
    const b = await request.json()
    // Cloudflare's Email Worker has only the raw message to give, so it posts
    // that and the MIME reading happens here, in the repository, under test.
    // See src/lib/mime.js for why that is the right way round.
    if (b.raw) {
      const read = readRawEmail(b.raw)
      if (read) return { ...read, to: b.to || read.to, from: b.from || read.from }
    }
    return {
      to: b.to || b.To || b.recipient || b.OriginalRecipient || b.envelope?.to,
      from: b.from || b.From || b.sender,
      subject: b.subject || b.Subject,
      text: b.text || b.TextBody || b['body-plain'] || b.plain || b.html || b.HtmlBody || '',
    }
  }

  // SendGrid Inbound Parse and Mailgun both post form data.
  const form = await request.formData()
  const get = (...keys) => {
    for (const k of keys) {
      const v = form.get(k)
      if (typeof v === 'string' && v) return v
    }
    return ''
  }
  return {
    to: get('to', 'To', 'recipient'),
    from: get('from', 'From', 'sender'),
    subject: get('subject', 'Subject'),
    text: get('text', 'body-plain', 'stripped-text', 'html', 'body-html'),
  }
}

export async function POST(request, { params }) {
  const { token } = await params
  const expected = process.env.INBOUND_EMAIL_TOKEN
  // Fails closed. With no token configured there is no inbound address to
  // point at this anyway, and an open mail sink is not a thing to ship by
  // accident.
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  let envelope
  try {
    envelope = await readEnvelope(request)
  } catch {
    return NextResponse.json({ ok: true, filed: false, why: 'unreadable' })
  }

  const inboxKey = inboxKeyFrom(envelope.to)
  if (!inboxKey) return NextResponse.json({ ok: true, filed: false, why: 'no_inbox_in_to' })

  const result = await fileEmail({
    inboxKey,
    from: envelope.from,
    subject: envelope.subject,
    text: String(envelope.text || '').slice(0, MAX_TEXT),
    receivedAt: new Date(),
  })

  // 200 either way: see the note at the top about retry storms.
  return NextResponse.json(result)
}
