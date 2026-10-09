/**
 * Pricing: the card and the job are free, forever. Money comes from three
 * places, none of them the card.
 *
 * Shaped by the owner on 9 Oct 2026, replacing the per-month Trade plan of
 * the same morning:
 *
 *   1. The person WAITING never pays and never has an account. The card is a
 *      link they open. Nothing on this page can ever charge them.
 *   2. The person SENDING gets the card, the stages, the window, "will someone
 *      be in", the calendar and the job itself for nothing, with no cap.
 *      Cards are how it spreads; charging for them would slow the spread.
 *   3. A trade who is clearly living in it (a month in, and more than a
 *      number of jobs) pays a small ACTIVATION charge and a small ANNUAL fee.
 *      Not to make money: to put a card on file and cover the first year's
 *      hosting. From then on, everything else is an upsell.
 *   4. Upsells are FEATURES, sold as bundles, or as three tiers for anyone
 *      who would rather not pick. Paid monthly or weekly, their choice.
 *   5. One bundle is TAKING PAYMENTS on the job. The processor takes its
 *      percentage; TurnUp adds a small margin on top. That is the line that
 *      can grow with the trade's turnover instead of with our price list.
 *   6. REFERRALS earn free jobs before the activation charge, the way Dropbox
 *      once earned storage. The unit is jobs, because that is the thing a
 *      trade is counting towards.
 *
 * Every figure below is PROPOSED. Nothing is charged today, nothing is wired
 * to a payment provider, and the open ones are decisions on the plan.
 */

/** What is free, with no cap and no bank card. The whole card as it is today. */
export const FREE_CORE = [
  'One link per job, four stages',
  'The job itself: name, address, when, notes',
  'Text or WhatsApp in one tap',
  'Agree the window, do not announce it',
  'Will someone be in?',
  'Add to calendar',
  'Phone buzzes when they set off',
  'Your name on the card',
]

/**
 * When the small charge arrives. Both conditions, so a one-off job never
 * trips it and a busy first week does not either.
 */
export const ACTIVATION = {
  afterMonths: 1,
  afterJobs: 25,          // decision: 20 / 30 / 50
  fee: 12,                // decision: 10 / 12 / 15, one-off
  annual: 12,             // decision: 0 / 12 / 24 / 36, a year
  what: 'A card on file, consent given once, charged on activation and then yearly',
}

/** The upsells, grouped the way a trade would buy them. */
export const BUNDLES = [
  {
    key: 'paid',
    name: 'Get paid',
    tone: 'done',
    price: 6,
    line: 'Take the payment on the job, from the card',
    features: ['Card payment on the job, from the customer page', 'Deposit before the day', 'Pay link in the text', 'Paid stamp on the card', 'Pays out to your bank'],
    note: 'The processor takes its percentage. TurnUp adds a small margin on top of that, not on top of the job.',
  },
  {
    key: 'look',
    name: 'Look the part',
    tone: 'onsite',
    price: 4,
    line: 'Your firm on the card, not ours',
    features: ['Your logo and photo', 'Van from the number plate', 'Who is coming and what they drive', 'The card in Apple and Google Wallet, branded'],
  },
  {
    key: 'day',
    name: 'Run the day',
    tone: 'onway',
    price: 8,
    line: 'The card moves itself, the day runs itself',
    features: ['ServiceM8 moves the card', 'Where they are in the day', 'Several vans, one dashboard', 'Industry stage names: RIBA, building control', 'CarPlay and Android Auto'],
  },
]

/**
 * For anyone who would rather not pick. Each tier is bundles stacked, and
 * the weekly price is the monthly one over four, rounded up, for the trade
 * who is paid on a Friday.
 */
export const TIERS = [
  { key: 'free', name: 'Free', bundles: [], monthly: 0, vans: 1, line: 'The card and the job. Always.' },
  { key: 'starter', name: 'Starter', bundles: ['one'], monthly: 6, vans: 1, line: 'Any one bundle' },
  { key: 'pro', name: 'Pro', bundles: ['paid', 'look', 'day'], monthly: 15, vans: 1, line: 'All three' },
  { key: 'crew', name: 'Crew', bundles: ['paid', 'look', 'day'], monthly: 29, vans: 5, line: 'All three, five vans' },
]

export const weekly = (monthly) => Math.ceil(monthly / 4)

/** Taking payments. The margin is the open decision; the processor rate is Stripe's published UK card rate, Oct 2026, and may change. */
export const PAYMENTS = {
  processorPct: 1.5,
  processorPence: 20,
  marginPct: 0.5,         // decision: 0.25 / 0.5 / 1
  needs: 'A payment platform account held by the Ltd. The processor is the regulated party; TurnUp takes an application fee.',
}

/** Referrals, the Dropbox way. The unit is free jobs before activation. */
export const REFERRALS = {
  perReferral: 10,        // decision: 5 / 10 / 20 free jobs, both sides
  waiveYearAt: 3,         // referrals that waive the first annual fee
  bundleYearAt: 10,       // referrals that earn a bundle for a year
  how: 'A trade sends a mate a link from the dashboard. When the mate sends their first card, both get the jobs.',
}

/** Why the line sits where it does. */
export const PRICING_RULES = [
  { rule: 'The waiting end never pays', why: 'No account, no card details, ever' },
  { rule: 'The card and the job are free, no cap', why: 'Charging for cards slows the spread, and the spread is the product' },
  { rule: 'Activation is small and late', why: 'A month in and twenty-odd jobs means they are staying. Then a card on file' },
  { rule: 'Features are the business', why: 'Bundles a trade can name, or a tier for the ones who will not pick' },
  { rule: 'Payments grow with their turnover', why: 'A small margin on every job paid through the card, not a bigger price list' },
  { rule: 'Weekly or monthly, their choice', why: 'Trades get paid on a Friday. Billing should fit the week it is spent in' },
  { rule: 'Referrals pay in jobs', why: 'Free jobs before activation is the thing a new trade is counting towards' },
]

/** What happens at the activation line, written down before it is built. */
export const AT_ACTIVATION = [
  'Cards already sent keep working. Nothing a customer holds ever goes dark',
  'The next job after the line asks for a card on file, once, with the fee and the yearly amount shown',
  'No countdown, no nagging, no feature switched off mid-job',
  'Say no and the card still works; new jobs wait until the fee is paid',
  'From here the dashboard shows the bundles. Nothing is pushed',
]
