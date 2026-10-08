/**
 * The six App Store-style frames: copy and which screen each one shows.
 *
 * Plain data, in its own module, because the homepage (a server component)
 * and /preview/posters (a client component) both read it, and a named export
 * from a 'use client' file arrives on the server as a reference, not an array.
 */
export const POSTERS = [
  { n: 1, tint: '#5856d6', deep: '#2b2a7a',
    head: 'Sent by text.\nOpened in one tap.', sub: 'No app to download. Nothing to log in to. One link per job.',
    screen: '/home/customer-on-my-way.webp', alt: 'The customer page: Hello Sarah, On my way' },
  { n: 2, tint: '#007aff', deep: '#0a3f82',
    head: 'Four words.\nNever a made-up time.', sub: 'Booked in · On my way · On site · Job done. “Set off at 08:00” is a record, not a promise.',
    screen: '/home/customer-on-site.webp', alt: 'The customer page: On site' },
  { n: 3, tint: '#34c759', deep: '#14612c',
    head: 'They answer what\nyou’d ring about.', sub: 'Will someone be in? Two seconds for them. A wasted visit saved for you.',
    screen: '/home/customer-presence.webp', alt: 'The customer page with “Will someone be in?” open' },
  { n: 4, tint: '#ff9500', deep: '#8a4b00',
    head: 'Find the door\nfirst time.', sub: 'Which door, the dog, a what3words square, a dropped pin. Kept between you.',
    screen: '/home/customer-find-you.webp', alt: 'The customer page with “Help them find you” open' },
  { n: 5, tint: '#1f3b57', deep: '#0c1a28',
    head: 'Your side is\nfive buttons.', sub: 'Tap the stage as the day goes. One-handed, next to the van. That is all you ever do.',
    screen: '/home/dashboard.webp', alt: 'The job card with its five stage buttons' },
  { n: 6, tint: '#5856d6', deep: '#15143a',
    head: 'In their wallet.', sub: 'The same job as a card, updating on the lock screen.',
    wallet: true, alt: 'The job as a wallet card, lifted out of a stack of other cards' },
]
