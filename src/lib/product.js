/**
 * The product's own name. This is Turnup, and the name lives here and nowhere
 * else in the source, so a rename is one line.
 *
 * Not to be confused with the trade's identity (src/lib/trade.js), which comes
 * from environment variables: Turnup is the product, the trade is its customer.
 *
 * The repository, the Vercel project, the database and the Prisma models still
 * carry the old working title, My Trade Status / tradestatus. Those are
 * plumbing, they are not customer-facing, and renaming them buys nothing but a
 * migration. Only what a person reads changes.
 *
 * TM, not (R): the mark is applied for, not registered. Using (R) before the
 * IPO grants it is an offence, so the trade mark symbol is the only one that
 * may appear on a page until then.
 */
export const PRODUCT_NAME = 'Turnup'
export const PRODUCT_NAME_TM = 'Turnup™'
export const PRODUCT_TAGLINE = 'Live job tracking for trades'
