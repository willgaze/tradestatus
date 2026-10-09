import { TRADE_NAME } from '@/lib/trade'
import { ALL_ITEMS } from '@/lib/roadmap'
import { CHANGELOG, VERSION } from '@/lib/version'

/**
 * The business plan behind /plan. One file; the page renders what is here.
 *
 * Every figure carries where it came from, because a plan shown to someone
 * is a set of claims and each one will be asked about:
 *
 *   kind: 'fact'      read from a system or a cited source, with `source`
 *   kind: 'estimate'  a working figure, for the owner to confirm or correct
 *   kind: 'decision'  only the owner can answer this
 *
 * The first customer is named through TRADE_NAME, never typed here: this file
 * belongs to the product, and the product has no customer's name in it.
 * Pricing lives in src/lib/pricing.js so the product can read it too.
 */

export const PLAN_META = {
  strap: 'One link per job.',
  premise: 'A card in a wallet, not a web page',
  liveUrl: 'https://www.getturnup.com',
  demoUrl: 'https://www.getturnup.com/demo',
  repoUrl: 'https://github.com/willgaze/tradestatus',
  researchUrl: 'https://github.com/willgaze/tradestatus/blob/main/docs/research/formal-processes.md',
  walletDocUrl: 'https://github.com/willgaze/tradestatus/blob/main/docs/apple-wallet.md',
  diaryUrl: 'https://github.com/willgaze/tradestatus/tree/main/docs/diary',
  liveSince: '8 Oct 2026',
  updated: '9 Oct 2026',
}

export const STAGES = [
  { key: 'booked', label: 'Booked in', plain: 'Job is in the diary' },
  { key: 'onway', label: 'On my way', plain: 'Trade has left for you' },
  { key: 'onsite', label: 'On site', plain: 'Trade is at your door' },
  { key: 'done', label: 'Job done', plain: 'Work finished, link closes' },
]

/** Roadmap counts, read from src/lib/roadmap.js at build time. A fact by construction. */
export const ROADMAP_COUNTS = ALL_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item.state]: (acc[item.state] || 0) + 1 }),
  { live: 0, ready: 0, idea: 0 },
)

/** Build state, 9 Oct 2026. */
export const STATUS = [
  { item: 'Live at getturnup.com', state: 'green', note: 'since 8 Oct 2026' },
  { item: 'Customer card and dashboard', state: 'green', note: `version ${VERSION}` },
  { item: 'Nightly build', state: 'green', note: '02:00, one improvement a night' },
  { item: 'ServiceM8 connector', state: 'amber', note: 'built, not yet connected' },
  { item: 'Van lookup (DVSA MOT API)', state: 'amber', note: 'key applied 2 Oct' },
  { item: 'Apple Wallet card', state: 'amber', note: 'signing built, needs Apple Developer' },
  { item: 'Google Wallet card', state: 'red', note: 'not built, needs an issuer account' },
  { item: 'Paying customers', state: 'red', note: `none, ${TRADE_NAME} is customer zero` },
  { item: 'Pricing', state: 'amber', note: 'homes free to 5 cards a month, Trade 5 pounds, decided 9 Oct 2026, not yet charged' },
  { item: 'Legal entity', state: 'amber', note: 'a new Ltd, decided 9 Oct 2026, not yet formed' },
]

/** The three things only the owner can move, each with the link and the step. */
export const WAITING_ON_OWNER = [
  { label: 'Connect ServiceM8', step: 'ServiceM8, Settings, API Keys, create one, then run scripts/connect-servicem8.sh', href: 'https://go.servicem8.com' },
  { label: 'DVSA MOT key into Vercel', step: 'When the email lands: MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, then redeploy', href: 'https://vercel.com/willgazes-projects/turnup/settings/environment-variables' },
  { label: 'Apple Developer Programme', step: 'Enrol as an individual, then bash scripts/apple-wallet.sh', href: 'https://developer.apple.com/programs/enroll/' },
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
    { label: 'Agree a window, never announce one', note: 'either end proposes, the other agrees' },
    { label: 'Will someone be in?', note: 'answers stay on the device that gave them' },
    { label: 'Van make, model, colour', note: 'DVSA lookup, pending key' },
    { label: 'Apple Wallet card', note: 'signing built, pending Apple' },
    { label: 'ServiceM8 moves it for you', note: 'webhooks: check-in, check-out' },
    { label: 'Old links keep working', note: 'tradestatus.vercel.app still serves' },
  ],
  never: [
    { label: 'No arrival time promised' },
    { label: 'No live GPS tracking' },
    { label: 'No customer app to install' },
    { label: 'No customer account, ever' },
    { label: 'No logos of bodies we follow' },
  ],
}

/** How a stage change travels. The diagram on the Product page draws this. */
export const FLOW = {
  inputs: ['Trade taps a stage', 'ServiceM8 check-in or check-out', 'CarPlay or Android Auto'],
  core: 'TurnUp',
  outputs: ['The link, on any phone', 'The card in the wallet', 'A buzz on the lock screen'],
}

/**
 * The wallet card: what exists, what is missing, and why it is the product.
 * Read from docs/apple-wallet.md and src/lib/roadmap.js on 9 Oct 2026.
 */
export const WALLET = {
  why: [
    'A flight boarding pass, for a plumber',
    'Sits on the lock screen, no app, no link to find',
    'Updates itself when the stage changes',
    'Harder to forward than a link. Better for the householder',
  ],
  built: [
    { label: 'Pass design and signing', note: 'tested end to end with a stand-in certificate chain, v1.15.4' },
    { label: 'Add to Apple Wallet button', note: 'appears on the customer page on an Apple device, once a pass can be signed' },
    { label: 'Two-command certificate script', note: 'scripts/apple-wallet.sh: csr, then finish' },
    { label: 'Logo and stage on the pass', note: 'from the trade profile' },
  ],
  missing: [
    { label: 'Apple Developer Programme', note: 'the owner enrols as an individual, 79 pounds a year', who: 'owner' },
    { label: 'Pass update web service', note: '/api/passes/v1: device registration, what changed, APNs push, so the card updates itself. Today a pass shows the stage at the moment it was added', who: 'build' },
    { label: 'Google Wallet', note: 'issuer account, a pass class, and the same update loop on Android', who: 'build' },
    { label: 'A real pass in a real wallet', note: 'nobody has held one yet. The first one is the test', who: 'owner' },
  ],
}

/** Who else solves this. A working view, not a product-by-product study. */
export const ALTERNATIVES = [
  { who: 'Phone call or text', them: 'Promises a time', us: 'Promises a stage', kind: 'estimate' },
  { who: 'Job-software SMS', them: 'One message, one stage', us: 'Whole job, one link', kind: 'estimate' },
  { who: 'Parcel-style live map', them: 'Needs the app, needs GPS', us: 'No app, no tracking', kind: 'estimate' },
  { who: 'A wallet pass from an airline', them: 'Flights only', us: 'The same card, for work at a house', kind: 'estimate' },
  { who: 'Do nothing', them: 'Customer waits in', us: 'Customer gets on with the day', kind: 'estimate' },
]

/** Market, sourced. No ServiceM8 customer count: none is published. */
export const MARKET_STATS = [
  { value: '370,770', label: 'GB construction firms, Q3 2024', kind: 'fact', source: 'ONS business register, via Construction Briefing. Excludes most sole traders under the VAT threshold', href: 'https://www.constructionbriefing.com/news/uk-sees-surge-in-new-construction-businesses/8026305.article' },
  { value: '15.8%', label: 'of UK businesses are construction', kind: 'fact', source: 'Department for Business and Trade, 2025, via a secondary listing. Check the Business Population Estimates before quoting', href: 'https://www.bytestart.co.uk/news-insights/how-many-small-businesses-are-there-in-the-uk/' },
  { value: '?', label: 'ServiceM8 businesses', kind: 'decision', source: 'No official count published. Third-party trackers disagree by 4x. Ask ServiceM8 before using any figure', href: 'https://www.servicem8.com' },
]

/** Who sends a card. Segments from the roadmap's bigger idea; order is a working guess. */
export const SEGMENTS = [
  { who: 'One-van trades', why: 'Customer zero. The dashboard is built for a driveway', plan: 'Trade', kind: 'estimate' },
  { who: 'Homes and families', why: 'A mate dropping something off, a neighbour with a key. Either end can be either', plan: 'Home', kind: 'estimate' },
  { who: 'Multi-van firms on job software', why: 'The card moves itself from ServiceM8. No tapping', plan: 'Crew', kind: 'estimate' },
  { who: 'Couriers, removals, pickups', why: 'Same question, same two ends. A failed delivery costs more than a wasted visit', plan: 'Crew', kind: 'estimate' },
  { who: 'Retrofit and insurance claims', why: 'Four or five firms on one job and the householder gets a phone number for each', plan: 'Partners', kind: 'estimate' },
  { who: 'Architects and building control', why: 'RIBA 0 to 7 and inspection stages already have names. The card speaks them', plan: 'Crew', kind: 'estimate' },
]

/** Formal processes the card could speak. From docs/research/formal-processes.md. */
export const TEMPLATES = [
  { process: 'ServiceM8 job', stages: 'Quote, work order, check-in, check-out, done', feed: 'Webhooks', fit: 'green', call: 'Connector first' },
  { process: 'RIBA Plan of Work 2020', stages: '0 Strategic to 7 Use', feed: 'None, practice taps', fit: 'green', call: 'First template, decided 9 Oct' },
  { process: 'Building control (LABC)', stages: 'Commencement to completion certificate', feed: 'None, builder taps', fit: 'green', call: 'Template' },
  { process: 'PAS 2035 retrofit', stages: 'Advice to evaluation, five roles', feed: 'TrustMark lodgement', fit: 'green', call: 'Template, connector later' },
  { process: 'Competent Person notification', stages: 'Done, notified, certificate', feed: 'Portals, no API', fit: 'amber', call: 'A "Certificate issued" stage' },
  { process: 'Insurance claim', stages: 'FNOL to settlement', feed: 'Contractor networks', fit: 'amber', call: 'The trade already holds the card' },
  { process: 'Conveyancing Protocol', stages: 'A Instructions to F Post-completion', feed: 'LEAP, Proclaim', fit: 'amber', call: 'Park until a solicitor asks' },
  { process: 'Building Safety Act', stages: 'Gateway 1, 2, 3', feed: 'BSR portal', fit: 'gray', call: 'Later, commercial tier' },
  { process: 'Parcel tracking', stages: 'EMA to EMI', feed: 'Carrier APIs', fit: 'red', call: 'No. Carriers own it' },
  { process: 'NHS referral', stages: 'Referral to treatment', feed: 'None usable', fit: 'red', call: 'No. Regulated data' },
]

/** Calculator defaults. Assumptions, not forecasts; every one is editable on the page. */
export const CALC_DEFAULTS = { paid: 0, newPaid: 5, price: 5, churnPct: 4, hosting: 40, months: 12 }

/** Go to market as gates. A phase opens when the gate before it is passed. */
export const GTM_PHASES = [
  { phase: '0', label: 'Customer zero', gate: `${TRADE_NAME} on the ServiceM8 connector`, moves: ['Connect ServiceM8', 'Every job gets a card', 'First real wallet pass'], when: 'Now', state: 'amber' },
  { phase: '1', label: 'Homes and one-van trades', gate: '10 businesses sending cards', moves: ['Home plan live, free', 'Trade plan live, first payment', 'Trade groups, demo link'], when: 'Q4 2026', state: 'gray' },
  { phase: '2', label: 'Crews and templates', gate: '3 templates live, 1 crew paying', moves: ['RIBA 0 to 7 first', 'ServiceM8 add-on listing', 'Google Wallet'], when: '2027 H1', state: 'gray' },
  { phase: '3', label: 'Partners', gate: 'One retrofit or claim job end to end', moves: ['Four firms, one card', 'Whoever is next updates it', 'Householder gets one link'], when: '2027 H2', state: 'gray' },
]

/**
 * What has shipped, read from CHANGELOG in src/lib/version.js: every minor
 * release and the day it landed. A fact by construction.
 */
export const MILESTONES = CHANGELOG
  .filter((r) => /\.0$/.test(r.version))
  .map((r) => ({ version: r.version, date: r.date, note: r.notes[0] }))
  .reverse()

/** Likelihood is a working estimate. */
export const RISKS = [
  { label: 'The owner has no spare hours', likelihood: 'high', answer: 'The nightly build does the building', kind: 'estimate' },
  { label: 'Apple never signs the pass', likelihood: 'low', answer: 'The link works without it. The card is the upgrade, not the floor', kind: 'estimate' },
  { label: 'ServiceM8 ships the same thing', likelihood: 'medium', answer: 'Homes, templates and multi-party, not one app', kind: 'estimate' },
  { label: 'Trades will not tap', likelihood: 'medium', answer: 'Webhooks tap for them', kind: 'estimate' },
  { label: 'Free tier costs more than it earns', likelihood: 'medium', answer: 'A card is a row and a page. Hosting is in the calculator', kind: 'estimate' },
  { label: 'Name clash on TurnUp', likelihood: 'medium', answer: 'Trademark check before spending on the name', kind: 'estimate' },
  { label: 'Single founder', likelihood: 'high', answer: 'Code on GitHub, a diary per build', kind: 'estimate' },
  { label: 'Customer data on a public link', likelihood: 'low', answer: 'Stage only. Answers never leave the device', kind: 'estimate' },
]

/** Who is building it, and what the plan needs from someone who builds apps. */
export const TEAM = [
  { role: 'Owner', what: 'A trade. Customer zero. Decides, tests on real jobs, holds the accounts' },
  { role: 'The nightly build', what: 'One improvement a night, versioned, a diary per build. The owner reads it in the morning' },
  { role: 'Not yet', what: 'Someone who has shipped a wallet pass or an app store listing before' },
]

export const THE_ASK = {
  lead: 'This is being sent to one person who builds apps for a living. The ask is specific.',
  items: [
    { n: '1', label: 'Read it and say what is wrong', note: 'The plan, the pricing line, the wallet premise. Ten minutes' },
    { n: '2', label: 'The pass update loop', note: 'PassKit web service: registration, what changed, push. Has it, or knows who has' },
    { n: '3', label: 'Google Wallet', note: 'Issuer account, pass class, the same loop on Android' },
    { n: '4', label: 'One introduction', note: 'Anyone who has put a pass in a million wallets' },
  ],
  notAsking: ['Not asking for money', 'Not asking for code', 'Not asking for a cofounder, yet'],
}

export const DECISIONS = [
  { key: 'pricing', question: 'Who pays?', options: ['Nobody, for now', 'Homes free, trades pay', 'Everyone pays', 'Per card for all'], decided: 'Homes free, trades pay', decidedAt: '9 Oct 2026' },
  { key: 'freeCap', question: 'Free cards a month, per sender?', options: ['5', '10', '20', '30'], decided: '5', decidedAt: '9 Oct 2026' },
  { key: 'tradePrice', question: 'Trade plan, pounds a month?', options: ['5', '9', '12', '15'], decided: '5', decidedAt: '9 Oct 2026' },
  { key: 'entity', question: 'Which company owns TurnUp?', options: ['New Ltd', 'Existing dormant Ltd', 'Sole trader for now', 'Ask the accountant first'], decided: 'New Ltd', decidedAt: '9 Oct 2026' },
  { key: 'raise', question: 'Raise money at all?', options: ['No, bootstrap', 'Friends and family', 'Angel after 10 customers', 'Undecided'], decided: 'Undecided', decidedAt: '9 Oct 2026' },
  { key: 'firstTemplate', question: 'First template after ServiceM8?', options: ['Building control', 'RIBA', 'Certificate issued', 'PAS 2035'], decided: 'RIBA', decidedAt: '9 Oct 2026' },
]

export const FACTS_TABLE = [
  ...PROBLEM_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  ...MARKET_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  { figure: PLAN_META.liveSince, what: 'Live on getturnup.com', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: `${ROADMAP_COUNTS.live}`, what: 'Roadmap items live today', source: 'src/lib/roadmap.js', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: `${ROADMAP_COUNTS.ready}`, what: 'Built, waiting on a key or an account', source: 'src/lib/roadmap.js', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '79 pounds', what: 'Apple Developer Programme, a year', source: 'docs/apple-wallet.md', href: PLAN_META.walletDocUrl, kind: 'fact' },
  { figure: '0', what: 'Paying customers', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '1', what: `Businesses using it (${TRADE_NAME})`, source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
]
