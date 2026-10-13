import { prisma } from '@/lib/prisma'
import { notifyCustomer } from '@/lib/push'
import { TRADE_NAME } from '@/lib/trade'
import { diaryFor } from '@/lib/sm8-oauth'
import { timeOnly } from '@/lib/when'
import { PAUSE_BACK, isPauseBack, pauseBackLine } from '@/lib/pause-words'
export { PAUSE_BACK, PAUSE_BACK_KEYS, isPauseBack, pauseBackLine, pauseBackDue } from '@/lib/pause-words'

/**
 * Paused, and when the trade expects to be back.
 *
 * Paused already says why (the stage note). This says when, in the only form
 * the product allows: a choice the TRADE made, in their own words, shown with
 * the time they said it. "Back in about an hour, said at 10:40" is a fact
 * about what was said. The product never works a return time out, and it
 * never turns "about an hour" into a countdown.
 *
 * Seven choices and nothing typed, so it is one tap on a driveway and so the
 * customer's page can say the same thing every time. The two shaped like a
 * day ("tomorrow", "another day") carry no clock time at all, and the page
 * says the hours will come under When suits you? like any other window.
 */
/**
 * The trade says when they expect to be back. Only while Paused: an estimate
 * of a return makes no sense on a job nobody has left. Null clears it.
 * Written with the time, pushed to the customer, on the record and in the
 * ServiceM8 diary — the same four places "about 30 minutes late" goes.
 */
export async function pausedBack(tracker, key) {
  if (tracker.stage !== 'PAUSED') return { error: 'not_paused', status: 409 }
  if (key !== null && !isPauseBack(key)) return { error: 'bad_choice', status: 400 }
  const now = new Date()
  const line = key ? pauseBackLine(key, now) : null
  const updated = await prisma.tradeStatus.update({ where: { id: tracker.id }, data: {
    pauseBack: key, pauseBackAt: key ? now : null,
    ...(line ? { events: { create: { stage: tracker.stage, note: line } } } : {}),
  } })
  if (key) notifyCustomer(updated, { title: 'Paused, and when they are back', body: `${TRADE_NAME} says ${PAUSE_BACK[key].line}, said at ${timeOnly(now)}.` }).catch(() => {})
  if (key) diaryFor(updated, `Paused: ${PAUSE_BACK[key].line}, customer told.`).catch(() => {})
  return { tracker: updated }
}

/** Entering Paused stamps the time; leaving it clears the estimate with it. */
export function pauseStampFor(current, nextStage) {
  if (nextStage === 'PAUSED' && current.stage !== 'PAUSED') return { pausedAt: new Date(), pauseBack: null, pauseBackAt: null }
  if (nextStage !== 'PAUSED' && current.stage === 'PAUSED') return { pausedAt: null, pauseBack: null, pauseBackAt: null }
  return {}
}
