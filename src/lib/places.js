/**
 * Turning what a customer typed into something that opens a map.
 *
 * No API keys here, on purpose. what3words.com/x.y.z opens the what3words app
 * when it is installed and the website when it is not; Google's URL scheme
 * does the same for Maps. Both resolve the location themselves, so nothing
 * here needs to know where a square actually is — which also means nothing
 * here can get it wrong.
 */

// Three words, dots between. Letters in any script — what3words exists in
// fifty languages — and never digits. Leading slashes are how people type it
// and are stripped, not rejected.
const W3W = /^\p{L}+\.\p{L}+\.\p{L}+$/u

export function normaliseW3w(raw) {
  const s = String(raw || '').trim().replace(/^\/+/, '').toLowerCase()
  return W3W.test(s) ? s : null
}

export const w3wUrl = (words) => (words ? `https://what3words.com/${words}` : null)

/**
 * what3words' own map, for somebody who does not know their three words yet.
 *
 * A plain link with nothing appended, on purpose. Their site has a locate
 * button and their app knows where the phone is, so it can answer the question
 * on its own — and a URL format invented here that silently stops working is
 * worse than two taps that always do.
 *
 * Turning a GPS fix into three words needs their API and a paid key; see
 * src/app/api/w3w/route.js. Until there is one this link is the honest route,
 * and the pin beside it is the better one anyway.
 */
export const W3W_SITE = 'https://what3words.com/'

// A pasted Google Maps link. Only Google's own hosts, so the field cannot be
// turned into a link to anywhere else on a page a customer trusts.
const MAPS_HOSTS = /^(www\.)?(google\.[a-z.]+|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl)$/i

export function normaliseMapPin(raw) {
  try {
    const u = new URL(String(raw || '').trim())
    if (u.protocol !== 'https:' || !MAPS_HOSTS.test(u.hostname)) return null
    return u.toString().slice(0, 500)
  } catch { return null }
}

// Anything that is not an https image link is dropped rather than stored.
export function normalisePhotoUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim())
    return u.protocol === 'https:' ? u.toString().slice(0, 500) : null
  } catch { return null }
}

/* --- A pin dropped from the phone's own GPS ------------------------------ */

// Six decimal places is about 10cm, which is far past what any phone knows.
// It is used because it is lossless for our purposes and costs nothing, not
// because the fix is that good — see accuracy handling in DropPin.
const dp = (n) => Number(n).toFixed(6)

/**
 * A coordinate turned into a link.
 *
 * Deliberately a Google Maps URL rather than two new columns. `mapPin` already
 * exists and already holds a Google link, so a pin dropped from GPS needs no
 * migration and works the moment it deploys — and `normaliseMapPin` below
 * checks it on the way in exactly as it checks a pasted one.
 */
export function coordsPinUrl(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return `https://www.google.com/maps/search/?api=1&query=${dp(lat)},${dp(lng)}`
}

/** The coordinates back out of one, or null if it is a pasted share link. */
export function pinCoords(mapPin) {
  try {
    const u = new URL(String(mapPin || ''))
    const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(u.searchParams.get('query') || '')
    if (!m) return null
    const lat = Number(m[1])
    const lng = Number(m[2])
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
  } catch {
    return null
  }
}

const q = (s) => encodeURIComponent(String(s || '').trim())

/** Where it is, on a map. */
export const mapsSearchUrl = (address) =>
  address ? `https://www.google.com/maps/search/?api=1&query=${q(address)}` : null

/** How to get there, from wherever the van is now. A pin beats an address. */
export function mapsDirectionsUrl({ mapPin, address }) {
  // A dropped pin carries its coordinates, so it can become real turn-by-turn
  // directions to the exact spot rather than a map centred near it. A pasted
  // share link cannot be taken apart safely, so it is opened as it was given.
  const at = pinCoords(mapPin)
  if (at) return `https://www.google.com/maps/dir/?api=1&destination=${dp(at.lat)},${dp(at.lng)}&travelmode=driving`
  if (mapPin) return mapPin
  return address ? `https://www.google.com/maps/dir/?api=1&destination=${q(address)}&travelmode=driving` : null
}
