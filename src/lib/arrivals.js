import { prisma } from './prisma'
import { generateCode } from './trade-status'
import { readArrivalEmail } from './arrival-email'
import { cleanText } from './clean-text'
import { atLocalTime } from './when'
import { cardShape } from './arrival-card'

/**
 * The household card: everything coming to one door, from wherever it came.
 *
 * Every read and write here is wrapped. `Place` and `Arrival` are new tables,
 * which is the migration case that fails soft — until `prisma db push` has run
 * the card is simply empty and nothing else in the product notices. See the
 * migration table in CLAUDE.md.
 */

/** A dedupe key that survives a carrier emailing four times about one parcel. */
function dedupeKeyFor(parsed) {
  if (parsed.reference) return `${parsed.carrierId || parsed.carrier}:${parsed.reference}`.toLowerCase().slice(0, 180)
  // No reference: the sender and what they called it is the best we have, and
  // it is right more often than it is wrong — the same shop rarely emails about
  // two different sofas on one day.
  return `${parsed.carrier}:${parsed.title}`.toLowerCase().replace(/\s+/g, ' ').slice(0, 180)
}

/**
 * Stages only ever move forwards.
 *
 * Carriers send out of order — a "dispatched" email can land after an "out for
 * delivery" one, and a delayed queue can replay yesterday. A card that walks
 * backwards is a card that lies, so a later email can only advance a row,
 * never rewind it. MISSED is the one exception: it is news, whenever it lands.
 */
const RANK = { ORDERED: 0, BOOKED: 1, ON_THE_WAY: 2, OUT_FOR_DELIVERY: 3, DONE: 4 }
function nextStage(current, incoming) {
  if (incoming === 'MISSED' || current === 'MISSED') return incoming
  const a = RANK[current] ?? -1
  const b = RANK[incoming] ?? -1
  return b >= a ? incoming : current
}

/**
 * Where forwarded email lands.
 *
 * The host is configuration, like everything else a person reads: a second
 * trade on a second domain changes a variable, not this file. INBOUND_CONFIGURED
 * is the gate — with no token set, nothing can post and the dashboard says so
 * rather than handing out an address that silently swallows mail. The push row
 * that opened onto an empty drawer is the mistake being avoided here.
 */
export const INBOUND_HOST = process.env.INBOUND_EMAIL_HOST || 'in.getturnup.com'
export const INBOUND_CONFIGURED = Boolean(process.env.INBOUND_EMAIL_TOKEN)

/** The forwarding address for a place: the half that may be given out. */
export const inboxAddress = (inboxKey, host = INBOUND_HOST) => `${inboxKey}@${host}`

/** Make a household card. Two secrets: one to read it, one to post to it. */
export async function createPlace(label) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.place.create({
        data: {
          code: generateCode(8),
          // Longer than the read code: this one ends up written down in a mail
          // filter and never typed, so length costs nothing and guessing it
          // would let somebody put rows on a stranger's card.
          inboxKey: generateCode(14).toLowerCase(),
          label: cleanText(label, 80) || null,
        },
      })
    } catch (error) {
      // A code collision is a retry, not a database fault. Same rule as jobs.
      if (error?.code === 'P2002' && attempt < 4) continue
      throw error
    }
  }
  return null
}

export async function placeByCode(code) {
  try {
    const row = await prisma.place.findUnique({
      where: { code: String(code || '').toUpperCase() },
      include: { arrivals: { orderBy: [{ expectedFor: 'asc' }, { updatedAt: 'desc' }] } },
    })
    return row?.isActive ? row : null
  } catch { return null }
}

/**
 * File one forwarded email against a place.
 *
 * Returns what happened rather than throwing, because the caller is an inbound
 * mail webhook: a provider that gets a 500 retries, and a retry storm on a
 * parse bug would put the same parcel on the card twenty times.
 */
export async function fileEmail({ inboxKey, from, subject, text, receivedAt }) {
  let place
  try {
    place = await prisma.place.findUnique({ where: { inboxKey: String(inboxKey || '').toLowerCase() } })
  } catch { return { ok: false, why: 'unavailable' } }
  if (!place?.isActive) return { ok: false, why: 'no_such_inbox' }

  const parsed = readArrivalEmail({ from, subject, text, receivedAt })
  // Not an arrival. A receipt, a newsletter, a password reset. Dropping it is
  // the correct outcome and is not an error worth reporting as one.
  if (!parsed) return { ok: true, filed: false, why: 'not_an_arrival' }

  const dedupeKey = dedupeKeyFor(parsed)
  const data = {
    kind: parsed.kind,
    source: 'EMAIL',
    carrier: parsed.carrier,
    title: parsed.title,
    reference: parsed.reference,
    trackUrl: parsed.trackUrl,
    expectedFor: parsed.expectedFor,
    expectedSaid: parsed.expectedSaid,
    windowStart: null,
    windowEnd: null,
    windowSaid: parsed.window?.said || null,
  }
  // A window is hours on the stated day; with no day there is nothing to hang
  // them off, so the words are kept and the times are not invented.
  //
  // Through atLocalTime(), never setUTCHours(). A carrier saying "between 12
  // and 4" means twelve o'clock where the house is, and Britain is an hour
  // ahead of UTC for seven months of the year — the same mistake that showed
  // a trade's 09:00 window back to the customer as 10:00.
  if (parsed.window && parsed.expectedFor) {
    const hhmm = (t) => `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`
    data.windowStart = atLocalTime(parsed.expectedFor, hhmm(parsed.window.start))
    data.windowEnd = atLocalTime(parsed.expectedFor, hhmm(parsed.window.end))
  }

  try {
    const existing = await prisma.arrival.findUnique({
      where: { placeId_dedupeKey: { placeId: place.id, dedupeKey } },
    })
    if (existing) {
      await prisma.arrival.update({
        where: { id: existing.id },
        data: {
          ...data,
          stage: nextStage(existing.stage, parsed.stage),
          // Never blank something already known because a later, thinner email
          // did not repeat it.
          reference: data.reference || existing.reference,
          trackUrl: data.trackUrl || existing.trackUrl,
          expectedFor: data.expectedFor || existing.expectedFor,
          expectedSaid: data.expectedFor ? data.expectedSaid : existing.expectedSaid,
        },
      })
      return { ok: true, filed: true, updated: true, stage: nextStage(existing.stage, parsed.stage) }
    }
    await prisma.arrival.create({ data: { ...data, placeId: place.id, dedupeKey, stage: parsed.stage } })
    return { ok: true, filed: true, updated: false, stage: parsed.stage }
  } catch (error) {
    console.error('arrival file failed:', error?.code || error?.message)
    return { ok: false, why: 'unavailable' }
  }
}

// The card's shape lives on its own, with no database import, so it can be
// checked by a script. Re-exported so callers have one place to import from.
export { cardShape }
