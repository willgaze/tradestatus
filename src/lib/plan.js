import { TRADE_NAME } from '@/lib/trade'

/**
 * The business plan behind /plan. One file; the page renders what is here.
 *
 * Every figure carries where it came from, because a plan shown to an
 * investor is a set of claims and each one will be asked about:
 *
 *   kind: 'fact'      read from a system or a cited source, with `source`
 *   kind: 'estimate'  a working figure, for the owner to confirm or correct
 *   kind: 'decision'  only the owner can answer this
 *
 * The first customer is named through TRADE_NAME, never typed here: this file
 * belongs to the product, and the product has no customer's name in it.
 */

export const PLAN_META = {
  strap: 'One link per job.',
  liveUrl: 'https://www.getturnup.com',
  demoUrl: 'https://www.getturnup.com/demo',
  repoUrl: 'https://github.com/willgaze/tradestatus',
  researchUrl: 'https://github.com/willgaze/tradestatus/blob/main/docs/research/formal-processes.md',
  liveSince: '8 Oct 2026',
  updated: '9 Oct 2026',
}

export const STAGES = [
  { key: 'booked', label: 'Booked in', plain: 'Job is in the diary' },
  { key: 'onway', label: 'On my way', plain: 'Trade has left for you' },
  { key: 'onsite', label: 'On site', plain: 'Trade is at your door' },
  { key: 'done', label: 'Job done', plain: 'Work finished, link closes' },
]

/** Build state, 9 Oct 2026. Mirrors the roadmap: live, ready, idea. */
export const STATUS = [
  { item: 'Live at getturnup.com', state: 'green', note: 'since 8 Oct 2026' },
  { item: 'Customer card and dashboard', state: 'green', note: 'this build' },
  { item: 'Nightly build', state: 'green', note: '02:00, one improvement a night' },
  { item: 'ServiceM8 connector', state: 'amber', note: 'built, not yet connected' },
  { item: 'Van lookup (DVSA MOT API)', state: 'amber', note: 'key applied 2 Oct' },
  { item: 'Apple Wallet card', state: 'amber', note: 'built, needs Apple Developer' },
  { item: 'Paying customers', state: 'red', note: `none, ${TRADE_NAME} is customer zero` },
  { item: 'Pricing', state: 'amber', note: 'free while customer zero, decided 9 Oct 2026' },
  { item: 'Legal entity', state: 'amber', note: 'a new Ltd, decided 9 Oct 2026, not yet formed' },
]

/** The three things only the owner can move, each with the link and the step. */
export const WAITING_ON_OWNER = [
  {
    label: 'Connect ServiceM8',
    step: 'ServiceM8, Settings, API Keys, create one, then run scripts/connect-servicem8.sh',
    href: 'https://go.servicem8.com',
  },
  {
    label: 'DVSA MOT key into Vercel',
    step: 'When the email lands: MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, then redeploy',
    href: 'https://vercel.com/willgazes-projects/turnup/settings/environment-variables',
  },
  {
    label: 'Apple Developer Programme',
    step: 'Enrol, then bash scripts/apple-wallet.sh',
    href: 'https://developer.apple.com/programs/enroll/',
  },
]

/** Third-party surveys. Small samples; two were commissioned by trade businesses. */
export const PROBLEM_STATS = [
  { value: '21%', label: 'no-show on last job', kind: 'fact', source: 'Markel Direct, 500 UK homeowners, 2025', href: 'https://www.markeluk.com/knowledge-centre/tradie-etiquette-uk' },
  { value: '51%', label: 'arrived on time', kind: 'fact', source: 'Markel Direct, 2025', href: 'https://www.markeluk.com/knowledge-centre/tradie-etiquette-uk' },
  { value: '15%', label: 'cancelled last minute', kind: 'fact', source: 'Markel Direct, 2025', href: 'https://www.markeluk.com/knowledge-centre/tradie-etiquette-uk' },
  { value: '2.8 hrs', label: 'average wait in', kind: 'fact', source: 'HomeServe, 2013. Old, and the only waiting-in figure found', href: 'https://www.prnewswire.co.uk/news-releases/waiting-in-drain-homeserve-discover-brits-spend-72m-hours-a-year-waiting-for-plumbers-201574671.html' },
  { value: '6.5 hrs', label: 'typical arrival window', kind: 'fact', source: 'HomeServe, 2013', href: 'https://www.prnewswire.co.uk/news-releases/waiting-in-drain-homeserve-discover-brits-spend-72m-hours-a-year-waiting-for-plumbers-201574671.html' },
]

export const BEFORE_AFTER = {
  before: ['Customer phones the office', 'Office phones the van', 'Van guesses a time', 'Time promised, time missed', 'Review says late'],
  after: ['Customer opens one link', 'Sees the stage, not a clock', 'Trade taps once per stage', 'ServiceM8 taps for them', 'Nothing promised, nothing missed'],
}

export const PRODUCT = {
  does: [
    { label: 'One link per job' },
    { label: 'Four stages, plain English' },
    { label: 'Van make, model, colour', note: 'DVSA lookup, pending key' },
    { label: 'Apple Wallet card', note: 'built, pending Apple' },
    { label: 'ServiceM8 moves it for you', note: 'webhooks: check-in, check-out' },
    { label: 'Old links keep working', note: 'tradestatus.vercel.app still serves' },
  ],
  never: [
    { label: 'No arrival time promised' },
    { label: 'No live GPS tracking' },
    { label: 'No customer app to install' },
    { label: 'No logos of bodies we follow' },
  ],
}

/** Who else solves this. A working view, not a product-by-product study. */
export const ALTERNATIVES = [
  { who: 'Phone call or text', them: 'Promises a time', us: 'Promises a stage', kind: 'estimate' },
  { who: 'Job-software SMS', them: 'One message, one stage', us: 'Whole job, one link', kind: 'estimate' },
  { who: 'Parcel-style live map', them: 'Needs the app, needs GPS', us: 'No app, no tracking', kind: 'estimate' },
  { who: 'Do nothing', them: 'Customer waits in', us: 'Customer gets on with the day', kind: 'estimate' },
]

/** Market, sourced. No ServiceM8 customer count: none is published. */
export const MARKET_STATS = [
  { value: '370,770', label: 'GB construction firms, Q3 2024', kind: 'fact', source: 'ONS business register, via Construction Briefing. Excludes most sole traders under the VAT threshold', href: 'https://www.constructionbriefing.com/news/uk-sees-surge-in-new-construction-businesses/8026305.article' },
  { value: '15.8%', label: 'of UK businesses are construction', kind: 'fact', source: 'Department for Business and Trade, 2025, via a secondary listing. Check the Business Population Estimates before quoting', href: 'https://www.bytestart.co.uk/news-insights/how-many-small-businesses-are-there-in-the-uk/' },
  { value: '?', label: 'ServiceM8 businesses', kind: 'decision', source: 'No official count published. Third-party trackers disagree by 4x. Ask ServiceM8 before using any figure', href: 'https://www.servicem8.com' },
]

/** Formal processes the card could speak. From docs/research/formal-processes.md. */
export const TEMPLATES = [
  { process: 'ServiceM8 job', stages: 'Quote, work order, check-in, check-out, done', feed: 'Webhooks', fit: 'green', call: 'Connector first' },
  { process: 'Building control (LABC)', stages: 'Commencement to completion certificate', feed: 'None, builder taps', fit: 'green', call: 'Template now' },
  { process: 'RIBA Plan of Work 2020', stages: '0 Strategic to 7 Use', feed: 'None, practice taps', fit: 'green', call: 'Template now' },
  { process: 'PAS 2035 retrofit', stages: 'Advice to evaluation, five roles', feed: 'TrustMark lodgement', fit: 'green', call: 'Template now, connector later' },
  { process: 'Competent Person notification', stages: 'Done, notified, certificate', feed: 'Portals, no API', fit: 'amber', call: 'A "Certificate issued" stage' },
  { process: 'Insurance claim', stages: 'FNOL to settlement', feed: 'Contractor networks', fit: 'amber', call: 'The trade already holds the card' },
  { process: 'Conveyancing Protocol', stages: 'A Instructions to F Post-completion', feed: 'LEAP, Proclaim', fit: 'amber', call: 'Park until a solicitor asks' },
  { process: 'Building Safety Act', stages: 'Gateway 1, 2, 3', feed: 'BSR portal', fit: 'gray', call: 'Later, commercial tier' },
  { process: 'Parcel tracking', stages: 'EMA to EMI', feed: 'Carrier APIs', fit: 'red', call: 'No. Carriers own it' },
  { process: 'NHS referral', stages: 'Referral to treatment', feed: 'None usable', fit: 'red', call: 'No. Regulated data' },
]

/** Decided 9 Oct 2026: free while customer zero. The three shapes below are what comes after, and the figures are calculator placeholders, not prices. */
export const PRICING_OPTIONS = [
  { key: 'flat', label: 'Flat per business', shape: 'Monthly, unlimited cards', pro: 'Simple to sell, simple to bill', con: 'Big firms pay the same as one van', placeholder: 19, unit: 'per business a month' },
  { key: 'perVan', label: 'Per van', shape: 'Monthly, per staff member', pro: 'Grows with the customer', con: 'Counting vans is a support ticket', placeholder: 9, unit: 'per van a month' },
  { key: 'perCard', label: 'Per card', shape: 'Pence per job link', pro: 'Pay for what you use', con: 'Unpredictable bill, hard to budget', placeholder: 0.25, unit: 'per card' },
]

export const CALC_DEFAULTS = { customers: 50, pricePerMonth: 19, monthlyChurnPct: 4, monthsOut: 12, newPerMonth: 10 }

/** Go to market as gates. A phase opens when the gate before it is passed. */
export const GTM_PHASES = [
  { phase: '0', label: 'Customer zero', gate: `${TRADE_NAME} on the ServiceM8 connector`, moves: ['Connect ServiceM8', 'Every job gets a card', 'Count customer taps'], when: 'Now', state: 'amber' },
  { phase: '1', label: 'ServiceM8 trades', gate: '10 businesses on the connector', moves: ['ServiceM8 add-on listing', 'Trade groups, demo link', 'First price charged'], when: 'Q4 2026', state: 'gray' },
  { phase: '2', label: 'Templates', gate: '3 templates live', moves: ['RIBA 0 to 7 first', 'Building control stages', 'Certificate issued stage'], when: '2027 H1', state: 'gray' },
  { phase: '3', label: 'Multi-party cards', gate: 'One retrofit or claim job end to end', moves: ['Four firms, one card', 'Whoever is next updates it', 'Householder gets one link'], when: '2027 H2', state: 'gray' },
]

/** Likelihood is a working estimate. */
export const RISKS = [
  { label: 'The owner has no spare hours', likelihood: 'high', answer: 'The nightly build does the building', kind: 'estimate' },
  { label: 'ServiceM8 ships the same thing', likelihood: 'medium', answer: 'Templates and multi-party, not one app', kind: 'estimate' },
  { label: 'Trades will not tap', likelihood: 'medium', answer: 'Webhooks tap for them', kind: 'estimate' },
  { label: 'Name clash on TurnUp', likelihood: 'medium', answer: 'Trademark check before spending on the name', kind: 'estimate' },
  { label: 'Single founder', likelihood: 'high', answer: 'Code on GitHub, a diary per build', kind: 'estimate' },
  { label: 'Customer data on a public link', likelihood: 'low', answer: 'Stage only. Answers never leave the device', kind: 'estimate' },
]

export const DECISIONS = [
  { key: 'pricing', question: 'Which pricing shape?', options: ['Flat per business', 'Per van', 'Per card', 'Free while customer zero'], decided: 'Free while customer zero', decidedAt: '9 Oct 2026' },
  { key: 'entity', question: 'Which company owns TurnUp?', options: ['New Ltd', 'Existing dormant Ltd', 'Sole trader for now', 'Ask the accountant first'], decided: 'New Ltd', decidedAt: '9 Oct 2026' },
  { key: 'raise', question: 'Raise money at all?', options: ['No, bootstrap', 'Friends and family', 'Angel after 10 customers', 'Undecided'], decided: 'Undecided', decidedAt: '9 Oct 2026' },
  { key: 'firstTemplate', question: 'First template after ServiceM8?', options: ['Building control', 'RIBA', 'Certificate issued', 'PAS 2035'], decided: 'RIBA', decidedAt: '9 Oct 2026' },
]

export const FACTS_TABLE = [
  ...PROBLEM_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  ...MARKET_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  { figure: PLAN_META.liveSince, what: 'Live on getturnup.com', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '0', what: 'Paying customers', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '1', what: `Businesses using it (${TRADE_NAME})`, source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
]
