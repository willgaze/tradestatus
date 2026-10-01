/**
 * The assistant: say what happened, get a card, tap once.
 *
 * "New job for Mrs Whitfield, Church Lane, Tuesday morning, cylinder swap"
 * becomes a filled-in job card. "On my way to Whitfield" becomes a stage
 * change. A pasted booking email becomes a job. The model reads the words and
 * PROPOSES; the trade taps Confirm; the same two endpoints the form and the
 * stage buttons already use do the writing. That is the whole design, and it
 * is borrowed from the way a good banking app takes "pay this" and hands back
 * a review screen rather than a form.
 *
 * Three rules, and they are the rules of the rest of this product:
 *
 *   IT PROPOSES, NEVER ACTS. Nothing here touches the database. The proposal
 *   goes back to the browser as JSON, the trade reads it, and the existing
 *   guarded routes do the work when the trade taps. A wrong guess costs one tap.
 *
 *   IT NEVER PROMISES A TIME. "Tell them I'll be there by two" may set the
 *   arrival window — a window is an existing, honest feature — but the note
 *   shown to the customer may not say "by 2", "within 20 minutes" or anything
 *   like it. The model is told so; `stripTimePromise` below is the second lock.
 *
 *   EVERY WORD IT RETURNS IS UNTRUSTED. The model's output is a JSON body like
 *   any other, and it goes through cleanText(), the stage whitelist and the
 *   date checks before the browser sees it, exactly as if a stranger had sent
 *   it. Which, in the sense that matters, they have.
 *
 * Trade side only. The customer's page is a status bar and stays one: a chat
 * on that side is how the product starts asking the customer things again.
 *
 * Invisible until ANTHROPIC_API_KEY is set, the same gate as push.
 */

import Anthropic from '@anthropic-ai/sdk'
import { cleanText } from '@/lib/clean-text'
import { STAGES, isValidStage } from '@/lib/trade-status'
import { TRADE_TIMEZONE } from '@/lib/trade'
import { zoned } from '@/lib/when'

export const assistantConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY)

const MODEL = 'claude-opus-5-5'

// The whole vocabulary. Anything the model returns outside this is dropped.
const FIELDS = ['customerName', 'customerPhone', 'jobSummary', 'jobAddress', 'jobRef',
  'scheduledFor', 'stage', 'stageNote', 'windowStart', 'windowEnd', 'position']

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['action', 'jobId', 'say', 'question', 'fields'],
  properties: {
    action: { type: 'string', enum: ['create_job', 'update_job', 'unclear'] },
    jobId: { type: ['string', 'null'], description: 'For update_job: the id of the existing job, copied exactly from the list. Otherwise null.' },
    say: { type: 'string', description: 'One short line, in the second person, saying what you understood. Under 90 characters.' },
    question: { type: ['string', 'null'], description: 'For unclear only: the one thing you need to know. Otherwise null.' },
    fields: {
      type: 'object',
      additionalProperties: false,
      required: FIELDS,
      properties: {
        customerName: { type: ['string', 'null'] },
        customerPhone: { type: ['string', 'null'], description: 'Digits, spaces and a leading + only.' },
        jobSummary: { type: ['string', 'null'], description: 'What the job is, in a few words.' },
        jobAddress: { type: ['string', 'null'] },
        jobRef: { type: ['string', 'null'], description: 'The trade\'s own job number, if one was given.' },
        scheduledFor: { type: ['string', 'null'], description: 'The booked day as YYYY-MM-DD, worked out from today\'s date. Null if no day was given.' },
        stage: { type: ['string', 'null'], description: `One of ${Object.keys(STAGES).join(', ')}, or null if the stage is not changing.` },
        stageNote: { type: ['string', 'null'], description: 'A note the customer will read. Never a promised time.' },
        windowStart: { type: ['string', 'null'], description: 'HH:MM, 24-hour. Start of the arrival window.' },
        windowEnd: { type: ['string', 'null'], description: 'HH:MM, 24-hour. End of the arrival window.' },
        position: { type: ['integer', 'null'], description: 'Where in today\'s run: 1 for first, 2 for second. Null unless said.' },
      },
    },
  },
}

// Frozen: nothing here changes between calls, so the prefix caches. Anything
// that varies (today's date, the job list, the words) goes in the user turn.
const SYSTEM = `You turn what a tradesperson says or pastes into ONE proposed action for a job-tracking app called Turnup. You never carry the action out; a person reads your proposal and taps Confirm.

The app tracks one job per customer through the stages BOOKED (booked in), ON_MY_WAY (set off), ON_SITE (arrived), PAUSED (on hold, with a note saying why) and DONE.

Decide one of:
- create_job: a new job. Fill every field you can read from the words. Leave the rest null. Do not invent anything.
- update_job: something about an EXISTING job from the list you are given: a stage change, a note, an arrival window, a position in the day, a corrected address or phone. Set jobId to that job's id, copied exactly. Fill only the fields that change.
- unclear: you cannot tell which job is meant, or what is wanted. Ask the one question that would settle it.

Matching a job: people say a surname, a first name, a street or a job number. Match on any of those. If two jobs match, it is unclear. If none match and the words describe a whole new booking, it is create_job.

Dates: you are told today's date and day of the week. "Tuesday" means the next Tuesday, today included. "Tomorrow morning" is tomorrow's date, and a window of 08:00 to 12:00 only if the person said morning. Do not set a window from nothing.

The note (stageNote) is shown to the customer. It must be true now and never promise a time. "Waiting on the cylinder from the merchant" is a note. "Will be with you by 2" is not: put a time the person gave into windowStart and windowEnd instead, and leave it out of the note. Never write "ETA", "by", "within" or "in N minutes" in a note. When the person says they are paused, the reason goes in the note.

A pasted email or text message may hold a name, a phone, an address, a job description and a date. Pull them out. Ignore signatures, disclaimers and anything addressed to someone else.

Write "say" as what you understood, in plain English, for example: "New job for Mrs Whitfield on Tuesday" or "Mark the Hale job as on my way". Keep it short. Never use emoji.`

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const YMD = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

// "by 2", "by 14:00", "within 20 minutes", "in 10 mins", "ETA 3pm". The prompt
// forbids these; this catches the one that gets through. Better no note than a
// promise on a customer's page.
const TIME_PROMISE = /\b(?:eta\s*:?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?|(?:by|before)\s+(?:about\s+|around\s+|roughly\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm|o'?clock)?|(?:within|in)\s+(?:about\s+|around\s+|roughly\s+)?\d{1,3}\s*(?:mins?|minutes?|hours?|hrs?))\b/i

export function stripTimePromise(note) {
  if (!note) return { note, stripped: false }
  return TIME_PROMISE.test(note) ? { note: null, stripped: true } : { note, stripped: false }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

function todayLine(now = new Date()) {
  const t = zoned(now)
  return `Today is ${DAYS[t.weekday]} ${t.day} ${MONTHS[t.month - 1]} ${t.year}, ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')} in ${TRADE_TIMEZONE}.`
}

// What the model is allowed to know about the existing jobs: enough to match
// "the Hale job" or "number 2718", and nothing the customer told the trade.
function jobLines(jobs) {
  if (!jobs.length) return 'There are no open jobs.'
  return 'Open jobs (id | customer | job number | job | address | stage | booked for):\n' + jobs.map((j) => [
    j.id, j.customerName || '-', j.jobRef || '-', j.jobSummary || '-', j.jobAddress || '-',
    j.stage, j.scheduledFor ? new Date(j.scheduledFor).toISOString().slice(0, 10) : '-',
  ].join(' | ')).join('\n')
}

/**
 * Turn the model's answer into something the browser can trust. Every value
 * is coerced or dropped: a proposal is a JSON body from a stranger.
 */
export function sanitiseProposal(raw, jobs) {
  const action = ['create_job', 'update_job', 'unclear'].includes(raw?.action) ? raw.action : 'unclear'
  const ids = new Set(jobs.map((j) => j.id))
  const jobId = action === 'update_job' && ids.has(raw?.jobId) ? raw.jobId : null
  const warnings = []

  const f = raw?.fields && typeof raw.fields === 'object' ? raw.fields : {}
  const fields = {}
  for (const key of ['customerName', 'jobSummary', 'jobAddress', 'jobRef']) {
    const v = cleanText(f[key]); if (v) fields[key] = v
  }
  const phone = cleanText(f.customerPhone, 32)
  if (phone && /^\+?[\d\s()-]{6,}$/.test(phone)) fields.customerPhone = phone
  if (typeof f.scheduledFor === 'string' && YMD.test(f.scheduledFor)) fields.scheduledFor = f.scheduledFor
  if (isValidStage(f.stage)) fields.stage = f.stage
  for (const key of ['windowStart', 'windowEnd']) {
    if (typeof f[key] === 'string' && HHMM.test(f[key])) fields[key] = f[key]
  }
  if (fields.windowStart && fields.windowEnd && fields.windowEnd <= fields.windowStart) {
    delete fields.windowEnd; warnings.push('window_backwards')
  }
  if (Number.isInteger(f.position) && f.position >= 1 && f.position <= 50) fields.position = f.position
  const { note, stripped } = stripTimePromise(cleanText(f.stageNote))
  if (note) fields.stageNote = note
  if (stripped) warnings.push('no_time_promise')

  // An update that changes nothing is a question, not a proposal.
  const finalAction = action === 'update_job' && (!jobId || Object.keys(fields).length === 0) ? 'unclear' : action

  return {
    action: finalAction,
    jobId: finalAction === 'update_job' ? jobId : null,
    fields: finalAction === 'unclear' ? {} : fields,
    say: cleanText(raw?.say, 120) || (finalAction === 'unclear' ? 'I could not follow that.' : 'Here is what I read.'),
    question: finalAction === 'unclear'
      ? (cleanText(raw?.question, 200) || 'Which job do you mean, and what should change?')
      : null,
    warnings,
  }
}

/**
 * @param {string} text  what the trade said or pasted
 * @param {Array} jobs   the open jobs, as rows from the database
 */
export async function propose(text, jobs, { now = new Date() } = {}) {
  const client = new Anthropic()
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2048,
    // A refusal on "on my way to Church Lane" is not worth an error page:
    // let the API re-run a declined request on its recommended fallback.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    // This is a one-line command, not a hard problem. Low effort is the right
    // spend, and the schema does the shaping.
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `${todayLine(now)}\n\n${jobLines(jobs)}\n\nWhat the tradesperson said or pasted:\n"""\n${text}\n"""`,
    }],
  })

  if (response.stop_reason === 'refusal') {
    return sanitiseProposal({ action: 'unclear', question: 'I could not work with that. Try saying it another way.' }, jobs)
  }
  const block = response.content.find((b) => b.type === 'text')
  let raw = null
  try { raw = block ? JSON.parse(block.text) : null } catch { raw = null }
  return sanitiseProposal(raw, jobs)
}
