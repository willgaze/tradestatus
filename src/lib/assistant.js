/**
 * Ask it or tell it. The box at the top of the dashboard.
 *
 * "What's on today?" gets an answer. "On my way to Whitfield" gets a card to
 * confirm. "New job for Mrs Hale, 3 Mill Cottages, Tuesday morning, bathroom
 * second fix" gets a filled-in job to confirm. A pasted booking email gets the
 * same. It is the way a good banking app takes "pay this" and hands back a
 * review screen instead of a form, and it is here because the dashboard had
 * become a wall of buttons nobody could learn.
 *
 * Three rules, and they are the rules of the rest of this product:
 *
 *   IT PROPOSES, NEVER ACTS. Nothing here touches the database. A proposal
 *   goes back to the browser as JSON, the trade reads it, and the existing
 *   guarded routes do the work when the trade taps Confirm. A wrong reading
 *   costs one tap. An ANSWER is just words; it changes nothing.
 *
 *   IT NEVER PROMISES A TIME. "Tell them I'll be there by two" may set the
 *   arrival window, which is an arrangement the customer can agree or counter,
 *   but the note shown to the customer may not say "by 2" or "within 20
 *   minutes". The model is told so; `stripTimePromise` is the second lock.
 *   "Running late" is only ever 15, 30 or 60 minutes, and only as the trade
 *   said it, the same as the buttons on the card.
 *
 *   EVERY WORD IT RETURNS IS UNTRUSTED. The model's output is a JSON body like
 *   any other and goes through cleanText(), the stage whitelist, the date and
 *   time checks, and a job id that must be one it was shown, before the
 *   browser sees it.
 *
 * Trade side only. The customer's page is a status bar and stays one. It is
 * invisible until ANTHROPIC_API_KEY is set, the same gate as push, and the key
 * never reaches the browser. What does reach the model: the open jobs as the
 * dashboard sees them, minus every phone number. That is the trade's own data,
 * behind the trade's own password, and the model is a processor of it.
 */

import Anthropic from '@anthropic-ai/sdk'
import { cleanText } from '@/lib/clean-text'
import { STAGES, isValidStage } from '@/lib/trade-status'
import { TRADE_TIMEZONE } from '@/lib/trade'
import { zoned } from '@/lib/when'

export const assistantConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY)

const MODEL = 'claude-opus-5-5'

export const KINDS = ['answer', 'create_job', 'update_job', 'unclear']
const LATE_CHOICES = [15, 30, 60]

// The whole vocabulary. Anything the model returns outside this is dropped.
const FIELDS = ['customerName', 'customerPhone', 'jobSummary', 'jobAddress', 'jobRef', 'sm8JobNumber',
  'scheduledFor', 'stage', 'stageNote', 'windowStart', 'windowEnd', 'windowAgree', 'windowClear',
  'position', 'lateMinutes', 'clearLate']

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'say', 'jobId', 'question', 'fields'],
  properties: {
    kind: { type: 'string', enum: KINDS },
    say: { type: 'string', description: 'For answer: the answer, short, plain English. For create_job or update_job: one line saying what you understood, under 90 characters. For unclear: one line saying what you could not follow.' },
    jobId: { type: ['string', 'null'], description: 'For update_job: the id of the existing job, copied exactly from the list. Otherwise null.' },
    question: { type: ['string', 'null'], description: 'For unclear only: the one thing you need to know. Otherwise null.' },
    fields: {
      type: 'object',
      additionalProperties: false,
      required: FIELDS,
      properties: {
        customerName: { type: ['string', 'null'] },
        customerPhone: { type: ['string', 'null'], description: 'Only for a NEW job, and only if given. Digits, spaces and a leading + only.' },
        jobSummary: { type: ['string', 'null'], description: 'What the job is, in a few words.' },
        jobAddress: { type: ['string', 'null'] },
        jobRef: { type: ['string', 'null'], description: 'The trade\'s own job number, if one was given.' },
        sm8JobNumber: { type: ['string', 'null'], description: 'For a NEW job named by its ServiceM8 job number ("job 2718 from ServiceM8"). The number only.' },
        scheduledFor: { type: ['string', 'null'], description: 'The booked day as YYYY-MM-DD, worked out from today\'s date. Null if no day was given or it is not changing.' },
        stage: { type: ['string', 'null'], description: `One of ${Object.keys(STAGES).join(', ')}, or null if the stage is not changing.` },
        stageNote: { type: ['string', 'null'], description: 'A note the customer will read. Never a promised time.' },
        windowStart: { type: ['string', 'null'], description: 'HH:MM, 24-hour. Start of the arrival window the trade is proposing.' },
        windowEnd: { type: ['string', 'null'], description: 'HH:MM, 24-hour. End of the arrival window.' },
        windowAgree: { type: 'boolean', description: 'True when the trade is agreeing to hours the CUSTOMER asked for. Only valid when that job shows a customer proposal waiting.' },
        windowClear: { type: 'boolean', description: 'True when the trade wants the window dropped altogether.' },
        position: { type: ['integer', 'null'], description: 'Where in the day\'s run: 1 for first, 2 for second. Null unless said.' },
        lateMinutes: { type: ['integer', 'null'], description: 'Only 15, 30 or 60, and only when the trade says they are running about that late. Null otherwise. Never work it out.' },
        clearLate: { type: 'boolean', description: 'True when the trade says they are no longer running late.' },
      },
    },
  },
}

// Frozen: nothing here changes between calls, so the prefix caches. Everything
// that varies (today, the jobs, the setup, the words) goes in the user turn.
const SYSTEM = `You are the box at the top of the dashboard of TurnUp, an app a tradesperson uses to show customers where their job is. The person typing is the tradesperson, on a phone, often standing next to a van. They either ASK you something or TELL you something.

TurnUp tracks one job per customer through the stages BOOKED (booked in), ON_MY_WAY (set off), ON_SITE (arrived), PAUSED (on hold, with a note saying why) and DONE. Each job has a link the customer opens. A job can carry an arrival window, which is an ARRANGEMENT: the trade proposes hours, the customer agrees or asks for different ones, and only an agreed window is stated as a fact. A customer can answer "will someone be in?", tell the trade which door and whether there is a dog, and ask "are you still coming?" once a window has started. The trade can answer "about 15, 30 or 60 minutes late".

Decide one of:
- answer: they asked a question, or want to know how something works. Answer from the jobs and the setup facts you are given, in plain English, short enough for a phone. Say what is true and checkable. If the answer is "nothing", say so. When asked how to do something on the dashboard: the stage is the row of five buttons on each job; sending the link, hours, photos and the note are under More on the job; Who to expect, Nudge me, Turn on notifications, ServiceM8 and Signing in are under Setup and settings at the bottom. You can also offer to do it: "Say 'on my way to Hale' and I will set it up for you to confirm."
- create_job: a new job. Fill every field you can read from the words. Leave the rest null. Do not invent anything. A ServiceM8 job number fills the rest in, so set sm8JobNumber and nothing else you were not told.
- update_job: something about an EXISTING job from the list: a stage change, a note, an arrival window, agreeing the customer's hours, running late, a position in the day, a corrected address or name. Set jobId to that job's id, copied exactly. Fill only the fields that change.
- unclear: you cannot tell which job is meant, or what is wanted. Ask the one question that settles it.

Matching a job: people say a surname, a first name, a street, a town or a job number. Match on any of those. If two jobs match, it is unclear. If none match and the words describe a whole new booking, it is create_job.

Dates: you are told today's date and the day of the week. "Tuesday" means the next Tuesday, today included. "Tomorrow morning" is tomorrow's date, with a window of 08:00 to 12:00 only if the person said morning. Do not set a window from nothing.

The note (stageNote) is shown to the customer. It must be true now and never promise a time. "Waiting on the cylinder from the merchant" is a note. "Will be with you by 2" is not: put hours the person gave into windowStart and windowEnd and leave them out of the note. Never write "ETA", "by", "within" or "in N minutes" in a note. When the person says they are paused, the reason goes in the note. "Running about half an hour late" is lateMinutes 30, not a note. "Back on at Hale" after a pause is stage ON_SITE. "Done at Beck" is stage DONE.

Never claim anything has been done. You propose; the person confirms. Never promise what TurnUp cannot do. Never repeat a phone number. Never use emoji. "say" for a proposal is what you understood, for example "New job for Mrs Whitfield on Tuesday" or "Mark the Hale job as on my way". Keep it short.`

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const YMD = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

// "by 2", "by 14:00", "within 20 minutes", "in 10 mins", "ETA 3pm". The prompt
// forbids these; this catches the one that gets through. Better no note than a
// promise on a customer's page. "In 2 days" and "in 2 Church Lane" pass.
const TIME_PROMISE = /\b(?:eta\s*:?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?|(?:by|before)\s+(?:about\s+|around\s+|roughly\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm|o'?clock)?|(?:within|in)\s+(?:about\s+|around\s+|roughly\s+)?\d{1,3}\s*(?:mins?|minutes?|hours?|hrs?))\b/i

export function stripTimePromise(note) {
  if (!note) return { note, stripped: false }
  return TIME_PROMISE.test(note) ? { note: null, stripped: true } : { note, stripped: false }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']
const pad = (n) => String(n).padStart(2, '0')

function todayLine(now = new Date()) {
  const t = zoned(now)
  return `Today is ${DAYS[t.weekday]} ${t.day} ${MONTHS[t.month - 1]} ${t.year}, ${pad(t.hour)}:${pad(t.minute)} in ${TRADE_TIMEZONE}.`
}

/** "2026-10-10 09:15" in the trade's zone, or null. */
export function localStamp(value) {
  if (!value) return null
  const t = zoned(value)
  return t ? `${t.year}-${pad(t.month)}-${pad(t.day)} ${pad(t.hour)}:${pad(t.minute)}` : null
}
const localDay = (value) => (value ? localStamp(value)?.slice(0, 10) : null)
const localTime = (value) => (value ? localStamp(value)?.slice(11) : null)

/**
 * A job as the model is allowed to know it: what the dashboard shows, minus
 * every phone number. The trade sees all of this behind their password; the
 * model is reading it on their behalf, not publishing it.
 */
export function jobView(t) {
  return {
    id: t.id,
    customer: t.customerName || null,
    ref: t.jobRef || null,
    job: t.jobSummary || null,
    address: t.jobAddress || null,
    stage: t.stage,
    bookedFor: localDay(t.scheduledFor),
    setOffAt: localStamp(t.arrivingAt),
    window: t.windowState ? {
      state: t.windowState, by: t.windowBy,
      start: localStamp(t.windowStart), end: localTime(t.windowEnd), note: t.windowNote || null,
    } : null,
    position: t.position ?? null,
    presence: t.presence ? { said: t.presence, note: t.presenceNote || null, at: localStamp(t.presenceAt) } : null,
    asked: t.askedAt ? { at: localStamp(t.askedAt), answeredAt: localStamp(t.askAnsweredAt) } : null,
    late: t.lateMinutes ? { minutes: t.lateMinutes, saidAt: localStamp(t.lateAt) } : null,
    missed: t.missedAt ? { at: localStamp(t.missedAt), customerChose: t.missedChoice || null } : null,
    access: (t.doorToUse || t.petsOnSite || t.accessNotes)
      ? { door: t.doorToUse || null, dog: Boolean(t.petsOnSite), notes: t.accessNotes || null } : null,
    note: t.stageNote || null,
    linkOpened: t.viewCount || 0,
    lastOpened: localStamp(t.lastViewedAt),
    followsServiceM8: Boolean(t.externalId),
    active: t.isActive !== false,
    events: (t.events || []).map((e) => ({ stage: e.stage, at: localStamp(e.createdAt) })),
  }
}

function jobLines(jobs) {
  if (!jobs.length) return 'There are no jobs yet.'
  return `Jobs, one per line as JSON, in the order of the day's run (times are ${TRADE_TIMEZONE}):\n` +
    jobs.map((j) => JSON.stringify(jobView(j))).join('\n')
}

function setupLines(setup) {
  if (!setup) return ''
  return 'Setup facts: ' + JSON.stringify({
    whoToExpect: setup.engineerName ? `${setup.engineerName}${setup.vehicle ? `, ${setup.vehicle}` : ''}` : 'not set',
    notificationsConfigured: Boolean(setup.pushConfigured),
    tradePhonesRegisteredForNudges: setup.devices ?? 0,
    faceIdDevices: setup.passkeys ?? 0,
    serviceM8Connected: Boolean(setup.sm8Configured),
  })
}

// A short memory of this sitting, so "and Janet?" works. Capped hard: it is
// untrusted text from the browser like everything else.
function historyLines(history) {
  const rows = Array.isArray(history) ? history.slice(-10) : []
  const lines = rows.map((h) => {
    const who = h?.who === 'turnup' ? 'TurnUp' : 'Trade'
    const text = cleanText(h?.text, 500)
    return text ? `${who}: ${text}` : null
  }).filter(Boolean)
  return lines.length ? `Earlier in this sitting:\n${lines.join('\n')}` : ''
}

/**
 * Turn the model's answer into something the browser can trust. Every value
 * is coerced or dropped: a proposal is a JSON body from a stranger.
 */
export function sanitiseProposal(raw, jobs) {
  const kind = KINDS.includes(raw?.kind) ? raw.kind : 'unclear'
  const byId = new Map(jobs.map((j) => [j.id, j]))
  const job = kind === 'update_job' && byId.has(raw?.jobId) ? byId.get(raw.jobId) : null
  const warnings = []

  const f = raw?.fields && typeof raw.fields === 'object' ? raw.fields : {}
  const fields = {}
  for (const key of ['customerName', 'jobSummary', 'jobAddress', 'jobRef']) {
    const v = cleanText(f[key]); if (v) fields[key] = v
  }
  const phone = cleanText(f.customerPhone, 32)
  if (kind === 'create_job' && phone && /^\+?[\d\s()-]{6,}$/.test(phone)) fields.customerPhone = phone
  const sm8 = cleanText(f.sm8JobNumber, 20)
  if (kind === 'create_job' && sm8 && /^[\w-]{1,20}$/.test(sm8)) fields.sm8JobNumber = sm8
  if (typeof f.scheduledFor === 'string' && YMD.test(f.scheduledFor)) fields.scheduledFor = f.scheduledFor
  if (isValidStage(f.stage)) fields.stage = f.stage
  for (const key of ['windowStart', 'windowEnd']) {
    if (typeof f[key] === 'string' && HHMM.test(f[key])) fields[key] = f[key]
  }
  if (fields.windowStart && fields.windowEnd && fields.windowEnd <= fields.windowStart) {
    delete fields.windowEnd; warnings.push('window_backwards')
  }
  if (f.windowAgree === true) {
    // Agreeing only means something when the customer has hours on the table.
    if (job && job.windowState === 'PROPOSED' && job.windowBy === 'CUSTOMER') fields.windowAgree = true
    else warnings.push('nothing_to_agree')
  }
  if (f.windowClear === true && !fields.windowStart) fields.windowClear = true
  if (Number.isInteger(f.position) && f.position >= 1 && f.position <= 50) fields.position = f.position
  if (LATE_CHOICES.includes(f.lateMinutes)) fields.lateMinutes = f.lateMinutes
  else if (f.lateMinutes != null) warnings.push('late_not_a_choice')
  if (f.clearLate === true && !fields.lateMinutes) fields.clearLate = true
  const { note, stripped } = stripTimePromise(cleanText(f.stageNote))
  if (note) fields.stageNote = note
  if (stripped) warnings.push('no_time_promise')

  // An update to no job, or that changes nothing, is a question, not a plan.
  let finalKind = kind
  if (kind === 'update_job' && (!job || Object.keys(fields).length === 0)) finalKind = 'unclear'
  if (kind === 'create_job' && Object.keys(fields).length === 0) finalKind = 'unclear'

  const say = cleanText(raw?.say, finalKind === 'answer' ? 1200 : 160)
  return {
    kind: finalKind,
    jobId: finalKind === 'update_job' ? job.id : null,
    fields: finalKind === 'create_job' || finalKind === 'update_job' ? fields : {},
    say: say || (finalKind === 'unclear' ? 'I could not follow that.' : finalKind === 'answer' ? 'Nothing to report.' : 'Here is what I read.'),
    question: finalKind === 'unclear'
      ? (cleanText(raw?.question, 200) || 'Which job do you mean, and what should change?')
      : null,
    warnings,
  }
}

/**
 * @param {string} text     what the trade said or pasted
 * @param {Array}  jobs     the jobs, as rows from the database, with events
 * @param {object} setup    the setup facts (see the route)
 * @param {Array}  history  this sitting's earlier exchanges, [{who, text}]
 */
export async function propose(text, jobs, { setup = null, history = [], now = new Date() } = {}) {
  const client = new Anthropic()
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2048,
    // A refusal on "on my way to Church Lane" is not worth an error page:
    // let the API re-run a declined request on its recommended fallback.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    // One line in, one card or one short answer out. Low effort is the right
    // spend, and the schema does the shaping.
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: [todayLine(now), setupLines(setup), jobLines(jobs), historyLines(history),
        `What the tradesperson said or pasted:\n"""\n${text}\n"""`].filter(Boolean).join('\n\n'),
    }],
  })

  if (response.stop_reason === 'refusal') {
    return sanitiseProposal({ kind: 'unclear', question: 'I could not work with that. Try saying it another way.' }, jobs)
  }
  const block = response.content.find((b) => b.type === 'text')
  let raw = null
  try { raw = block ? JSON.parse(block.text) : null } catch { raw = null }
  return sanitiseProposal(raw, jobs)
}
