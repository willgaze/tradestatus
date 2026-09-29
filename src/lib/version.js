/**
 * What build this is, and what it looks like.
 *
 * A version number on the page so a change is visible without diffing, and a
 * theme that moves with it so a change is visible without reading.
 *
 * THE THEME IS CURATED, NOT RANDOM. "A colour not used before" generated on
 * the fly produces mud and unreadable text within a week. Every entry below is
 * a deliberate pair: a page background and an accent, checked for contrast
 * against white text on the accent and dark text on the background. A nightly
 * build advances the index; it does not invent a colour.
 *
 * Adding one is welcome. Inventing one at runtime is not.
 */
export const VERSION = '1.3.0'
export const BUILD_DATE = '2026-09-29'

export const THEMES = [
  { id: 'harbour',  name: 'Harbour',   bg: '#f4f7fb', accent: '#255a95', deep: '#122a46' },
  { id: 'moss',     name: 'Moss',      bg: '#f3f8f4', accent: '#2c6e49', deep: '#14301f' },
  { id: 'slate',    name: 'Slate',     bg: '#f5f6f8', accent: '#44506b', deep: '#1d2333' },
  { id: 'clay',     name: 'Clay',      bg: '#faf6f2', accent: '#9a4a24', deep: '#3d1d0e' },
  { id: 'indigo',   name: 'Indigo',    bg: '#f5f5fc', accent: '#463a94', deep: '#1f1950' },
  { id: 'teal',     name: 'Teal',      bg: '#f2f9f9', accent: '#1f6f72', deep: '#0d3132' },
  { id: 'plum',     name: 'Plum',      bg: '#f9f4f8', accent: '#7a2f5e', deep: '#37132a' },
  { id: 'ochre',    name: 'Ochre',     bg: '#fbf8f0', accent: '#8a6414', deep: '#3a2a06' },
]

// Which one this build wears. The nightly job bumps it, so a glance at the
// page says whether last night's build actually landed.
export const THEME_INDEX = 0

export const theme = () => THEMES[THEME_INDEX % THEMES.length]

/**
 * What changed, newest first. Kept short on purpose: this is read on a phone
 * by the person who asked for it, not by a release manager.
 */
export const CHANGELOG = [
  { version: '1.3.0', date: '2026-09-29', notes: [
    'Wallet card shown three ways: in the stack, opened, on its own',
    'The whole roadmap in the app, with a way to vote on what gets built',
    'Dashboard restyled — no hard-coded greys, dark mode throughout',
    'Version number and theme on every page',
  ] },
  { version: '1.2.0', date: '2026-09-29', notes: [
    'Will someone be in? — four taps back from the customer',
    'Who is coming and what they drive, set up once',
    'Arrival window you can narrow through the day',
    'Where they are in the day: "you are 2nd today"',
  ] },
  { version: '1.1.0', date: '2026-09-28', notes: [
    'Face ID and Touch ID sign-in',
    'Apple Wallet pass built, waiting on a certificate',
    'Put it in my calendar',
    'The 2015 mark restored',
  ] },
  { version: '1.0.0', date: '2026-09-28', notes: [
    'One link per job, live',
  ] },
]
