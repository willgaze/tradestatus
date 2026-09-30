import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { TRADE_NAME } from '@/lib/trade'

/**
 * "They have set off" on the lock screen.
 *
 * This is the nearest thing to the wallet card that exists without paying
 * anyone: iOS 16.4 and later deliver web push to a page the customer has added
 * to their home screen, with no Apple Developer membership and no App Store.
 * Android has done it for years. It costs nothing and it is the whole promise
 * of the product — the customer stops checking the page, because the page
 * tells them.
 *
 * THE HOME SCREEN CATCH. On iPhone this only works once the page is installed
 * to the home screen: Safari in a tab cannot subscribe at all, and the call
 * fails rather than prompting. The customer's page therefore asks them to add
 * it first, and says so plainly, because a dead button is worse than no button.
 *
 * WHAT A NOTIFICATION MAY SAY. It lands on a lock screen, which is the least
 * private surface this product touches — visible to whoever picks the phone up
 * off the kitchen table. So it carries the trade's name and the stage, and
 * nothing else. Never the address, never the job reference, never the
 * customer's name, and never a note (which is free text and could say
 * anything). Anyone who wants the detail opens the link, where the code is the
 * credential.
 *
 * And the rule that governs every other surface governs this one: it states
 * what has happened. "Has set off" is a fact. "Arriving in 20 minutes" is a
 * promise nobody can keep, and a push notification is the very worst place to
 * make one.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
// Apple and Mozilla both want a contact on the VAPID claim so they can reach
// whoever is sending, if something goes wrong.
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@mytradestatus.app'

/** Nothing is sent, and no button is shown, until both keys exist. */
export const pushConfigured = () => Boolean(PUBLIC_KEY && PRIVATE_KEY)

let ready = false
function configure() {
  if (ready || !pushConfigured()) return pushConfigured()
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)
  ready = true
  return true
}

/**
 * What the customer is told, per stage.
 *
 * Booked in is absent on purpose: they are reading the page at the moment it
 * is created, so a notification saying the thing they are looking at is noise.
 * Paused says only that it is paused — the reason is a free-text note and free
 * text does not go on a lock screen.
 */
const LINES = {
  ON_MY_WAY: { title: 'On the way', body: 'has set off and is heading to you.' },
  ON_SITE: { title: 'Arrived', body: 'is with you and work is under way.' },
  PAUSED: { title: 'Work paused', body: 'has put the job on hold — open the page for the reason.' },
  DONE: { title: 'Job done', body: 'has finished and tidied up.' },
}

/**
 * Tell every device watching this job that it has moved.
 *
 * Never throws, and never awaited by anything the trade is waiting on: a stage
 * change must land whether or not a push service in California is having a
 * bad afternoon. A dead subscription is deleted rather than retried forever.
 *
 * @returns {Promise<{sent: number, dropped: number}>}
 */
export async function notifyStage(tracker, stage) {
  const line = LINES[stage]
  if (!line || !configure()) return { sent: 0, dropped: 0 }

  let subs = []
  try {
    subs = await prisma.pushSubscription.findMany({ where: { tradeStatusId: tracker.id } })
  } catch (error) {
    // Most likely the table does not exist yet, because `prisma db push` has
    // not been run since this feature landed. That must not break a stage
    // change, which is the thing the trade actually pressed.
    console.error('push: could not read subscriptions:', error?.code || error?.message)
    return { sent: 0, dropped: 0 }
  }
  if (subs.length === 0) return { sent: 0, dropped: 0 }

  const payload = JSON.stringify({
    title: `${TRADE_NAME} — ${line.title}`,
    body: `${TRADE_NAME} ${line.body}`,
    stage,
    code: tracker.code,
    tag: `job-${tracker.code}`,
  })

  let sent = 0
  const dead = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60, urgency: 'high' },
        )
        sent += 1
      } catch (error) {
        // 404 and 410 are the push service saying this browser threw the
        // subscription away — uninstalled, cleared, or permission revoked.
        // That is not an error to log every time; it is a row to delete.
        if (error?.statusCode === 404 || error?.statusCode === 410) dead.push(sub.id)
        else console.error('push: send failed', error?.statusCode, sub.id)
      }
    }),
  )

  try {
    if (dead.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } })
    if (sent) {
      await prisma.pushSubscription.updateMany({
        where: { tradeStatusId: tracker.id, id: { notIn: dead } },
        data: { lastSentAt: new Date() },
      })
    }
  } catch (error) {
    console.error('push: bookkeeping failed:', error?.code || error?.message)
  }

  return { sent, dropped: dead.length }
}

/** For the operator console: how many devices are watching a job. */
export async function subscriberCount(tradeStatusId) {
  try {
    return await prisma.pushSubscription.count({ where: { tradeStatusId } })
  } catch {
    return 0
  }
}
