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
export const VERSION = '1.18.0'
export const BUILD_DATE = '2026-10-09'

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
export const THEME_INDEX = 12

export const theme = () => THEMES[THEME_INDEX % THEMES.length]

/**
 * What changed, newest first. Kept short on purpose: this is read on a phone
 * by the person who asked for it, not by a release manager.
 */
export const CHANGELOG = [
  { version: '1.18.0', date: '2026-10-09', notes: [
    'Pricing turned round: the card and the job are free with no cap. A trade who is a month in and past a number of jobs pays a small activation charge and a small yearly one, card details on file. Everything else is a bundle (Get paid, Look the part, Run the day) or a tier, paid monthly or weekly.',
    'Get paid takes the payment on the job, with a small margin on top of the processor. Referrals earn free jobs before activation, the Dropbox way.',
    'Five pricing decisions open on the page: the jobs threshold, the activation charge, the yearly fee, the payments margin, the referral reward. The calculator stacks all four revenue lines.',
  ] },
  { version: '1.17.1', date: '2026-10-09', notes: [
    'Two more decisions landed: Home is free to five cards a month, and Trade is five pounds a month. The tiles, the chips and the calculator follow.',
  ] },
  { version: '1.17.0', date: '2026-10-09', notes: [
    'The plan grew up: fifteen sections, a wallet-card page, a timeline read from this changelog, and an ask written for one person who builds apps.',
    'Pricing has a shape: Home is free forever up to a number of cards a month, Trade and Crew pay for the trade features, Partners is quoted. The cap and the Trade price are decisions on the page, and nothing is charged yet.',
    'A share link: /plan/<code> opens the plan read-only with no sign-in. Copy it from the rail. Set PLAN_SHARE_CODE to off to stop it.',
    'The financials chart drew no bars and the big figures overflowed their tiles. Fixed.',
  ] },
  { version: '1.16.1', date: '2026-10-09', notes: [
    'Four decisions landed on the plan: free while customer zero, a new Ltd will own it, RIBA is the first template after ServiceM8, and raising money stays undecided.',
  ] },
  { version: '1.16.0', date: '2026-10-09', notes: [
    'The business plan lives here now, at /plan, behind the same sign-in as Jobs. Twelve sections, arrow keys to move, P to present. Every figure says whether it is a fact with a source, a working estimate, or a decision only the owner can make.',
    'Pricing, the owning company and whether to raise money are open questions on the page, not answers.',
  ] },
  { version: '1.15.4', date: '2026-10-09', notes: [
    'Ready for Apple. The signing code wanted a .p12 the library cannot read, and the pass carried no icon, which Wallet rejects without a word. Both fixed, and tested end to end with a stand-in certificate chain.',
    'bash scripts/apple-wallet.sh — two commands turn Apple\'s certificate into the six settings, no Keychain Access.',
    'Add to Apple Wallet appears on the customer page the moment the deployment can sign a pass, and only on an Apple device.',
  ] },
  { version: '1.15.3', date: '2026-10-09', notes: [
    'The CarPlay and Android Auto frames are photographs from the driver\u2019s seat now, with the app on the real screen \u2014 the UI pressed onto the glass in its perspective, still crisp text',
  ] },
  { version: '1.15.2', date: '2026-10-09', notes: [
    'CarPlay in the van and Android Auto in the car, drawn from the driver\u2019s seat: the map, Navigate to the address, the four stage buttons',
    'The TurnUp mark on the dashboard goes to the homepage, and the homepage\u2019s Sign in comes back',
    'ServiceM8 needs one setting in Vercel now: the webhook secret is derived and new tables are created on deploy',
  ] },
  { version: '1.15.1', date: '2026-10-09', notes: [
    'Move my sign-in: the address you are signed in on vouches for you on the new one \u2014 no password, 90 seconds, this browser only',
    'The sign-in page says plainly that Face ID is per address, and points at the move',
    'CarPlay and Android Auto drawn on a car\u2019s screen in a dash, not a phone',
    'ServiceM8: waits and retries while the account is being switched on',
  ] },
  { version: '1.15.0', date: '2026-10-09', notes: [
    'ServiceM8 connector: add a job by its ServiceM8 number and the card follows the job \u2014 check in is On site, complete is Job done, check out early is Paused',
    'Robust by design: a webhook is only a doorbell; every event is checked against the job itself, every sync is idempotent, and a customer opening their page pulls the truth too',
    'A ServiceM8 panel on the dashboard: connected, listening, and what it did lately',
    'One command connects it: scripts/connect-servicem8.sh',
    'CarPlay on the roadmap, with its frame',
  ] },
  { version: '1.14.0', date: '2026-10-08', notes: [
    'The homepage tells both sides: pick \u201cI\u2019m the customer\u201d or \u201cI do the work\u201d and walk through that side in eight frames',
    'Either end, any job \u2014 the role swap is on the page, badged Next so nobody mistakes it for live',
    'Everything it does today, as one list that reads from the same file as the in-app roadmap',
    'Where it is going: six drawn frames, every one badged Next',
    'Twenty-six App Store-sized frames in all, each a real screen or an honest drawing \u2014 including a record of your home, and the step from tracker to the job itself',
  ] },
  { version: '1.13.4', date: '2026-10-08', notes: [
    'The wallet card on the homepage is pulled out of a stack in real 3D \u2014 the flat version stays in the dashboard',
    'Six App Store-style frames tell the story: sent by text, four words, will someone be in, find the door, your five buttons, in their wallet',
    'Every frame is rendered from the real screens, in a drawn phone with a status bar, from /preview/posters',
  ] },
  { version: '1.13.3', date: '2026-10-08', notes: [
    'The homepage finally shows the thing: the customer\u2019s page and the wallet card, before any words',
    '\u201cHow it goes\u201d is pictures now \u2014 your job card, their page changing across the day, and a paused job',
    'The wallet card is one drawing shared by the homepage and the dashboard, so it cannot drift from the real pass',
  ] },
  { version: '1.13.2', date: '2026-10-02', notes: [
    'Van lookup now uses the DVSA MOT history record \u2014 make, model AND colour from the plate',
    'DVLA closed new registrations; it stays as the fallback for anyone who already has a key',
    'The profile page says exactly which key to get, where, and that it must be used within 90 days',
  ] },
  { version: '1.13.0', date: '2026-10-01', notes: [
    'It is called TurnUp now \u2014 renamed everywhere a person reads it',
    'A real homepage: what it is, what it will never do, and a working example to tap',
    'Trades can ask to be told when there is room; the list is on your dashboard',
    'The homepage is the only page search engines may see \u2014 every tracking link stays hidden',
  ] },
  { version: '1.12.0', date: '2026-10-01', notes: [
    'The jobs list is a day\u2019s run now \u2014 what you are on, then what is next, finished at the bottom',
    'A job shows who, where and the stage buttons; tap the row for the link, hours, photos and note',
    'New job is a button, not six empty boxes above the work',
    'Dashboard went from nine screens to under four',
  ] },
  { version: '1.11.0', date: '2026-10-01', notes: [
    'A job that is only booked now says the day on the card, not two taps down',
    'Agreed hours replace it once there are any \u2014 never both, the day is implied',
    'One command turns push notifications on: bash scripts/enable-push.sh',
  ] },
  { version: '1.10.0', date: '2026-09-30', notes: [
    'The page is a quarter shorter \u2014 less to scroll past before the thing that matters',
    'Tap any heading to open it; closed, each row says the one thing worth knowing',
    'Removed the notifications row until the keys are in, rather than open onto nothing',
    'The version line, the wordmark and the small print are now one line, not three',
  ] },
  { version: '1.9.0', date: '2026-09-30', notes: [
    'A window is now something you agree, not something you announce',
    'They can say "that suits" or ask for different hours, and say why \u2014 either end can start it',
    'Only an agreed window is stated as fact, or goes in a calendar as a real block',
    'What they ask for goes to you, never onto a page that can be forwarded',
  ] },
  { version: '1.8.0', date: '2026-09-30', notes: [
    'Drop a pin with one tap instead of pasting a Maps link \u2014 from either end',
    'You can drop it yourself standing at the door on the first visit, so the next one is easy',
    'Navigate now gives turn-by-turn to the exact spot, not a map centred near it',
    'If the phone is only sure to within a hundred metres it says so, rather than sending a van four doors down',
  ] },
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
