/**
 * The one check that has to keep passing.
 *
 *   node scripts/check-public-shape.mjs
 *
 * `publicShape()` decides what a tracking link hands to everyone it reaches,
 * and a tracking link gets forwarded — to a partner, into a family group chat,
 * onward from there. It is the whole security boundary of the customer side.
 *
 * It has already gone wrong once. The product grew from reporting ("on my
 * way") into asking ("will someone be in?"), and the answers went back onto
 * the page: the address, a photo of the house, a photo of the front door,
 * which door to use, "the gate sticks, park on the verge", whether there is a
 * dog, "No, I'm out", and "between 09:00 and 11:00". Each was a reasonable
 * addition on its own. Together they were a door, a time and a way in.
 *
 * Nobody will notice that happening again by reading a diff at 3am, so this
 * runs instead. It fails loudly and says which field to take back out.
 */

import { publicShape } from '../src/lib/trade-status.js'

/** Anything the CUSTOMER told the TRADE, and anything internal. */
const MUST_NOT_LEAK = [
  // Customer-supplied. Their device remembers these; the server does not say.
  'doorToUse',
  'petsOnSite',
  'what3words',
  'accessNotes',
  'mapPin',
  'presence',
  'presenceNote',
  // Wayfinding for the trade, of a customer's home. Dashboard only.
  'housePhoto',
  'doorPhoto',
  // Internal. These were never public and must not become so.
  'id',
  'externalId',
  'viewCount',
  'lastViewedAt',
  'isActive',
  'customerPhone',
]

/** A row with every field populated, so nothing can pass by being absent. */
const row = {
  id: 'clx-internal-id',
  code: 'K7M4PQRT',
  stage: 'ON_MY_WAY',
  stageNote: 'Cylinder is on the van',
  customerName: 'Sarah Whitfield',
  customerPhone: '07700 900123',
  jobRef: '2718',
  jobAddress: 'Church Lane, Burbage SN8',
  jobSummary: 'Unvented cylinder swap',
  externalId: 'servicem8-uuid',
  scheduledFor: new Date('2026-10-01T08:00:00Z'),
  arrivingAt: new Date('2026-10-01T07:42:00Z'),
  updatedAt: new Date('2026-10-01T07:42:00Z'),
  windowStart: new Date('2026-10-01T09:00:00Z'),
  windowEnd: new Date('2026-10-01T11:00:00Z'),
  position: 2,
  doorToUse: 'BACK',
  petsOnSite: true,
  what3words: 'filled.count.soap',
  accessNotes: 'Gate sticks — lift it. Park on the verge past the postbox.',
  mapPin: 'https://maps.app.goo.gl/example',
  housePhoto: 'https://example/house.jpg',
  doorPhoto: 'https://example/door.jpg',
  presence: 'OUT',
  presenceNote: 'Out all morning',
  presenceAt: new Date('2026-10-01T07:00:00Z'),
  viewCount: 41,
  lastViewedAt: new Date(),
  isActive: true,
  events: [{ stage: 'BOOKED', note: 'Booked in', createdAt: new Date('2026-09-28T09:12:00Z') }],
}

const out = publicShape(row)
const leaked = MUST_NOT_LEAK.filter((key) => key in out)

if (leaked.length) {
  console.error('\npublicShape() is handing out fields that a forwarded link must never carry:\n')
  for (const key of leaked) console.error(`  ${key} = ${JSON.stringify(out[key])}`)
  console.error(`
A tracking link reaches everyone it is forwarded to. Customer-supplied answers
belong on the device that supplied them (src/app/t/own-answers.js) and on the
dashboard, which is behind a password. Take these back out of publicShape().
`)
  process.exit(1)
}

console.log(`publicShape() is clean — ${Object.keys(out).length} fields, none of them the customer's own:`)
console.log(`  ${Object.keys(out).join(', ')}`)
