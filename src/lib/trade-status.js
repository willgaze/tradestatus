// My Trade Status — the five states a job can be in, in the customer's words.
//
// Wording rule: these describe what is happening now, never what will happen
// by a certain time. They also name nobody — this product is fitted by more
// than one trade, and the tradesperson's name comes from NEXT_PUBLIC_TRADE_NAME
// at the top of the page, never from copy baked into a shared constant. "On my way" is a fact. "With you in 20 minutes" is a
// promise one plumber cannot keep, and the site does not make it anywhere.

export const STAGES = {
  BOOKED: {
    key: 'BOOKED',
    label: 'Booked in',
    customerLine: 'Your job is in the diary.',
    icon: '📅',
    step: 1,
  },
  ON_MY_WAY: {
    key: 'ON_MY_WAY',
    label: 'On my way',
    customerLine: 'They have set off and are heading to you.',
    icon: '🚐',
    step: 2,
  },
  ON_SITE: {
    key: 'ON_SITE',
    label: 'On site',
    customerLine: 'They are with you and work is under way.',
    icon: '🔧',
    step: 3,
  },
  PAUSED: {
    key: 'PAUSED',
    label: 'Paused',
    customerLine: 'Work is on hold — the note below says why.',
    icon: '⏸️',
    step: 3,
  },
  DONE: {
    key: 'DONE',
    label: 'Job done',
    customerLine: 'Work is finished and the site is tidy.',
    icon: '✅',
    step: 4,
  },
}

// The four the customer sees as a progress line. PAUSED sits off to one side:
// it is a state, not a step, and showing it as a fifth dot would suggest every
// job pauses.
export const STAGE_ORDER = ['BOOKED', 'ON_MY_WAY', 'ON_SITE', 'DONE']

export const isValidStage = (stage) => Object.prototype.hasOwnProperty.call(STAGES, stage)

export const stageOf = (stage) => STAGES[stage] || STAGES.BOOKED

// Codes go in a link a customer reads off a text message, so no characters
// that look like each other: no 0/O, no 1/I/L.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCode(length = 8) {
  const bytes =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(length))
      : // eslint-disable-next-line global-require
        require('crypto').randomBytes(length)

  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return code
}

// What the public route is allowed to hand back. Everything else on the row —
// the job UUID, view counts, who looked and when — stays inside.
export function publicShape(row) {
  return {
    code: row.code,
    stage: isValidStage(row.stage) ? row.stage : 'BOOKED',
    stageNote: row.stageNote || null,
    customerName: row.customerName || null,
    jobRef: row.jobRef || null,
    jobAddress: row.jobAddress || null,
    jobSummary: row.jobSummary || null,
    scheduledFor: row.scheduledFor ? row.scheduledFor.toISOString() : null,
    arrivingAt: row.arrivingAt ? row.arrivingAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    events: (row.events || []).map((event) => ({
      stage: event.stage,
      note: event.note || null,
      at: event.createdAt.toISOString(),
    })),
  }
}
