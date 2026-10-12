import { prisma } from '@/lib/prisma'
import { pushTrade, notifyCustomer } from '@/lib/push'
import { TRADE_NAME } from '@/lib/trade'
import { dayBeforeAskDue } from '@/lib/day-before'

/**
 * What happens when the window arrives and the card has not moved.
 *
 * Until now: nothing. The customer stared at Booked in and the trade's phone
 * stayed quiet. Two things fix that, and both are here:
 *
 *   1. The customer can ASK. "Are you still coming?" sets askedAt and buzzes
 *      every phone the trade registered. The trade answers from the card —
 *      On my way, or "about 30 minutes late" — and the customer's page shows
 *      the answer with the time it was given.
 *   2. The trade is NUDGED without being asked. When the window starts and
 *      the card still says Booked in, one push. When the window ends and the
 *      card is still not On site, a second. An unanswered question is
 *      repeated every ten minutes.
 *
 * None of this invents a time. It only notices that a time the trade gave
 * has arrived, and makes sure a human says something.
 *
 * nudgeIfDue runs on the customer's poll (every 30 s while they are looking,
 * which is exactly when it matters), on every ServiceM8 event, and from the
 * cron route. It is idempotent: each level fires once, paced by nudgedAt.
 */
const REPEAT_MS = 10 * 60_000
const first = (t) => t.customerName ? t.customerName.split(' ')[0] : 'The customer'
const hhmm = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })

export function nudgeDue(t, now = new Date()) {
  if (!t.isActive || t.stage === 'DONE') return null
  const start = t.windowStart || t.scheduledFor
  if (!start) return null
  const end = t.windowEnd || new Date(new Date(start).getTime() + 60 * 60_000)
  const since = (d) => now - new Date(d)

  // an unanswered question outranks everything, every ten minutes
  if (t.askedAt && !t.askAnsweredAt && (!t.nudgedAt || new Date(t.nudgedAt) < new Date(t.askedAt) || since(t.nudgedAt) >= REPEAT_MS)) {
    return { kind: 'ask', title: `${first(t)} is asking`, body: `"Are you still coming?" — asked at ${hhmm(t.askedAt)}, no answer yet. Tap to reply from the card.` }
  }
  if (t.nudgeLevel < 1 && now >= new Date(start) && t.stage === 'BOOKED') {
    return { kind: 'start', level: 1, title: `${first(t)}'s window has started`, body: `From ${hhmm(start)}, and the card still says Booked in. Set off, or say you are running late.` }
  }
  if (t.nudgeLevel < 2 && now >= new Date(end) && !['ON_SITE', 'PAUSED', 'DONE'].includes(t.stage)) {
    return { kind: 'end', level: 2, title: `${first(t)}'s window has ended`, body: `It ran to ${hhmm(end)} and the card is not On site. Tell them where you are.` }
  }
  // The window was missed. Ten minutes after it ended (a judgement: long
  // enough to answer the nudge, short enough that the customer is not left
  // staring), with nobody On site and no late estimate still running, the
  // CUSTOMER is told, plainly, and given three choices. Fires once.
  if (!t.missedAt && !['ON_SITE', 'PAUSED', 'DONE'].includes(t.stage) && now >= new Date(end).getTime() + MISSED_GRACE_MS) {
    const promised = t.lateMinutes && t.lateAt ? new Date(t.lateAt).getTime() + t.lateMinutes * 60_000 + MISSED_GRACE_MS : 0
    if (now >= promised) return { kind: 'missed', title: `${first(t)} has been told the window was missed`, body: `It ended at ${hhmm(end)}. They can choose to wait, have it later today, or rebook. Set off, say how late, or give them a new window.` }
  }
  return null
}

export const MISSED_GRACE_MS = 10 * 60_000
export const MISSED_CHOICES = { WAIT: 'will wait', LATER: 'would like it later today', REBOOK: 'would like another day' }

/**
 * The afternoon before the job: ask the customer whether anyone will be in.
 *
 * Decided in src/lib/day-before.js; sent here. The row is claimed first with
 * an atomic update (presenceAskedAt null -> now), so the cron sweep and the
 * customer's poll cannot both send it. The customer gets a push if they
 * switched one on; their page asks regardless. If no phone of theirs can be
 * reached, the TRADE is nudged instead to text the link, because an ask that
 * reaches nobody is not an ask. The timeline records it either way.
 */
export async function askPresenceIfDue(tracker, now = new Date()) {
  try {
    if (!dayBeforeAskDue(tracker, now)) return null
    const claimed = await prisma.tradeStatus.updateMany({
      where: { id: tracker.id, presenceAskedAt: null, stage: 'BOOKED', isActive: true },
      data: { presenceAskedAt: now },
    })
    if (claimed.count !== 1) return null
    await prisma.tradeStatusEvent.create({ data: { tradeStatusId: tracker.id, stage: 'BOOKED', note: 'Asked: will someone be in tomorrow?' } })
    const c = await notifyCustomer(tracker, { title: 'Booked for tomorrow', body: 'Will someone be in? Open the page to answer.' })
    let t = { sent: 0 }
    if (!c.sent) {
      t = await pushTrade({ title: `${first(tracker)} is booked tomorrow`, body: 'They cannot be reached by notification. Text them the link so they can say whether anyone will be in.', tag: `nudge-${tracker.code}` })
    }
    return { kind: 'day-before', sent: c.sent, tradeSent: t.sent }
  } catch (error) {
    console.error('day-before ask failed:', error?.message)
    return null
  }
}

/** Send what is due for one tracker. Never throws. */
export async function nudgeIfDue(tracker) {
  try {
    const asked = await askPresenceIfDue(tracker)
    if (asked) return asked
    const due = nudgeDue(tracker)
    if (!due) return null
    if (due.kind === 'missed') return tellMissed(tracker, due)
    const r = await pushTrade({ title: due.title, body: due.body, tag: `nudge-${tracker.code}` })
    // Only count a nudge that had somewhere to go: with no device registered,
    // the first phone to register should still get it.
    if (r.devices === 0) return { ...due, sent: 0 }
    const data = { nudgedAt: new Date() }
    if (due.level) data.nudgeLevel = due.level
    await prisma.tradeStatus.update({ where: { id: tracker.id }, data })
    return { ...due, sent: r.sent }
  } catch (error) {
    console.error('nudge failed:', error?.message)
    return null
  }
}

/** Every live job that could be due. For the cron route. */
export async function nudgeAll() {
  const rows = await prisma.tradeStatus.findMany({
    where: { isActive: true, stage: { not: 'DONE' }, OR: [{ windowStart: { not: null } }, { scheduledFor: { not: null } }] },
  })
  const out = []
  for (const t of rows) { const r = await nudgeIfDue(t); if (r) out.push({ code: t.code, kind: r.kind, sent: r.sent }) }
  return { checked: rows.length, nudged: out }
}

/** The customer asked. Once per ten minutes, then it buzzes the trade. */
export async function ask(tracker) {
  const now = new Date()
  if (tracker.askedAt && !tracker.askAnsweredAt && now - new Date(tracker.askedAt) < REPEAT_MS) return { ok: true, repeated: true }
  await prisma.tradeStatus.update({ where: { id: tracker.id }, data: {
    askedAt: now, askAnsweredAt: null, nudgedAt: now,
    events: { create: { stage: tracker.stage, note: 'Asked: are you still coming?' } },
  } })
  const r = await pushTrade({ title: `${first(tracker)} is asking`, body: `"Are you still coming?" Reply from the card: On my way, or how late.`, tag: `nudge-${tracker.code}` })
  return { ok: true, devices: r.devices, sent: r.sent }
}

/**
 * The trade's answer in minutes: "about 30 minutes late". Written to the
 * card as a note with the time, and pushed to the customer. Null clears it.
 */
export async function runningLate(tracker, minutes) {
  const now = new Date()
  const m = minutes ? Math.max(5, Math.min(240, Math.round(minutes))) : null
  const note = m ? `Running about ${m} minutes late — sorry. Said at ${hhmm(now)}.` : null
  const updated = await prisma.tradeStatus.update({ where: { id: tracker.id }, data: {
    lateMinutes: m, lateAt: m ? now : null, askAnsweredAt: now,
    ...(note ? { stageNote: note, events: { create: { stage: tracker.stage, note } } } : {}),
  } })
  if (m) notifyCustomer(updated, { title: 'Running late', body: `${TRADE_NAME} says about ${m} minutes late, and is sorry.` }).catch(() => {})
  return updated
}

/** Any stage change answers an open question. */
export const answeredByStage = (tracker) => (tracker.askedAt && !tracker.askAnsweredAt ? { askAnsweredAt: new Date() } : {})

/**
 * The window was missed: tell the customer, once, whatever devices exist.
 * Their page shows it with the three choices the moment it next polls; the
 * push is the enhancement. The trade is told that the customer was told.
 */
async function tellMissed(tracker, due) {
  const now = new Date()
  await prisma.tradeStatus.update({ where: { id: tracker.id }, data: {
    missedAt: now, nudgedAt: now, nudgeLevel: Math.max(tracker.nudgeLevel || 0, 2),
    events: { create: { stage: tracker.stage, note: 'The window was missed — the customer has been told and asked what they would like.' } },
  } })
  notifyCustomer(tracker, { title: 'Sorry — the window has passed', body: `${TRADE_NAME} has not arrived in the window. Open the page to choose: wait, later today, or another day.` }).catch(() => {})
  const r = await pushTrade({ title: due.title, body: due.body, tag: `nudge-${tracker.code}` })
  return { ...due, sent: r.sent }
}

/** The customer's choice after a missed window. A request, pushed to the trade. */
export async function chooseAfterMissed(tracker, choice) {
  if (!MISSED_CHOICES[choice]) throw new Error('bad_choice')
  const now = new Date()
  const line = `${first(tracker)} ${MISSED_CHOICES[choice]}`
  await prisma.tradeStatus.update({ where: { id: tracker.id }, data: {
    missedChoice: choice, missedChoiceAt: now,
    events: { create: { stage: tracker.stage, note: `After the missed window: ${line}.` } },
  } })
  const next = choice === 'WAIT' ? 'Set off, or say how late.' : 'Propose a new window on the card.'
  const r = await pushTrade({ title: line, body: next, tag: `nudge-${tracker.code}` })
  return { ok: true, sent: r.sent }
}
