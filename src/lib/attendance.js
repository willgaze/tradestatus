/**
 * The attendance record: what the trade's taps prove, laid out for a landlord.
 *
 * A social landlord pays its repairs contractor per visit and is marked by the
 * Housing Ombudsman per missed one, so the question it asks of every job is
 * not "what stage is it at" but "who was there, when, and did they come back".
 * Every tap on the dashboard is already a timestamped event; this turns the
 * list of events into visits, one row each, so a repeat visit reads as a
 * repeat visit and a job nobody attended reads as exactly that.
 *
 * A visit is: a set-off (optional), an arrival, and the tap that ended it
 * (Paused or Done). A second arrival after a pause is a second visit. A job
 * with no arrival at all gets one row saying so, because an absence is the
 * thing the reader is looking for and a blank list hides it.
 *
 * What goes in the file follows the same line as everywhere else: it carries
 * what the TRADE did and what the trade was told about the job (name, address,
 * job) by whoever booked it. It never carries what the CUSTOMER told the
 * trade: no door, no dog, no access notes, no presence answer, and never the
 * tracking code, because a spreadsheet gets emailed on and the code is the
 * credential. scripts/check-attendance.mjs holds that line.
 *
 * Relative imports, like trade-status.js, so plain node can run the check
 * without a bundler.
 */
import { dayAndTime, isoDay, timeOnly } from './when.js'

export const OUTCOMES = {
  DONE: 'Done',
  PAUSED: 'Paused',
  OPEN: 'Still open',
  NONE: 'No visit recorded',
}

export const COLUMNS = [
  'Date', 'Job ref', 'Customer', 'Address', 'Job', 'Booked for',
  'Visit', 'Visits', 'Set off', 'Arrived', 'Finished', 'Minutes on site', 'Outcome', 'Note',
]

const at = (e) => (e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt))

/**
 * Split a job's events into visits. Pure: a tracker row with its events in
 * the order they happened goes in, an array of visits comes out.
 */
export function visitsOf(tracker) {
  const events = [...(tracker.events || [])].sort((a, b) => at(a) - at(b))
  const visits = []
  let cur = null
  const close = (outcome, when, note) => {
    if (!cur) return
    visits.push({ ...cur, outcome, finished: when ?? null, note: note ?? cur.note ?? null })
    cur = null
  }

  for (const e of events) {
    const when = at(e)
    if (Number.isNaN(when.getTime())) continue
    switch (e.stage) {
      case 'ON_MY_WAY':
        // Setting off again before arriving is a correction, not a second trip.
        if (cur && !cur.arrived) cur.setOff = when
        else if (!cur) cur = { setOff: when, arrived: null, note: null }
        break
      case 'ON_SITE':
        if (!cur) cur = { setOff: null, arrived: null, note: null }
        // A second On site tap during the same visit changes nothing.
        if (!cur.arrived) cur.arrived = when
        break
      case 'PAUSED':
      case 'DONE':
        if (cur) close(OUTCOMES[e.stage], when, e.note)
        // Done or Paused with nobody having arrived is still a fact worth a
        // row: the job was closed from the office, not from the doorstep.
        else visits.push({ setOff: null, arrived: null, finished: when, outcome: OUTCOMES[e.stage], note: e.note ?? null })
        break
      case 'BOOKED':
        // Put back to Booked in mid-visit: whatever was open ends unresolved.
        close(OUTCOMES.OPEN, null)
        break
      default:
        break
    }
  }
  close(OUTCOMES.OPEN, null)
  return visits
}

const minutesBetween = (a, b) => (a && b ? Math.max(0, Math.round((b - a) / 60000)) : null)

/** Rows for one job: one per visit, or one row saying nobody came. */
export function rowsOf(tracker) {
  const visits = visitsOf(tracker)
  const base = {
    jobRef: tracker.jobRef || '',
    customer: tracker.customerName || '',
    address: tracker.jobAddress || '',
    job: tracker.jobSummary || '',
    bookedFor: tracker.scheduledFor ? isoDay(tracker.scheduledFor) : '',
  }
  if (visits.length === 0) {
    return [{ ...base, date: base.bookedFor || isoDay(tracker.createdAt), visit: '', visits: 0,
              setOff: '', arrived: '', finished: '', minutes: '', outcome: OUTCOMES.NONE, note: tracker.stageNote || '' }]
  }
  return visits.map((v, i) => {
    const anchor = v.arrived || v.setOff || v.finished
    const date = anchor ? isoDay(anchor) : base.bookedFor
    // A time on the row's own day is just the clock; on another day it says which.
    const clock = (d) => (d ? (isoDay(d) === date ? timeOnly(d) : dayAndTime(d)) : '')
    return {
      ...base, date, visit: i + 1, visits: visits.length,
      setOff: clock(v.setOff), arrived: clock(v.arrived), finished: clock(v.finished),
      minutes: minutesBetween(v.arrived, v.finished) ?? '',
      outcome: v.outcome, note: v.note || '',
    }
  })
}

/**
 * One cell, safe for Excel. Free text is never trusted: a note that begins
 * with = or + is a formula to a spreadsheet, so it gets a leading apostrophe,
 * which Excel shows as text and nothing else notices.
 */
export function csvCell(value) {
  let s = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

const ORDER = ['date', 'jobRef', 'customer', 'address', 'job', 'bookedFor',
  'visit', 'visits', 'setOff', 'arrived', 'finished', 'minutes', 'outcome', 'note']

/** The whole file. UTF-8 BOM so Excel reads a £ or an accent; CRLF because Excel. */
export function attendanceCsv(trackers) {
  const lines = [COLUMNS.map(csvCell).join(',')]
  for (const t of trackers) {
    for (const r of rowsOf(t)) lines.push(ORDER.map((k) => csvCell(r[k])).join(','))
  }
  return `﻿${lines.join('\r\n')}\r\n`
}
