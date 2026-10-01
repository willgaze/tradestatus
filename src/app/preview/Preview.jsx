'use client'

import StatusTracker from '../t/StatusTracker'

/**
 * One job, mid-flight, with everything filled in — the busiest the customer's
 * page ever gets, which is the state worth measuring and photographing.
 *
 * The day is fixed rather than relative to now, so two captures a week apart
 * are comparable.
 */
const DAY = '2026-10-01T00:00:00.000Z'
const at = (hour) => {
  const d = new Date(DAY)
  d.setUTCHours(hour - 1, 0, 0, 0) // the fixture day is BST, an hour ahead
  return d.toISOString()
}

export default function Preview() {
  return (
    <StatusTracker
      initialProfile={{
        engineerName: 'Sam Hale',
        aboutLine: 'Twelve years on the tools',
        vehicle: 'White Vauxhall Vivaro',
        vehicleReg: 'SH21 VAN',
      }}
      initialBrand={null}
      initialStatus={{
        code: 'K7M4PQRT',
        stage: 'ON_MY_WAY',
        stageNote: 'Cylinder is on the van — picked it up from the merchant first thing.',
        customerName: 'Sarah',
        jobRef: '2718',
        jobAddress: 'Church Lane, Burbage SN8',
        jobSummary: 'Unvented cylinder swap',
        scheduledFor: DAY,
        arrivingAt: at(8),
        updatedAt: at(8),
        position: 2,
        presenceAt: at(7),
        window: { state: 'AGREED', by: 'TRADE', start: at(9), end: at(11), at: at(7) },
        events: [
          { stage: 'BOOKED', note: 'Booked in for Thursday.', at: at(6) },
          { stage: 'ON_MY_WAY', note: null, at: at(8) },
        ],
      }}
    />
  )
}
