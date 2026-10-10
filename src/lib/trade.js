/**
 * Who the customer is being told about. One env var per fact, so fitting this
 * for a different trade is configuration rather than a code change — and so no
 * other firm's name is ever hardcoded into this product.
 */
export const TRADE_NAME = process.env.NEXT_PUBLIC_TRADE_NAME || 'Your tradesperson'
export const TRADE_PHONE = process.env.NEXT_PUBLIC_TRADE_PHONE || ''
export const TRADE_PHONE_TEL =
  process.env.NEXT_PUBLIC_TRADE_PHONE_TEL || TRADE_PHONE.replace(/\D/g, '')

/**
 * The time zone every date on the customer's page is formatted in.
 *
 * Fixed rather than taken from the browser, and that is not a nicety. The page
 * renders once on the server and again on the phone, and the two must produce
 * identical text or React tears the page down mid-hydration. See
 * src/lib/when.js, which is the only place dates are formatted.
 */
export const TRADE_TIMEZONE = process.env.NEXT_PUBLIC_TRADE_TIMEZONE || 'Europe/London'

// The address the product lives at. Used to offer a move when someone is
// signed in on an old one (passkeys are per host).
export const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || 'www.getturnup.com'
