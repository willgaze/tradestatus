/**
 * Does the parser read real emails?
 *
 * Samples written to match what these senders actually put in a subject line
 * and first paragraph. Every expectation here is a claim about the parser, so
 * a failure is a real failure and prints what it got instead.
 *
 *   node scripts/check-arrival-email.mjs
 */
import { readArrivalEmail, statedWindow, statedDate } from '../src/lib/arrival-email.js'

// A fixed "now" so a weekday or "tomorrow" means the same thing every run.
const NOW = new Date('2026-10-12T09:00:00Z') // a Monday

const CASES = [
  { name: 'Royal Mail, out for delivery',
    email: { from: 'Royal Mail <no-reply@royalmail.com>', subject: 'Your item is out for delivery',
      text: 'Your item with tracking number AB123456789GB is out for delivery today.' },
    want: { carrier: 'Royal Mail', stage: 'OUT_FOR_DELIVERY', reference: 'AB123456789GB', hasTrack: true, hasDate: true } },

  { name: 'Evri, on the way with a stated day',
    email: { from: 'Evri <donotreply@evri.com>', subject: 'Your parcel is on its way',
      text: 'We have your parcel. It is on its way and due Tuesday 13 October.' },
    want: { carrier: 'Evri', stage: 'ON_THE_WAY', hasDate: true } },

  { name: 'DPD, one hour window',
    email: { from: 'DPD <noreply@dpd.co.uk>', subject: 'Your parcel is being delivered today',
      text: 'Your parcel 12345678901234 will be delivered between 1pm and 2pm today.' },
    want: { carrier: 'DPD', stage: 'OUT_FOR_DELIVERY', reference: '12345678901234', hasWindow: true } },

  { name: 'Missed delivery',
    email: { from: 'Yodel <noreply@yodel.co.uk>', subject: 'Sorry we missed you',
      text: 'Sorry we missed you today. A card was left.' },
    want: { carrier: 'Yodel', stage: 'MISSED' } },

  { name: 'Delivered',
    email: { from: 'DPD <noreply@dpd.co.uk>', subject: 'Your parcel has been delivered',
      text: 'Your parcel 99887766554433 has been delivered and left in the porch.' },
    want: { carrier: 'DPD', stage: 'DONE' } },

  { name: 'Amazon order confirmation',
    email: { from: '"Amazon.co.uk" <auto-confirm@amazon.co.uk>', subject: 'Your Amazon.co.uk order',
      text: 'Thanks for your order. Order 203-1234567-1234567 will arrive tomorrow.' },
    want: { carrier: 'Amazon', stage: 'ORDERED', reference: '203-1234567-1234567', hasDate: true } },

  { name: 'A merchant with no tracking number at all — the case Shop drops',
    email: { from: 'Sofa Workshop <orders@sofaworkshop.example>', subject: 'Your delivery is booked',
      text: 'Two of our team will deliver your sofa on Thursday between 8am and 12pm.' },
    want: { kind: 'DELIVERY', stage: null, hasWindow: true, hasDate: true } },

  { name: 'A newsletter is not an arrival',
    email: { from: 'Deals <news@someshop.example>', subject: '20% off this weekend only',
      text: 'Our autumn sale is on. Shop now and save on everything in store.' },
    want: null },

  { name: 'A password reset is not an arrival',
    email: { from: 'Account <no-reply@bank.example>', subject: 'Reset your password',
      text: 'Click the link below to reset your password. It expires in 30 minutes.' },
    want: null },
]

let pass = 0, fail = 0
const bad = (name, why, got) => { fail++; console.log(`  FAIL  ${name}\n        ${why}\n        got: ${JSON.stringify(got)}`) }

for (const { name, email, want } of CASES) {
  const got = readArrivalEmail({ ...email, receivedAt: NOW })
  if (want === null) {
    if (got === null) { pass++; console.log(`  ok    ${name}`) }
    else bad(name, 'expected it to be ignored', got)
    continue
  }
  if (!got) { bad(name, 'expected an arrival, got nothing', got); continue }

  const problems = []
  if (want.carrier && got.carrier !== want.carrier) problems.push(`carrier ${got.carrier} != ${want.carrier}`)
  if (want.stage && got.stage !== want.stage) problems.push(`stage ${got.stage} != ${want.stage}`)
  if (want.kind && got.kind !== want.kind) problems.push(`kind ${got.kind} != ${want.kind}`)
  if (want.reference && got.reference !== want.reference) problems.push(`reference ${got.reference} != ${want.reference}`)
  if (want.hasTrack && !got.trackUrl) problems.push('expected a tracking link')
  if (want.hasDate && !got.expectedFor) problems.push('expected a stated date')
  if (want.hasWindow && !got.window) problems.push('expected a stated window')
  if (problems.length) bad(name, problems.join('; '), got)
  else { pass++; console.log(`  ok    ${name}${got.expectedSaid ? `  (said "${got.expectedSaid}")` : ''}`) }
}

// A date is only ever carried when the email said one.
const noDate = readArrivalEmail({ from: 'x@dpd.co.uk', subject: 'On its way', text: 'Your parcel is on its way.' }, NOW)
if (noDate?.expectedFor == null) { pass++; console.log('  ok    no date in the email means no date on the card') }
else bad('no invented dates', 'a date appeared from nowhere', noDate)

// The title names the thing, not the stage. The card already says the stage,
// in colour, directly above the title — a title that repeats it spends the one
// line that could have said WHAT is coming.
const TITLES = [
  ['a subject that is only a stage', { from: 'noreply@evri.com', subject: 'Your parcel is out for delivery', text: 'Your parcel H00AP1234567890 is out for delivery today.' }, 'Evri parcel'],
  ['a sender with no carrier', { from: 'deliveries@loaf.com', subject: 'Your delivery is booked', text: 'We will deliver your sofa on Friday.' }, 'Delivery from Loaf'],
  ['a subject that names something', { from: 'noreply@dpd.co.uk', subject: 'Your Screwfix order has been dispatched', text: 'Order 15502938475610 has been dispatched.' }, 'Your Screwfix order has been dispatched'],
]
for (const [name, email, want] of TITLES) {
  const got = readArrivalEmail(email, NOW)
  if (got?.title === want) { pass++; console.log(`  ok    ${name} -> "${got.title}"`) }
  else bad(name, `title "${got?.title}" != "${want}"`, got)
}

// A parcel lands; a person knocks. The card separates them, and that split is
// only worth having if this is right — a jiffy bag in the list of people you
// have to be in for makes the whole list untrustworthy.
const KINDS = [
  ['a carrier parcel', { from: 'noreply@evri.com', subject: 'Your parcel is out for delivery', text: 'Parcel H00AP1234567890 is out for delivery today.' }, 'PARCEL', 'OUT_FOR_DELIVERY'],
  ['a boiler service', { from: 'bookings@heatingco.co.uk', subject: 'Your boiler service is booked', text: 'Our engineer will attend on Friday 17 October between 9am and 1pm.' }, 'SERVICE', 'BOOKED'],
  ['a window survey', { from: 'surveys@windowsco.uk', subject: 'Window survey', text: 'Our surveyor will visit on Monday morning.' }, 'SERVICE', 'BOOKED'],
  ['a kitchen fitting', { from: 'info@kitchensltd.co.uk', subject: 'Your installation date', text: 'Your fitting appointment is confirmed for Tuesday. The installer will arrive from 8am.' }, 'SERVICE', 'BOOKED'],
  ['a sofa with a crew', { from: 'deliveries@loaf.com', subject: 'Your delivery is booked', text: 'We will deliver your two-seater sofa on Friday between 12pm and 4pm. Two men will call ahead.' }, 'DELIVERY', 'BOOKED'],
]
for (const [name, email, wantKind, wantStage] of KINDS) {
  const got = readArrivalEmail(email, NOW)
  if (got?.kind === wantKind && got?.stage === wantStage) { pass++; console.log(`  ok    ${name} -> ${got.kind} / ${got.stage}`) }
  else bad(name, `${got?.kind} / ${got?.stage} != ${wantKind} / ${wantStage}`, got)
}

// An invoice is not an arrival. Worth its own case: it is the email most likely
// to look like one, because it names a thing that was bought.
const invoice = readArrivalEmail({ from: 'billing@someco.com', subject: 'Your invoice', text: 'Please find attached your invoice for last month.' }, NOW)
if (invoice === null) { pass++; console.log('  ok    an invoice is not an arrival') }
else bad('an invoice', 'filed something', invoice)

console.log(`\n${fail ? 'FAILED' : 'PASSED'} — ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
