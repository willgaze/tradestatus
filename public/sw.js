/* TurnUp — the worker that puts "they have set off" on a lock screen.
 *
 * Registered only from a customer's tracking page. It exists for one job:
 * receive a push and show it. It deliberately does NOT cache anything.
 *
 * Why no caching: this worker's scope is the whole origin, and the origin
 * includes /dashboard — the trade's own side, behind a password, listing every
 * customer's name and address. A caching worker there is a copy of that list
 * sitting in a browser store. Offline support is worth having and will come
 * back, but it will come back scoped and deliberate, not as a side effect of
 * wanting notifications.
 */

const VERSION = 'mts-push-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  // A push with no readable payload still means something happened, so it is
  // worth showing rather than swallowing — some services send an empty wake-up.
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }

  const title = data.title || 'Your job has moved'
  const body = data.body || 'Open to see where your job is.'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // One tag per job, so four stage changes in a morning replace each other
      // rather than stacking four notifications for the same job.
      tag: data.tag || 'my-trade-status',
      renotify: true,
      data: { code: data.code || null },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const code = event.notification.data?.code
  const url = code ? `/t/${code}` : '/'

  // Focus the tab that is already open on this job rather than opening a
  // second one — a customer who has been checking all morning should not end
  // up with six copies of their own job.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})

// The browser can retire a subscription on its own (a key rotation, a long
// idle period). It hands the new one over here; the page re-registers it the
// next time it is opened, which is the simplest thing that is correct.
self.addEventListener('pushsubscriptionchange', () => {
  // Deliberately empty. Re-subscribing from here needs the VAPID key, which
  // means shipping it into the worker and keeping it in step with the server —
  // for a page the customer opens every time the job moves, waiting for the
  // next visit is simpler and cannot drift.
})

self.addEventListener('message', (event) => {
  if (event.data === 'version') event.source?.postMessage(VERSION)
})
