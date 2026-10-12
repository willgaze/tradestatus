/**
 * A job on a household card says the same thing as its own job page.
 *
 *   node scripts/check-arrival-sync.mjs
 *
 * Two surfaces, one scroll apart on the same phone, drawing the same job from
 * two different tables. If they ever disagree the customer believes neither.
 */
import { arrivalFromTracker, arrivalStageFor, trackerDedupeKey } from '../src/lib/arrival-sync.js'

const base = {
  code: 'K7M4PQRT', jobSummary: 'Unvented cylinder swap', jobRef: '2718',
  stage: 'BOOKED', stageNote: null, scheduledFor: new Date('2026-10-15T08:00:00Z'),
  windowState: 'AGREED', windowStart: new Date('2026-10-15T08:00:00Z'),
  windowEnd: new Date('2026-10-15T10:00:00Z'), updatedAt: new Date(),
}

let fail = 0
const ok = (name, cond, got) => {
  if (cond) console.log(`  ok    ${name}`)
  else { fail += 1; console.log(`  FAIL  ${name} -> ${JSON.stringify(got)}`) }
}

// Every job stage maps to something, and PAUSED survives the trip. A paused
// job that reads as "booked in" on the card is the one failure that matters:
// "waiting on the cylinder" is the whole reason the stage exists.
for (const [job, want] of [['BOOKED', 'BOOKED'], ['ON_MY_WAY', 'ON_THE_WAY'],
                           ['ON_SITE', 'HERE'], ['PAUSED', 'PAUSED'], ['DONE', 'DONE']]) {
  ok(`${job} -> ${want}`, arrivalStageFor(job) === want, arrivalStageFor(job))
}
ok('an unknown stage falls back rather than throwing', arrivalStageFor('NONSENSE') === 'BOOKED')

const row = arrivalFromTracker(base)
ok('the row carries the job summary', row.title === 'Unvented cylinder swap', row.title)
ok('the row links to the live job page', row.tradeStatusCode === 'K7M4PQRT', row.tradeStatusCode)
ok('it is a person, not a parcel', row.kind === 'SERVICE' && row.source === 'TRADE', row.kind)
ok('an AGREED window is carried', !!row.windowStart && !!row.windowEnd, row.windowStart)

// A window still being argued over is not a fact, here or anywhere else.
const pending = arrivalFromTracker({ ...base, windowState: 'PROPOSED', windowBy: 'CUSTOMER' })
ok('a PROPOSED window is NOT stated on the card', !pending.windowStart && !pending.windowEnd,
   { start: pending.windowStart, end: pending.windowEnd })

// Nothing the customer told the trade may ride along.
const nosy = arrivalFromTracker({
  ...base, accessNotes: 'Gate sticks, park on the verge', petsOnSite: true,
  doorToUse: 'BACK', presence: 'OUT', customerPhone: '07700 900412', mapPin: 'https://maps/x',
  housePhoto: 'https://x/house.jpg', id: 'internal-id',
})
const LEAKS = ['accessNotes', 'petsOnSite', 'doorToUse', 'presence', 'customerPhone', 'mapPin', 'housePhoto', 'id', 'customerName', 'jobAddress']
const leaked = LEAKS.filter((k) => k in nosy)
ok('nothing the customer told the trade crosses over', leaked.length === 0, leaked)

// One job is one row, for ever, however many times it is synced.
ok('the key is stable and case-insensitive',
   trackerDedupeKey('K7M4PQRT') === trackerDedupeKey('k7m4pqrt'), trackerDedupeKey('K7M4PQRT'))
ok('a job with no code produces nothing', arrivalFromTracker({}) === null)

console.log(fail ? `\nFAILED — ${fail}` : '\nPASSED — all checks')
process.exit(fail ? 1 : 0)
