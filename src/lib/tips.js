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
