/**
 * Pricing: free for homes, always; paid for the features a trade needs.
 *
 * The shape is fixed by two decisions the owner made on 9 Oct 2026:
 *
 *   1. The person WAITING never pays and never has an account. The card is a
 *      link they open. Nothing on this page can ever charge them.
 *   2. The person SENDING is free up to a number of cards a month, forever.
 *      A family telling each other "on my way", a neighbour, a one-off job:
 *      that is the product spreading, and spreading is worth more than the
 *      pennies. Above the cap, or for the features only a trade needs, it is
 *      a paid plan.
 *
 * So the unit of value is the card, and the cap is the line between a home
 * and a business. Features sit above the line because a logo on the card, a
 * job-software connector and a team of vans are things a home never asks for.
 *
 * Every price below is PROPOSED. Nothing is charged today (customer zero is
 * free) and nothing here is wired to a payment provider. The cap and the
 * Trade price are open decisions on the plan; the figures are the defaults
 * the calculator uses until the owner picks.
 */

export const FREE_CARDS_PER_MONTH = 10

export const TIERS = [
  {
    key: 'home',
    name: 'Home',
    price: 0,
    per: 'forever',
    who: 'Homes, families, a one-off job',
    cards: `${FREE_CARDS_PER_MONTH} cards a month`,
    line: 'Always free. No bank card asked for.',
    tone: 'done',
  },
  {
    key: 'trade',
    name: 'Trade',
    price: 9,
    per: 'a month',
    who: 'One van',
    cards: 'Unlimited cards',
    line: 'Your name, your logo, your van on the card.',
    tone: 'onsite',
  },
  {
    key: 'crew',
    name: 'Crew',
    price: 29,
    per: 'a month',
    who: 'Up to five vans',
    cards: 'Unlimited cards',
    line: 'The card moves itself from your job software.',
    tone: 'onway',
  },
  {
    key: 'partners',
    name: 'Partners',
    price: null,
    per: 'quoted',
    who: 'Insurers, retrofit, big jobs',
    cards: 'Unlimited cards',
    line: 'Four firms, one card, one link for the householder.',
    tone: 'paused',
  },
]

/**
 * What each plan includes. `live` says whether the feature exists today,
 * read against src/lib/roadmap.js by hand on 9 Oct 2026: a tick in a column
 * is a promise, and a promise about something not built is marked as such.
 */
export const FEATURES = [
  { name: 'One link per job, four stages', home: true, trade: true, crew: true, partners: true, live: true },
  { name: 'Text or WhatsApp in one tap', home: true, trade: true, crew: true, partners: true, live: true },
  { name: 'Agree the window, do not announce it', home: true, trade: true, crew: true, partners: true, live: true },
  { name: 'Will someone be in?', home: true, trade: true, crew: true, partners: true, live: true },
  { name: 'Add to calendar', home: true, trade: true, crew: true, partners: true, live: true },
  { name: 'Phone buzzes when they set off', home: true, trade: true, crew: true, partners: true, live: false },
  { name: 'Your logo and photo on the card', home: false, trade: true, crew: true, partners: true, live: true },
  { name: 'Van from the number plate', home: false, trade: true, crew: true, partners: true, live: false },
  { name: 'The card in Apple and Google Wallet', home: false, trade: true, crew: true, partners: true, live: false },
  { name: 'Where they are in the day', home: false, trade: true, crew: true, partners: true, live: true },
  { name: 'ServiceM8 moves the card itself', home: false, trade: false, crew: true, partners: true, live: false },
  { name: 'Industry stage names (RIBA, building control)', home: false, trade: false, crew: true, partners: true, live: false },
  { name: 'Several vans, one dashboard', home: false, trade: false, crew: true, partners: true, live: false },
  { name: 'Several firms on one card', home: false, trade: false, crew: false, partners: true, live: false },
  { name: 'API and white label', home: false, trade: false, crew: false, partners: true, live: false },
]

/** Why the line sits where it does. Short, because each is a design rule. */
export const PRICING_RULES = [
  { rule: 'The waiting end never pays', why: 'They have no account. The link is the whole product for them' },
  { rule: 'Homes are free forever', why: 'A family sending cards to each other is how it becomes a habit, then a standard' },
  { rule: 'The cap is cards sent, not cards viewed', why: 'A card forwarded to a partner or a group chat costs the sender nothing' },
  { rule: 'Features gate the trade plans, not the stages', why: 'Everyone gets Booked in to Job done. A logo and a connector are business things' },
  { rule: 'A bank card is never asked for on Home', why: 'The free plan has no upgrade nag. It says Trade exists, once, when the cap is near' },
  { rule: 'Annual is two months free', why: 'Standard, and it turns churn into a yearly decision' },
]

/** What happens at the cap. The honest version, written down before it is built. */
export const AT_THE_CAP = [
  'Cards already sent keep working. Nothing a customer holds ever goes dark',
  'The eleventh card that month says Trade exists and what it costs',
  'No countdown, no nagging, no feature switched off mid-job',
  'A trade who hits it twice is a trade. That is the sales funnel',
]
