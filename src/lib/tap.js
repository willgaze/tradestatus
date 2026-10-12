/**
 * The facts a replayed tap carries, read once, trusted narrowly.
 *
 * deviceAt is the phone's clock at the tap. It is believed only if it is in
 * the last two days and not in the future, because a phone clock is a phone
 * clock. The fix is "validated" if it was taken within three minutes of the
 * tap and is tight enough to mean a place rather than a town. Nothing here
 * is public: the customer sees the time, never the place.
 */
export function readTap(body, now = new Date()) {
  const offline = Boolean(body?.offline)
  let deviceAt = body?.deviceAt ? new Date(body.deviceAt) : null
  if (!deviceAt || Number.isNaN(deviceAt.getTime()) || deviceAt > new Date(now.getTime() + 5 * 60_000) || deviceAt < new Date(now.getTime() - 48 * 3600_000)) deviceAt = null
  const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
  const lat = num(body?.lat), lng = num(body?.lng), accuracy = num(body?.accuracy)
  const fixAt = body?.fixAt ? new Date(body.fixAt) : null
  const hasFix = lat !== null && lng !== null
  const fixValidated = hasFix
    ? Boolean(deviceAt && fixAt && !Number.isNaN(fixAt.getTime()) && Math.abs(fixAt - deviceAt) <= 3 * 60_000 && (accuracy === null || accuracy <= 200))
    : null
  const tapId = typeof body?.tapId === 'string' && /^[\w-]{6,40}$/.test(body.tapId) ? body.tapId : null
  return { offline, deviceAt, lat: hasFix ? lat : null, lng: hasFix ? lng : null, accuracy: hasFix ? accuracy : null, fixValidated, tapId }
}

export const hhmmLondon = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })
