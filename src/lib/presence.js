/**
 * "Will someone be in?"
 *
 * Four answers, because a free-text box gets left empty and a yes/no cannot
 * say "I'm at the bottom of the garden". These are the four things people
 * actually are, and each one changes what the person coming should do.
 */
// `key` names the drawing as well as the answer — PresenceIcon in
// src/components/icons.jsx. No emoji here for the same reason there are none
// on a stage.
export const PRESENCE = {
  IN: {
    key: 'IN', label: "Yes, I'm in", short: 'In',
    forTrade: 'Someone is in', tone: 'done',
  },
  BACK_SOON: {
    key: 'BACK_SOON', label: 'Back shortly', short: 'Back soon',
    forTrade: 'Out briefly — back shortly', tone: 'onway',
  },
  SOMEONE_ELSE: {
    key: 'SOMEONE_ELSE', label: 'Someone else will be', short: 'Someone else',
    forTrade: 'Somebody else will be there', tone: 'onsite',
  },
  OUT: {
    key: 'OUT', label: "No, I'm out", short: 'Out',
    forTrade: 'NOBODY IN', tone: 'paused',
  },
}

export const PRESENCE_ORDER = ['IN', 'BACK_SOON', 'SOMEONE_ELSE', 'OUT']

export const isValidPresence = (p) => Object.prototype.hasOwnProperty.call(PRESENCE, p)
export const presenceOf = (p) => PRESENCE[p] || null

/**
 * An answer given on Tuesday says nothing about Thursday. After six hours it
 * is history, not information, and showing it as current would be worse than
 * showing nothing — the trade would drive out on it.
 */
export const PRESENCE_FRESH_HOURS = 6

export function presenceIsFresh(at) {
  if (!at) return false
  return Date.now() - new Date(at).getTime() < PRESENCE_FRESH_HOURS * 3600 * 1000
}

export function presenceAgeLabel(at) {
  if (!at) return null
  const mins = Math.floor((Date.now() - new Date(at).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return `${Math.floor(hrs / 24)} day${hrs < 48 ? '' : 's'} ago`
}
