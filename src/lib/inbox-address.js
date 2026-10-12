/**
 * The address a household forwards their delivery emails to, and how to read
 * one back off an inbound message.
 *
 * Kept pure and on its own because the shape of that address is decided by
 * whichever inbound mail provider is in front of it, and that choice is not
 * settled. Two shapes have to work:
 *
 *   q7rmt4ndkw82lp@in.getturnup.com          an MX record on our own subdomain
 *   abc123+q7rmt4ndkw82lp@inbound.example    a provider-hosted address, where
 *                                            the key rides in the plus part
 *
 * The second one matters more than it looks. It needs no DNS at all, which is
 * the difference between forwarding working this week and waiting on a mail
 * provider's domain verification — and the provider can then be changed
 * without touching a customer's mail rule twice.
 */

/** The forwarding host. Configuration, so a second trade is a variable. */
export const INBOUND_HOST = process.env.INBOUND_EMAIL_HOST || 'in.getturnup.com'

/** The forwarding address for a place: the half that may be given out. */
export const inboxAddress = (inboxKey, host = INBOUND_HOST) => `${inboxKey}@${host}`

// An inbox key as generateCode(14) makes it, lowercased. The alphabet is the
// unambiguous one — no 0/O and no 1/I/L — which is why this is a useful test
// and not just a length check: a stranger's own email address almost never
// fits it. It stays in step with generateCode() in src/lib/trade-status.js,
// and scripts/check-inbox-address.mjs is where that is noticed.
const KEY = /^[a-hjkmnp-z2-9]{10,24}$/

/**
 * Which of our inboxes an inbound message was addressed to, or null.
 *
 * Matching the host is tried first because it is the certain answer. Falling
 * back to "the local part looks like a key" is what lets a provider-hosted
 * address work, and it is safe: an unknown key finds no place and the message
 * is dropped. The key is a secret, not an assertion about who sent it.
 */
export function inboxKeyFrom(to, host = INBOUND_HOST) {
  const s = String(to || '')
  const found = [...s.matchAll(/([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+)/g)]
  // A plus part is the key when there is one; the whole local part otherwise.
  const keyOf = (local) => {
    const plus = local.lastIndexOf('+')
    return (plus >= 0 ? local.slice(plus + 1) : local).toLowerCase()
  }

  const bare = host.replace(/^[^.]+\./, '')
  for (const [, local, domain] of found) {
    const d = domain.toLowerCase()
    if (d === host.toLowerCase() || d === bare || d.endsWith(`.${bare}`)) return keyOf(local)
  }
  for (const [, local] of found) {
    const key = keyOf(local)
    if (KEY.test(key)) return key
  }
  return null
}
