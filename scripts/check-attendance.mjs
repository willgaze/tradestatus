/**
 * The attendance CSV, checked without a database.
 *
 *   node scripts/check-attendance.mjs
 *
 * Three things have to hold, and each fails loudly with the row named:
 *
 *   1. Visits are counted right. Two arrivals round a pause are two rows; a
 *      job nobody went to is one row that says so; a set-off tapped twice
 *      before arriving is one trip, not two.
 *   2. Nothing the customer told the trade is in the file, and neither is the
 *      tracking code. A spreadsheet gets emailed on; the code is the credential.
 *   3. A note that starts with = or + cannot become a formula in Excel.
 */
import { attendanceCsv, rowsOf, csvCell } from '../src/lib/attendance.js'

const T = (iso) => new Date(iso)
const ev = (stage, createdAt, note = null) => ({ stage, createdAt: T(createdAt), note })

const JOBS = [
  { // Arrived, paused for a part, came back, finished: two visits.
    code: 'K7M4PQRT', jobRef: '2718', customerName: 'Sarah Whitfield', jobAddress: '14 Church Lane, Burbage SN8 3AQ',
    jobSummary: 'Unvented cylinder swap', scheduledFor: T('2026-10-08T08:00:00Z'), createdAt: T('2026-10-05T13:00:00Z'),
    doorToUse: 'SIDE', petsOnSite: true, accessNotes: 'Gate sticks. Park on the verge.', presence: 'IN', what3words: 'filled.count.soap',
    events: [ev('BOOKED', '2026-10-05T13:00:00Z', 'Booked in for Thursday.'),
             ev('ON_MY_WAY', '2026-10-08T07:05:00Z'), ev('ON_MY_WAY', '2026-10-08T07:12:00Z'),
             ev('ON_SITE', '2026-10-08T07:40:00Z'),
             ev('PAUSED', '2026-10-08T10:30:00Z', '=Waiting on the cylinder. Merchant has it Monday.'),
             ev('ON_MY_WAY', '2026-10-12T07:50:00Z'), ev('ON_SITE', '2026-10-12T08:20:00Z'),
             ev('DONE', '2026-10-12T11:05:00Z', 'Commissioned, "all" good')],
  },
  { // Booked, nobody went.
    code: 'QF52MDKR', jobRef: '2719', customerName: 'Janet Pryce', jobAddress: 'The Old Forge, Oare SN8 4JQ',
    jobSummary: 'Leaking rad valve', scheduledFor: T('2026-10-09T08:00:00Z'), createdAt: T('2026-10-06T10:00:00Z'),
    events: [ev('BOOKED', '2026-10-06T10:00:00Z')],
  },
  { // Still on site right now: an open visit.
    code: 'B3XN8WHF', jobRef: '2720', customerName: 'Mr & Mrs Doherty', jobAddress: '3 Mill Cottages, Pewsey SN9 5LW',
    jobSummary: 'Bathroom second fix', scheduledFor: null, createdAt: T('2026-10-10T06:00:00Z'),
    events: [ev('BOOKED', '2026-10-10T06:00:00Z'), ev('ON_SITE', '2026-10-10T07:30:00Z')],
  },
  { // Marked done from the office, no arrival ever tapped.
    code: 'ZZZZ2222', jobRef: '2721', customerName: 'A N Other', jobAddress: '1 High St', jobSummary: 'Quote only',
    scheduledFor: null, createdAt: T('2026-10-01T09:00:00Z'),
    events: [ev('BOOKED', '2026-10-01T09:00:00Z'), ev('DONE', '2026-10-02T09:00:00Z', 'Quoted by phone')],
  },
]

let failed = 0
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${what}`); if (!ok) failed += 1 }

const r1 = rowsOf(JOBS[0])
check(r1.length === 2, `two visits round a pause (got ${r1.length})`)
check(r1[0].visits === 2 && r1[1].visit === 2, 'visit numbered 1 of 2, 2 of 2')
check(r1[0].setOff === '08:12', `second set-off tap replaces the first, one trip (got ${r1[0].setOff})`)
check(r1[0].arrived === '08:40' && r1[0].finished === '11:30', `clock in Europe/London, not UTC (got ${r1[0].arrived}, ${r1[0].finished})`)
check(r1[0].minutes === 170, `minutes on site from arrival to pause (got ${r1[0].minutes})`)
check(r1[0].outcome === 'Paused' && r1[1].outcome === 'Done', 'outcomes Paused then Done')
check(r1[0].date === '2026-10-08' && r1[1].date === '2026-10-12', 'each visit dated by its own arrival')

const r2 = rowsOf(JOBS[1])
check(r2.length === 1 && r2[0].outcome === 'No visit recorded' && r2[0].visits === 0, 'a job nobody went to is one row that says so')
check(r2[0].date === '2026-10-09', `unattended row dated by the booked day (got ${r2[0].date})`)

const r3 = rowsOf(JOBS[2])
check(r3.length === 1 && r3[0].outcome === 'Still open' && r3[0].finished === '', 'an open visit is Still open with no finish')

const r4 = rowsOf(JOBS[3])
check(r4.length === 1 && r4[0].outcome === 'Done' && r4[0].arrived === '' && r4[0].finished !== '', 'Done with no arrival is a row with a finish and no arrival')

const csv = attendanceCsv(JOBS)
const lines = csv.split('\r\n').filter(Boolean)
check(csv.startsWith('﻿'), 'UTF-8 BOM for Excel')
check(lines.length === 1 + 2 + 1 + 1 + 1, `header plus five rows (got ${lines.length})`)
for (const leak of ['K7M4PQRT', 'QF52MDKR', 'B3XN8WHF', 'ZZZZ2222', 'SIDE', 'Gate sticks', 'filled.count.soap', 'IN,', 'petsOnSite']) {
  check(!csv.includes(leak), `never in the file: ${leak}`)
}
check(csv.includes(`"'=Waiting on the cylinder. Merchant has it Monday."`) || csv.includes(`'=Waiting on the cylinder. Merchant has it Monday.`), 'a note starting with = is text in Excel, not a formula')
check(csv.includes('"Commissioned, ""all"" good"'), 'commas and quotes in a note are quoted')
check(csvCell('+44 1234') === "'+44 1234" && csvCell('plain') === 'plain' && csvCell(null) === '', 'csvCell edge cases')

console.log(`\n${failed === 0 ? 'Attendance CSV holds.' : `${failed} check(s) failed.`}`)
if (process.argv.includes('--print')) process.stdout.write(csv)
process.exit(failed === 0 ? 0 : 1)
