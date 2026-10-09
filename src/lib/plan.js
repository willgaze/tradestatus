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
 * The spine, set by the owner on 9 Oct 2026: three moats a big firm cannot
 * build in a sprint, six moves in order, five rivals and the move that beats
 * each, and the sectors where a regulator already prices a missed visit.
 * Pricing lives in src/lib/pricing.js so the product can read it too.
 *
 * The first customer is named through TRADE_NAME, never typed here: this file
 * belongs to the product, and the product has no customer's name in it.
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

/**
 * The three moats. What a big firm cannot build in a sprint, and where each
 * stands today, read against the roadmap on 9 Oct 2026. `pct` is a working
 * estimate of how much of the moat exists.
 */
export const MOATS = [
  {
    n: '1', name: 'The household end', line: 'A courier holds a parcel for a day. We hold the home for years.',
    today: ['Which door, the dog, what3words: live', 'Will someone be in: live, four taps', 'Answers stay on the device that gave them: live'],
    missing: ['An account per address, not per job', 'Remembered for the next trade', 'Who is allowed to ask if you are in'],
    gate: 'A second trade reads what the first one learned', pct: 55,
  },
  {
    n: '2', name: 'Recognition', line: 'When the plumber, the cleaner and the courier send the same card, a big firm adopting it is a tick-box.',
    today: [`One business sends it: ${TRADE_NAME}`, 'The card looks the same whoever sends it'],
    missing: ['The waiting end asks for it: customer-invite', 'A public stage vocabulary anyone can match', 'Enough senders that a household has seen it before'],
    gate: 'Household-requested cards outnumber trade-sent ones', pct: 5,
  },
  {
    n: '3', name: 'One integration', line: 'Both wallets, the update loop, push, SMS fallback, the privacy rules. They would rather buy that than own it.',
    today: ['Apple pass signing: built, unsigned', 'Push: built, needs keys', 'ServiceM8 connector: built, unconnected', 'Privacy rules: written and checked by script'],
    missing: ['A signed pass in a real wallet', 'Google Wallet', 'The pass update web service', 'An API another firm can call'],
    gate: 'A firm that is not customer zero calls the API', pct: 30,
  },
]

/** Build state, 9 Oct 2026. */
export const STATUS = [
  { item: 'Live at getturnup.com', state: 'green', note: 'since 8 Oct 2026' },
  { item: 'Customer card and dashboard', state: 'green', note: `version ${VERSION}` },
  { item: 'Nightly build', state: 'green', note: '02:00, one improvement a night' },
  { item: 'ServiceM8 connector', state: 'amber', note: 'built, not yet connected' },
  { item: 'Van lookup (DVSA MOT API)', state: 'amber', note: 'key applied 2 Oct' },
  { item: 'Apple Wallet card', state: 'amber', note: 'signing built, needs Apple Developer' },
  { item: 'Google Wallet card', state: 'red', note: 'not built; decide whether to build on a pass platform' },
  { item: 'Paying customers', state: 'red', note: `none, ${TRADE_NAME} is customer zero` },
  { item: 'Pricing', state: 'amber', note: 'free for every sender, enterprise per card, decided 9 Oct 2026' },
  { item: 'Legal entity', state: 'amber', note: 'a new Ltd, decided 9 Oct 2026, not yet formed' },
]

/** The three things only the owner can move, each with the link and the step. */
export const WAITING_ON_OWNER = [
  { label: 'Apple Developer Programme', step: 'Enrol as an individual, then bash scripts/apple-wallet.sh. Move 1 starts here', href: 'https://developer.apple.com/programs/enroll/' },
  { label: 'Connect ServiceM8', step: 'ServiceM8, Settings, API Keys, create one, then run scripts/connect-servicem8.sh. Move 2', href: 'https://go.servicem8.com' },
  { label: 'DVSA MOT key into Vercel', step: 'When the email lands: MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_API_KEY, then redeploy', href: 'https://vercel.com/willgazes-projects/turnup/settings/environment-variables' },
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
  inputs: ['Trade taps a stage', 'ServiceM8 check-in or check-out', 'An enterprise scheduler, by API'],
  core: 'TurnUp',
  outputs: ['The link, on any phone', 'The card in the wallet', 'A buzz on the lock screen'],
}

/** The wallet card: what exists, what is missing, and why it is the product. */
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
    { label: 'Google Wallet', note: 'issuer account, a pass class, and the same update loop on Android. Or a pass platform, if faster', who: 'build' },
    { label: 'A real pass in a real wallet', note: 'nobody has held one yet. The first one is the test', who: 'owner' },
  ],
}

/** Who else solves this. A working view, not a product-by-product study. */
export const ALTERNATIVES = [
  { who: 'Phone call or text', them: 'Promises a time', us: 'Promises a stage', kind: 'estimate' },
  { who: 'Job-software SMS', them: 'One message, one stage', us: 'Whole job, one link', kind: 'estimate' },
  { who: 'Parcel-style live map', them: 'Needs the app, needs GPS', us: 'No app, no tracking', kind: 'estimate' },
  { who: 'Apple and Google order tracking', them: 'Parcels, from an email', us: 'Visits, from either end, both phones', kind: 'estimate' },
  { who: 'Do nothing', them: 'Customer waits in', us: 'Customer gets on with the day', kind: 'estimate' },
]

/**
 * Five rivals, each with their edge, ours, and the move that beats them.
 * Researched 9 Oct 2026; sources on the facts page and the landscape asset.
 */
export const RIVALS = [
  { name: 'Descartes Localz', who: 'Enterprise engineer tracking, inside a logistics software giant since April 2023', href: 'https://www.descartes.com/resources/news/descartes-acquires-localz',
    their: 'Ten years of enterprise contracts. Plugged into Salesforce, ServiceMax, FieldAware. RAC, British Gas, DPD on the customer list, by their own account. Sold for about 6 million dollars.',
    ours: 'Free for the trade. A card, not a link. The household kept between jobs. Both ends can start it.',
    beat: 'Sell under them: the one to fifty van firms they do not chase, and the card their SMS could open.' },
  { name: 'The carriers: DPD, Evri, Royal Mail', who: 'Parcel day-of tracking at national volume', href: 'https://app.dpdgroup.co.uk/content/products_services/followmyparcel.jsp',
    their: 'Everyone has used Follow My Parcel. One-hour slot, live map, 15-minute alert, divert on the day.',
    ours: 'Everything that is not a parcel. One card for the plumber, the cleaner, the courier. No ETA promise to break.',
    beat: 'Never race on parcels. Win the home, then offer them the pass as a tick-box, the way AfterShip did.' },
  { name: 'ServiceM8', who: 'Job software for small trades, with an automatic on-the-way text', href: 'https://www.servicem8.com/features-communication',
    their: 'Already where the trade runs the day. The text sends itself. Customer zero uses it.',
    ours: 'The whole job on one card. The two-way question. The wallet. The connector is built.',
    beat: 'Be their card before they build one: add-on listing, flawless connector, public standard.' },
  { name: 'PassKit and the pass platforms', who: 'Pass infrastructure for any business', href: 'https://integrations.passkit.com/?p=1914',
    their: 'Sign and update passes at scale, both wallets. A static appointment pass in a day.',
    ours: 'The behaviour on the card: stages, on my way as a fact, will someone be in, nothing promised.',
    beat: 'Supplier, not rival. Build Google Wallet on them if it is faster. The domain is the defence.' },
  { name: 'Housing repairs systems', who: 'Scheduling and compliance for landlords and their contractors', href: 'https://www.totalmobile.co.uk/?p=6433',
    their: 'Owns the appointment, the rota, the compliance record. Procured by the landlord.',
    ours: 'The resident-facing half they do not have: stage, "nobody is in", and proof the slot was confirmed and attended.',
    beat: 'The resident card beside their system, attendance fed back. Ombudsman cases are the sales deck.' },
]

/** Market, sourced. No ServiceM8 customer count: none is published. */
export const MARKET_STATS = [
  { value: '370,770', label: 'GB construction firms, Q3 2024', kind: 'fact', source: 'ONS business register, via Construction Briefing. Excludes most sole traders under the VAT threshold', href: 'https://www.constructionbriefing.com/news/uk-sees-surge-in-new-construction-businesses/8026305.article' },
  { value: '£1.1m', label: 'British Gas redress for missed appointments', kind: 'fact', source: 'Ofgem. One supplier, one enforcement', href: 'https://www.ofgem.gov.uk/publications/british-gas-pays-ps11m-compensate-customers-after-agents-missed-appointments' },
  { value: '£32.31', label: 'per missed broadband visit, from April 2026', kind: 'fact', source: 'Ofcom automatic compensation, via Selectra. Check Ofcom before quoting', href: 'https://selectra.co.uk/tv-broadband/news/broadband-outage-compensation-ofcom-what-provider-owes' },
]

/** Who sends a card. Order follows the six moves. */
export const SEGMENTS = [
  { who: 'One-van trades', why: 'Customer zero. The dashboard is built for a driveway', plan: 'Free', kind: 'estimate' },
  { who: 'Homes and families', why: 'The waiting end asks the next trade for it. That is how it spreads', plan: 'Free', kind: 'estimate' },
  { who: 'One to fifty van firms', why: 'The gap Descartes does not chase. Free, by connector', plan: 'Free', kind: 'estimate' },
  { who: 'Housing associations', why: 'Ombudsman rulings, 20 to 50 pounds a miss. The resident card', plan: 'Enterprise', kind: 'estimate' },
  { who: 'Energy, broadband, water', why: 'A regulator prices the miss: 30, 32, 50 pounds', plan: 'Enterprise', kind: 'estimate' },
  { who: 'Carriers, then claims and retrofit', why: 'A tick-box once the household holds the card. Then four firms on one card', plan: 'Enterprise', kind: 'estimate' },
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
export const CALC_DEFAULTS = { freeSenders: 50, newFree: 20, enterprises: 0, newEnterprises: 0.25, cardsPerEnterprise: 2000, pricePence: 25, hosting: 60, months: 18 }

/** Six moves, in order. Each opens when the gate before it is passed. */
export const GTM_PHASES = [
  { phase: '1', label: 'Sign the pass', gate: 'One card in one wallet', moves: ['Apple Developer, as an individual', 'First real pass, on the owner’s phone', 'The update loop so it moves'], when: 'Now', state: 'amber' },
  { phase: '2', label: 'Be ServiceM8’s card', gate: 'Ten ServiceM8 trades sending', moves: ['Connector live on customer zero', 'Add-on listing', 'Stage vocabulary published'], when: 'Q4 2026', state: 'gray' },
  { phase: '3', label: 'Android, on a pass platform if faster', gate: 'Both wallets live', moves: ['Decide: PassKit or our own', 'Google Wallet pass class', 'Same update loop'], when: 'Q4 2026', state: 'gray' },
  { phase: '4', label: 'The household asks for it', gate: 'Household-requested cards outnumber trade-sent', moves: ['Customer-invite: one screen', 'An account per address', 'Remembered for the next trade'], when: '2027 H1', state: 'gray' },
  { phase: '5', label: 'One housing association', gate: 'One paid pilot, one tender', moves: ['Resident card beside their repairs system', 'Attendance and confirmation fed back', 'Ombudsman cases as the deck'], when: '2027 H1', state: 'gray' },
  { phase: '6', label: 'Carriers, as a tick-box', gate: 'One carrier pass live', moves: ['A button in their email, AfterShip-style', 'Then energy, broadband, water', 'Then four firms on one card'], when: '2027 H2', state: 'gray' },
]

/** What has shipped, read from CHANGELOG in src/lib/version.js. A fact by construction. */
export const MILESTONES = CHANGELOG
  .filter((r) => /\.0$/.test(r.version))
  .map((r) => ({ version: r.version, date: r.date, note: r.notes[0] }))
  .reverse()

/** Likelihood is a working estimate. */
export const RISKS = [
  { label: 'Apple or Google add visits to Wallet', likelihood: 'medium', answer: 'Service visits, Android, the two-way question. Move fast on the pass', kind: 'estimate' },
  { label: 'Descartes bundles Localz into enterprise deals', likelihood: 'medium', answer: 'Sell under them, one to fifty vans. Be the card their SMS opens', kind: 'estimate' },
  { label: 'ServiceM8 ships its own pass', likelihood: 'high', answer: 'Be their card first. Public standard', kind: 'estimate' },
  { label: 'Free for everyone earns nothing for a year', likelihood: 'high', answer: 'Hosting is pence a card. The Ltd and a raise decision come before the first enterprise', kind: 'estimate' },
  { label: 'The owner has no spare hours', likelihood: 'high', answer: 'The nightly build does the building', kind: 'estimate' },
  { label: 'Apple never signs the pass', likelihood: 'low', answer: 'The link works without it. The card is the upgrade, not the floor', kind: 'estimate' },
  { label: 'Name clash on TurnUp', likelihood: 'medium', answer: 'Trademark check before spending on the name', kind: 'estimate' },
  { label: 'Customer data on a public link', likelihood: 'low', answer: 'Stage only. Answers never leave the device', kind: 'estimate' },
]

/** Who is building it, and what the plan needs from someone who builds apps. */
export const TEAM = [
  { role: 'Owner', what: 'A trade. Customer zero. Decides, tests on real jobs, holds the accounts' },
  { role: 'The nightly build', what: 'One improvement a night, versioned, a diary per build. The owner reads it in the morning' },
  { role: 'Not yet', what: 'Someone who has shipped a wallet pass or an app store listing before' },
]

export const THE_ASK = {
  lead: 'This is being sent to one person who builds apps for a living. The ask is one thing.',
  items: [
    { n: '1', label: 'Read it and say what is wrong', note: 'The three moats, the six moves, the wallet premise. Ten minutes' },
  ],
  notAsking: ['Not asking for money', 'Not asking for code', 'Not asking for a cofounder, yet'],
}

export const DECISIONS = [
  { key: 'pricing', question: 'Who pays?', options: ['Nobody, for now', 'Free for every sender; enterprise per card', 'Trades: a monthly plan', 'Trades: activation, then features'], decided: 'Free for every sender; enterprise per card', decidedAt: '9 Oct 2026', note: 'Third shape of the day. The card has to spread; only an enterprise is already paying for missed visits.' },
  { key: 'firstMoat', question: 'Which moat first?', options: ['The household end', 'Recognition: customer-invite', 'One integration: the API and spec'] },
  { key: 'firstWedge', question: 'First enterprise wedge?', options: ['Social housing', 'Energy supplier', 'Broadband provider', 'Water company'] },
  { key: 'googleWallet', question: 'Google Wallet: build on a pass platform, or our own?', options: ['On a pass platform, faster', 'Our own, like Apple', 'Apple only until there is money'] },
  { key: 'perCard', question: 'Enterprise price per card, pence?', options: ['10', '25', '50'] },
  { key: 'entity', question: 'Which company owns TurnUp?', options: ['New Ltd', 'Existing dormant Ltd', 'Sole trader for now', 'Ask the accountant first'], decided: 'New Ltd', decidedAt: '9 Oct 2026' },
  { key: 'raise', question: 'Raise money at all?', options: ['No, bootstrap', 'Friends and family', 'Angel after the first enterprise pilot', 'Undecided'], decided: 'Undecided', decidedAt: '9 Oct 2026' },
  { key: 'firstTemplate', question: 'First template after ServiceM8?', options: ['Building control', 'RIBA', 'Certificate issued', 'PAS 2035'], decided: 'RIBA', decidedAt: '9 Oct 2026' },
]

export const FACTS_TABLE = [
  ...PROBLEM_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  ...MARKET_STATS.map((s) => ({ figure: s.value, what: s.label, source: s.source, href: s.href, kind: s.kind })),
  { figure: '£30', what: 'Ofgem Guaranteed Standards, per missed energy appointment', source: 'Ofgem, 2015 regulations. Check the current figure before quoting', href: 'https://www.ofgem.gov.uk/publications/british-gas-pays-ps11m-compensate-customers-after-agents-missed-appointments', kind: 'fact' },
  { figure: '£50 / £20', what: 'Ofwat GSS per missed water appointment, England / Wales, from July 2025', source: 'Consumer Council for Water', href: 'https://www.ccw.org.uk/faq/what-standards-are-guaranteed-by-water-and-sewerage-companies/', kind: 'fact' },
  { figure: '£20 to £50', what: 'Housing Ombudsman awards per missed repair appointment', source: 'Ombudsman decisions 2023 to 2024', href: 'https://www.housing-ombudsman.org.uk/decisions/london-borough-of-tower-hamlets-202419479/', kind: 'fact' },
  { figure: '$6.2m', what: 'Descartes paid for Localz, April 2023', source: 'Descartes press release', href: 'https://www.descartes.com/resources/news/descartes-acquires-localz', kind: 'fact' },
  { figure: PLAN_META.liveSince, what: 'Live on getturnup.com', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: `${ROADMAP_COUNTS.live}`, what: 'Roadmap items live today', source: 'src/lib/roadmap.js', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: `${ROADMAP_COUNTS.ready}`, what: 'Built, waiting on a key or an account', source: 'src/lib/roadmap.js', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '79 pounds', what: 'Apple Developer Programme, a year', source: 'docs/apple-wallet.md', href: PLAN_META.walletDocUrl, kind: 'fact' },
  { figure: '0', what: 'Paying customers', source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
  { figure: '1', what: `Businesses using it (${TRADE_NAME})`, source: 'This repository', href: PLAN_META.repoUrl, kind: 'fact' },
]
