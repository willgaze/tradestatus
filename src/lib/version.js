/**
 * What build this is, and what it looks like.
 *
 * A version number on the page so a change is visible without diffing, and a
 * theme that moves with it so a change is visible without reading.
 *
 * Each theme is a light page background, a dark page background and an
 * accent. The dark one is NOT derived from the light one at runtime — a
 * darkened pastel is grey mud, and the heading on it was invisible once.
 *
 * THE THEME IS CURATED, NOT RANDOM. "A colour not used before" generated on
 * the fly produces mud and unreadable text within a week. Every entry below is
 * a deliberate pair: a page background and an accent, checked for contrast
 * against white text on the accent and dark text on the background. A nightly
 * build advances the index; it does not invent a colour.
 *
 * Adding one is welcome. Inventing one at runtime is not.
 */
export const VERSION = '1.7.0'
export const BUILD_DATE = '2026-09-30'

export const THEMES = [
  { id: 'harbour',  name: 'Harbour',   bg: '#f4f7fb', bgDark: '#0b1119', accent: '#255a95', deep: '#122a46' },
  { id: 'moss',     name: 'Moss',      bg: '#f3f8f4', bgDark: '#0a130e', accent: '#2c6e49', deep: '#14301f' },
  { id: 'slate',    name: 'Slate',     bg: '#f5f6f8', bgDark: '#0e1016', accent: '#44506b', deep: '#1d2333' },
  { id: 'clay',     name: 'Clay',      bg: '#faf6f2', bgDark: '#150e0a', accent: '#9a4a24', deep: '#3d1d0e' },
  { id: 'indigo',   name: 'Indigo',    bg: '#f5f5fc', bgDark: '#0e0d1a', accent: '#463a94', deep: '#1f1950' },
  { id: 'teal',     name: 'Teal',      bg: '#f2f9f9', bgDark: '#08181a', accent: '#1f6f72', deep: '#0d3132' },
  { id: 'plum',     name: 'Plum',      bg: '#f9f4f8', bgDark: '#160b14', accent: '#7a2f5e', deep: '#37132a' },
  { id: 'ochre',    name: 'Ochre',     bg: '#fbf8f0', bgDark: '#151006', accent: '#8a6414', deep: '#3a2a06' },
]

// Which one this build wears. The nightly job bumps it, so a glance at the
// page says whether last night's build actually landed.
//
// A THEME OWNS THE CHROME, NOT THE STAGES. It sets the page background and the
// accent on the landing page, the sign-in and the dashboard furniture. It does
// NOT set the colour of Booked in, On my way, On site, Paused or Job done —
// those are fixed in globals.css, because they mean something, and a meaning
// that changes colour every night is not a meaning. See the stage tint block
// in src/app/globals.css.
export const THEME_INDEX = 3

export const theme = () => THEMES[THEME_INDEX % THEMES.length]

/**
 * What changed, newest first. Kept short on purpose: this is read on a phone
 * by the person who asked for it, not by a release manager.
 */
export const CHANGELOG = [
  { version: '1.7.0', date: '2026-09-30', notes: [
    'Your customer\u2019s own answers are no longer on a page that can be forwarded',
    'A forwarded link used to carry the address, photos of the house and door, which door to use, the dog, the access notes, \u201cnobody is in\u201d and the time window \u2014 all at once',
    'Their own phone still remembers what they typed. Anyone else\u2019s gets a blank form.',
    'You still see every word of it on the dashboard, behind your password.',
  ] },
  { version: '1.6.0', date: '2026-09-30', notes: [
    'Your phone buzzes when they set off, arrive and finish — no app, no App Store',
    'On iPhone it needs the page added to the home screen first, and the page says so rather than giving you a button that does nothing',
    'The notification says who and what stage, and nothing else. Your address does not go on a lock screen.',
    'Needs one migration and a key pair before it works — run scripts/setup.sh',
  ] },
  { version: '1.5.0', date: '2026-09-29', notes: [
    'Dashboard brought onto the same iOS material as the customer page — glass cards, capsule buttons, proper fields',
    'what3words and a dropped pin open the map in one tap, both sides. A Navigate button on every job',
    'Photos of the house and the door, set on the first visit so the next one is easy. Your logo on the page',
    'DVLA lookup now says exactly what it needs when the key is missing, with the link to get it',
  ] },
  { version: '1.4.0', date: '2026-09-29', notes: [
    'The whole app redrawn to the current iOS look — translucent cards, the system font, proper dark mode',
    'Every emoji replaced with a drawn icon. They rendered in whatever style the phone shipped and made a finished page look unfinished',
    'Each stage now has its own colour and keeps it: blue booked, indigo on the way, amber paused, green done',
    'Fixed: dates were formatted differently by the server and the phone, which tore the page apart as it loaded',
  ] },
  { version: '1.3.3', date: '2026-09-29', notes: [
    'Customer page pruned: status up top, then rows that open on tap. The call button never hides.',
  ] },
  { version: '1.3.2', date: '2026-09-29', notes: [
    'WhatsApp the customer their link in one tap, beside the text button',
  ] },
  { version: '1.3.1', date: '2026-09-29', notes: [
    'Dark mode: the page background was pinned to the light colour, so the heading was invisible. Each theme now has a dark background of its own.',
  ] },
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
