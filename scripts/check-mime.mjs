/**
 * A raw email becomes four facts, or nothing.
 *
 *   node scripts/check-mime.mjs
 *
 * This is the seam between Cloudflare's Email Worker and the arrival parser,
 * and it is the half that cannot be exercised where it runs. The Worker is
 * fifteen lines precisely so that everything able to go wrong goes wrong here,
 * where it can be run, and against the shapes real email actually arrives in:
 * quoted-printable, base64, multipart/alternative, an HTML-only sender, and a
 * subject line full of encoded words.
 */
import { readRawEmail } from '../src/lib/mime.js'
import { readArrivalEmail } from '../src/lib/arrival-email.js'

let fail = 0
const ok = (name, cond, got) => {
  if (cond) console.log(`  ok    ${name}`)
  else { fail += 1; console.log(`  FAIL  ${name} -> ${JSON.stringify(got)?.slice(0, 160)}`) }
}
const msg = (lines) => lines.join('\r\n')

/* --- quoted-printable, the commonest shape there is ---------------------- */
const qp = readRawEmail(msg([
  'From: "Evri" <noreply@evri.com>',
  'To: household@gmail.com',
  'Delivered-To: q7rmt4ndkw82jp@in.getturnup.com',
  'Subject: =?UTF-8?Q?Your_parcel_is_out_for_delivery?=',
  'Content-Type: text/plain; charset=utf-8',
  'Content-Transfer-Encoding: quoted-printable',
  '',
  'Your parcel H00AP9988776655 is out for delivery today and will be=',
  ' with you between 2pm and 4pm. Postage =C2=A34.99.',
]))
ok('the sender survives', qp.from.includes('evri.com'), qp.from)
ok('an encoded subject is read', qp.subject === 'Your parcel is out for delivery', qp.subject)
ok('a soft line break is joined, not left as =', !qp.text.includes('='), qp.text)
ok('a pound sign is a pound sign', qp.text.includes('£4.99'), qp.text)

// Delivered-To beats To. A forwarded email's To: is the household's own
// address; the card's inbox only ever appears in the delivery headers, so
// reading To: would file every forwarded email against nothing.
ok('the card inbox is taken from Delivered-To, not To',
   qp.to === 'q7rmt4ndkw82jp@in.getturnup.com', qp.to)

/* --- base64, which some senders use for everything ----------------------- */
const b64 = readRawEmail(msg([
  'From: deliveries@loaf.com',
  'Delivered-To: q7rmt4ndkw82jp@in.getturnup.com',
  'Subject: =?UTF-8?B?WW91ciBkZWxpdmVyeSBpcyBib29rZWQ=?=',
  'Content-Type: text/plain; charset=utf-8',
  'Content-Transfer-Encoding: base64',
  '',
  Buffer.from('We will deliver your two-seater sofa on Friday between 12pm and 4pm.').toString('base64'),
]))
ok('a base64 subject is read', b64.subject === 'Your delivery is booked', b64.subject)
ok('a base64 body is read', b64.text.includes('two-seater sofa'), b64.text)

/* --- multipart/alternative: plain wins over HTML ------------------------- */
const multi = readRawEmail(msg([
  'From: noreply@dpd.co.uk',
  'Delivered-To: q7rmt4ndkw82jp@in.getturnup.com',
  'Subject: Your parcel',
  'Content-Type: multipart/alternative; boundary="SEP123"',
  '',
  '--SEP123',
  'Content-Type: text/plain; charset=utf-8',
  '',
  'Your parcel 15502938475610 is on its way.',
  '--SEP123',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<html><style>p{color:red}</style><p>Your parcel is on its way.</p></html>',
  '--SEP123--',
]))
ok('the plain part is preferred', multi.text.includes('15502938475610'), multi.text)
ok('the HTML part is not glued on as well', !multi.text.includes('color:red'), multi.text)

/* --- HTML only: still readable ------------------------------------------ */
const htmlOnly = readRawEmail(msg([
  'From: service@heatingco.co.uk',
  'Delivered-To: q7rmt4ndkw82jp@in.getturnup.com',
  'Subject: Your boiler service',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<html><body><p>Our engineer will attend on Friday between 9am&nbsp;and&nbsp;1pm.</p></body></html>',
]))
ok('an HTML-only email still reads', htmlOnly.text.includes('engineer will attend'), htmlOnly.text)
ok('tags and entities are gone', !htmlOnly.text.includes('<') && !htmlOnly.text.includes('&nbsp;'), htmlOnly.text)

/* --- the whole chain, which is the thing that actually has to work ------- */
const chain = readArrivalEmail({ ...qp, receivedAt: new Date('2026-10-12T09:00:00Z') },
                                new Date('2026-10-12T09:00:00Z'))
ok('a raw email all the way to an arrival', chain?.stage === 'OUT_FOR_DELIVERY' && chain?.carrier === 'Evri',
   chain && { stage: chain.stage, carrier: chain.carrier })

const service = readArrivalEmail({ ...htmlOnly, receivedAt: new Date() })
ok('an HTML-only service email reaches the card as a person',
   service?.kind === 'SERVICE', service && service.kind)

/* --- rubbish in, nothing out -------------------------------------------- */
ok('an empty message is nothing', readRawEmail('') === null)
ok('a body with no headers is nothing', readRawEmail('just some words') === null)

// Not a crash, and not a hang: a boundary that never closes is a real thing a
// broken sender produces, and an unbounded loop here would be a live outage.
const broken = readRawEmail(msg([
  'From: x@y.com', 'Subject: Hmm', 'Content-Type: multipart/mixed; boundary="NOPE"', '',
  '--NOPE', 'Content-Type: text/plain', '', 'half a message',
]))
ok('an unclosed boundary does not throw', broken?.text.includes('half a message'), broken?.text)

console.log(fail ? `\nFAILED — ${fail}` : '\nPASSED — all checks')
process.exit(fail ? 1 : 0)
