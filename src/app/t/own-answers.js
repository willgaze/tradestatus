'use client'

/**
 * What THIS device told the trade, remembered on THIS device.
 *
 * The server stopped handing the customer's own answers back out (see
 * `publicShape`): a tracking link gets forwarded, and anything the server
 * returns is readable by everyone it reaches. "Nobody is in", a photo of the
 * front door and "the gate sticks, park on the verge" are a burglary kit when
 * they travel together.
 *
 * But the customer still needs their own form to remember what they typed —
 * otherwise adding one detail means retyping all of them. So the answers live
 * in this browser's own storage instead of coming back down the wire. The
 * phone that sent them prefills; a forwarded link on anyone else's phone gets
 * a blank form and learns nothing.
 *
 * That is exactly the right boundary, and it costs nothing: the device that
 * answered is the device that is allowed to remember.
 *
 * Storage can throw — private browsing, a locked-down phone, storage full —
 * and a customer who cannot read back their own note must still be able to
 * send a new one. So every call here fails to an empty object rather than
 * upward.
 */

const key = (code) => `mts:own:${code}`

/** @returns {object} what this device sent, or {} if nothing or unreadable. */
export function readOwn(code) {
  if (typeof window === 'undefined' || !code) return {}
  try {
    return JSON.parse(window.localStorage.getItem(key(code))) || {}
  } catch {
    return {}
  }
}

/** Merge in what was just sent. Returns the new value so callers can set state. */
export function writeOwn(code, patch) {
  const next = { ...readOwn(code), ...patch, at: Date.now() }
  if (typeof window === 'undefined' || !code) return next
  try {
    window.localStorage.setItem(key(code), JSON.stringify(next))
  } catch {
    // Nothing to do and nothing worth saying: the send itself still worked.
  }
  return next
}

/** Used when a job finishes, so a shared phone does not keep the details. */
export function forgetOwn(code) {
  if (typeof window === 'undefined' || !code) return
  try {
    window.localStorage.removeItem(key(code))
  } catch {
    /* ignore */
  }
}
