/**
 * One thing at a time.
 *
 * The dashboard used to show every feature at once: ten screens of panels,
 * each with its own buttons, before a single job had been sent. A good app
 * teaches itself in the order you need it, so this picks the ONE next thing
 * worth knowing, from what has actually happened: no jobs yet, a link nobody
 * has opened, no name on the card, nudges not switched on. Dismiss it and the
 * next one waits its turn.
 *
 * Pure: no React, no fetch, so it can be read without running anything. The
 * dashboard remembers dismissals in the browser; that is a per-phone
 * convenience, and losing it costs one more tap on Got it.
 */

export const TIPS = [
  {
    id: 'first-job',
    when: ({ jobs }) => jobs.length === 0,
    text: 'Tell the box about a job to get going: "New job for Mrs Whitfield, 4 Church Lane, Tuesday morning, cylinder swap". Or paste the booking email.',
  },
  {
    id: 'send-link',
    when: ({ jobs }) => jobs.some((j) => j.isActive !== false && j.stage !== 'DONE' && !(j.viewCount > 0)),
    text: 'A job here has a link nobody has opened yet. Open the job, then More, then Text or WhatsApp. That is the whole point.',
  },
  {
    id: 'who',
    when: ({ jobs, setup }) => jobs.length >= 1 && !setup?.engineerName,
    text: 'Customers like to know who is coming. Put your name and the van under Who to expect, once.',
    panel: 'profile',
  },
  {
    id: 'push',
    when: ({ jobs, setup }) => jobs.length >= 2 && setup && !setup.pushConfigured,
    text: 'Notifications are off until the keys are in. Five minutes, all on this phone, under Turn on notifications.',
    panel: 'push',
  },
  {
    id: 'nudge',
    when: ({ jobs, setup }) => jobs.length >= 2 && setup?.pushConfigured && (setup.devices ?? 0) === 0,
    text: 'Want this phone to buzz when a customer asks if you are still coming? Switch on Nudge me.',
    panel: 'nudges',
  },
  {
    id: 'passkey',
    when: ({ jobs, setup }) => jobs.length >= 3 && setup && (setup.passkeys ?? 0) === 0,
    text: 'Sign in with Face ID instead of a password. Set up this device under Signing in.',
    panel: 'passkeys',
  },
  {
    id: 'sm8',
    when: ({ jobs, setup }) => jobs.length >= 5 && setup && !setup.sm8Configured,
    text: 'Five jobs typed in by hand. Connect ServiceM8 and the card follows the job on its own.',
    panel: 'servicem8',
  },
]

/** The one tip to show now, or null. `dismissed` is a list of tip ids. */
export function nextTip(state, dismissed = []) {
  const jobs = Array.isArray(state?.jobs) ? state.jobs : []
  const setup = state?.setup || null
  for (const tip of TIPS) {
    if (dismissed.includes(tip.id)) continue
    try { if (tip.when({ jobs, setup })) return tip } catch { /* a tip never breaks the page */ }
  }
  return null
}

// "Mrs Hale".split(' ')[0] is "Mrs". Keep the title and the name together.
const TITLES = /^(mr|mrs|ms|miss|mx|dr|prof|rev|sir|lady|lord)\.?$/i
export function shortName(full) {
  if (!full) return 'them'
  const parts = String(full).trim().split(/\s+/)
  return TITLES.test(parts[0]) ? parts.slice(0, 2).join(' ') : parts[0]
}

/**
 * What you would most likely say to the box right now.
 *
 * The chips under the box are not a tour of features; they are the one or
 * two things the day is asking for at this moment. A customer waiting on an
 * answer outranks everything. Then the job you are moving. Then the time of
 * day: the run in the morning, what is left in the afternoon, tomorrow in
 * the evening. Then, if nothing is happening, the next thing to set up.
 *
 * Pure, and the caller passes `now` so the clock is the phone's: the trade
 * is where the phone is.
 */
export function suggestions({ jobs = [], setup = null, now = new Date() } = {}) {
  const out = []
  const add = (s) => { if (s && !out.includes(s) && out.length < 3) out.push(s) }
  const live = jobs.filter((j) => j.isActive !== false)
  const open = live.filter((j) => j.stage !== 'DONE')
  const hour = now.getHours()
  const sameDay = (d) => d && new Date(d).toDateString() === now.toDateString()
  const today = open.filter((j) => sameDay(j.scheduledFor) || sameDay(j.windowStart))

  if (live.length === 0) {
    add('New job for Mrs Whitfield, 4 Church Lane, Tuesday morning, cylinder swap')
    add('What can I ask you?')
    return out
  }

  // Someone is waiting on an answer.
  for (const j of open) {
    const who = shortName(j.customerName)
    if (j.askedAt && !j.askAnsweredAt) { add(`On my way to ${who}`); add(`30 minutes late for ${who}`) }
    if (j.windowState === 'PROPOSED' && j.windowBy === 'CUSTOMER') { add(`Agree ${who}'s hours`); add(`What did ${who} ask for?`) }
    if (j.missedAt && !['ON_SITE', 'PAUSED', 'DONE'].includes(j.stage)) add(`New hours for ${who}, 2 to 4`)
  }

  // The job you are moving.
  const moving = open.find((j) => j.stage === 'ON_MY_WAY')
  const there = open.find((j) => j.stage === 'ON_SITE')
  const paused = open.find((j) => j.stage === 'PAUSED')
  if (moving) add(`On site at ${shortName(moving.customerName)}`)
  if (there) { add(`Done at ${shortName(there.customerName)}`); add(`Paused at ${shortName(there.customerName)}, waiting on the part`) }
  if (paused) add(`Back on at ${shortName(paused.customerName)}`)

  // The time of day.
  const next = today.find((j) => j.stage === 'BOOKED') || open.find((j) => j.stage === 'BOOKED')
  if (hour < 12) {
    add(today.length ? "What's on today?" : "What's booked this week?")
    if (next && !moving && !there) add(`On my way to ${shortName(next.customerName)}`)
  } else if (hour < 17) {
    if (open.length) add("What's left today?")
    if (next && !moving && !there) add(`On my way to ${shortName(next.customerName)}`)
  } else {
    add("What's on tomorrow?")
  }

  // Did it land?
  const unopened = open.find((j) => !(j.viewCount > 0))
  if (unopened) add(`Has ${shortName(unopened.customerName)} opened the link?`)

  // Nothing happening: the next thing to set up.
  if (setup && setup.pushConfigured && (setup.devices ?? 0) === 0) add('How do I turn on nudges?')
  if (setup && !setup.engineerName) add('How do I add my name and van?')
  add("What's on today?")
  return out
}
