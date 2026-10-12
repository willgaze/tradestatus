/**
 * A TurnUp job, as a row on a household card.
 *
 * The trade's own visit is the one arrival on that card that somebody can
 * actually move — the plumber taps a button and the row changes, which no
 * parcel row can do. It is also the only row with a live page behind it.
 *
 * Pure and database-free so it can be checked by a script, and so the mapping
 * between two sets of stage words lives in exactly one place. Getting that
 * mapping wrong would show a customer a stage their own job page disagrees
 * with, on the same phone, a scroll apart.
 */

/**
 * Job stages to arrival stages.
 *
 * ON_SITE becomes HERE rather than being squeezed into a parcel word. The
 * arrival stage column is free text, not an enum, so a word that means what it
 * says costs nothing and a contorted one would cost the reader.
 *
 * PAUSED has no parcel equivalent at all and that is the point of it: "waiting
 * on the cylinder" is the thing a customer most wants said and the thing least
 * often said. It would be lost by mapping it onto anything else.
 */
const STAGE_MAP = {
  BOOKED: 'BOOKED',
  ON_MY_WAY: 'ON_THE_WAY',
  ON_SITE: 'HERE',
  PAUSED: 'PAUSED',
  DONE: 'DONE',
}

export const arrivalStageFor = (jobStage) => STAGE_MAP[jobStage] || 'BOOKED'

/** One stable key per job, so a job is never added to a card twice. */
export const trackerDedupeKey = (code) => `turnup:${String(code || '').toLowerCase()}`

/**
 * What the row says.
 *
 * Only what the TRADE has told this customer, exactly as the job page shows
 * it: the job summary, the stage, and an AGREED window. A window still being
 * negotiated is not stated as fact here any more than it is there, and the
 * customer's own answers never cross over — the household card is a public
 * link like any other, so `src/lib/arrival-card.js` and this file answer to
 * the same rule.
 */
export function arrivalFromTracker(tracker, now = new Date()) {
  if (!tracker?.code) return null

  const agreed = tracker.windowState === 'AGREED' && tracker.windowStart && tracker.windowEnd
  const expectedFor = tracker.scheduledFor || (agreed ? tracker.windowStart : null) || null

  return {
    dedupeKey: trackerDedupeKey(tracker.code),
    kind: 'SERVICE',
    source: 'TRADE',
    stage: arrivalStageFor(tracker.stage),
    carrier: null,
    title: tracker.jobSummary || 'Your booking',
    reference: tracker.jobRef || null,
    trackUrl: null,
    // The stage note is the trade speaking to this customer about this job,
    // which is the same thing the job page shows them. It is not free text
    // from a stranger's email.
    note: tracker.stageNote || null,
    expectedFor,
    expectedSaid: null,
    windowStart: agreed ? tracker.windowStart : null,
    windowEnd: agreed ? tracker.windowEnd : null,
    windowSaid: null,
    tradeStatusCode: tracker.code,
    updatedAt: tracker.updatedAt || now,
  }
}
