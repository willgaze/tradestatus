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

const q = (s) => encodeURIComponent(String(s || '').trim())

/** Where it is, on a map. */
export const mapsSearchUrl = (address) =>
  address ? `https://www.google.com/maps/search/?api=1&query=${q(address)}` : null

/** How to get there, from wherever the van is now. A pin beats an address. */
export function mapsDirectionsUrl({ mapPin, address }) {
  if (mapPin) return mapPin
  return address ? `https://www.google.com/maps/dir/?api=1&destination=${q(address)}&travelmode=driving` : null
}
