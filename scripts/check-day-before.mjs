/**
 * The day-before ask, checked without a database.
 *
 *   node scripts/check-day-before.mjs
 *
 * It must fire exactly once, the afternoon before, in the trade's zone, and
 * never for a job that is done, already asked, or already answered.
 */
import { dayBeforeAskDue, askWindow, ASK_HOUR } from '../src/lib/day-before.js'

const T = (iso) => new Date(iso)
const job = (over = {}) => ({ isActive: true, stage: 'BOOKED', scheduledFor: T('2026-10-12T08:00:00Z'), presenceAskedAt: null, presenceAt: null, ...over })

let failed = 0
const check = (ok, what) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${what}`); if (!ok) failed += 1 }

// 2026-10-11 is BST (UTC+1). 15:00Z is 16:00 local; 14:59Z is 15:59 local.
check(askWindow(T('2026-10-11T15:00:00Z')) === '2026-10-12', `at ${ASK_HOUR}:00 local the window is tomorrow`)
check(askWindow(T('2026-10-11T14:59:00Z')) === null, 'a minute earlier it is not yet due (local clock, not UTC)')
check(dayBeforeAskDue(job(), T('2026-10-11T15:00:00Z')) === true, 'booked tomorrow, afternoon before: due')
check(dayBeforeAskDue(job(), T('2026-10-11T09:00:00Z')) === false, 'morning before: not yet')
check(dayBeforeAskDue(job(), T('2026-10-12T07:00:00Z')) === false, 'the morning of the job: too late, never fires')
check(dayBeforeAskDue(job(), T('2026-10-10T17:00:00Z')) === false, 'two days before: not yet')
check(dayBeforeAskDue(job({ presenceAskedAt: T('2026-10-11T15:01:00Z') }), T('2026-10-11T15:30:00Z')) === false, 'already asked: never twice')
check(dayBeforeAskDue(job({ presenceAt: T('2026-10-11T14:00:00Z') }), T('2026-10-11T15:00:00Z')) === false, 'answered an hour ago: not asked again')
check(dayBeforeAskDue(job({ presenceAt: T('2026-10-09T10:00:00Z') }), T('2026-10-11T15:00:00Z')) === true, 'answered two days ago: stale, asked')
check(dayBeforeAskDue(job({ stage: 'DONE' }), T('2026-10-11T15:00:00Z')) === false, 'done: never')
check(dayBeforeAskDue(job({ stage: 'ON_MY_WAY' }), T('2026-10-11T15:00:00Z')) === false, 'already moving: never')
check(dayBeforeAskDue(job({ isActive: false }), T('2026-10-11T15:00:00Z')) === false, 'link switched off: never')
check(dayBeforeAskDue(job({ scheduledFor: null }), T('2026-10-11T15:00:00Z')) === false, 'no day booked: nothing to ask about')
check(dayBeforeAskDue(job({ scheduledFor: null, windowStart: T('2026-10-12T09:00:00Z') }), T('2026-10-11T15:00:00Z')) === true, 'a window counts as the day')
// Clock change: 2026-10-25 is the last Sunday in October. 16:00 GMT on the 25th is 16:00Z.
check(dayBeforeAskDue(job({ scheduledFor: T('2026-10-26T09:00:00Z') }), T('2026-10-25T16:00:00Z')) === true, 'due at 16:00 the day the clocks go back')
check(dayBeforeAskDue(job({ scheduledFor: T('2026-10-26T09:00:00Z') }), T('2026-10-25T15:30:00Z')) === false, 'and not at 15:30 GMT that day')

console.log(`\n${failed === 0 ? 'The day-before ask holds.' : `${failed} check(s) failed.`}`)
process.exit(failed === 0 ? 0 : 1)
