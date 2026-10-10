/**
 * Pricing: free for everyone sending to a home. Enterprise pays per card.
 *
 * Decided by the owner on 9 Oct 2026, after two earlier shapes the same day
 * (a monthly Trade plan, then an activation fee with bundles). Both went,
 * for one reason: the card has to spread, and anything that charges a small
 * sender slows the spread. Only an enterprise pays for cards and for several
 * touch points with a customer, because only an enterprise is already paying
 * for missed appointments.
 *
 *   1. The person WAITING never pays and never has an account.
 *   2. The person SENDING, if they are a home, a trade or a small firm, never
 *      pays either. No cap, no card details, no activation.
 *   3. An ENTERPRISE pays per card at volume: a carrier, an energy supplier, a
 *      broadband provider, a water company, a housing association. They get
 *      the card in both wallets, the update loop, push, SMS fallback, the
 *      privacy rules, their logo, an API and an SLA.
 *
 * Why they pay is not the card. It is the regulator: Ofgem, Ofcom and Ofwat
 * each put a fixed price on a missed appointment, and the Housing Ombudsman
 * rules on them one by one. A card that records the slot was confirmed, the
 * stage was shown and the door was answered is cheaper than one miss.
 *
 * Every figure below is PROPOSED. Nothing is charged today and nothing is
 * wired to a payment provider.
 */

/** Who never pays. */
export const FREE_FOR = [
  { who: 'Homes and families', why: 'A mate dropping something off. Either end can be either' },
  { who: 'One-van trades', why: 'Customer zero. The card is how it spreads' },
  { who: 'Small firms, up to the enterprise line', why: 'A cleaner with four staff is not an enterprise' },
]

/** What is never charged for, whoever sends. */
export const NEVER_CHARGED = [
  'One link per job, four stages',
  'The job itself: name, address, when, notes',
  'Agree the window, do not announce it',
  'Will someone be in?',
  'Which door, the dog, access notes',
  'Add to calendar, text or WhatsApp in one tap',
  'The card in the wallet, when it exists',
]

/** The enterprise line, and what sits above it. */
export const ENTERPRISE = {
  line: 'A firm with a contact centre, a regulator, or more than fifty vans',
  perCardPence: 25,       // decision: 10 / 25 / 50 pence a card
  minimumMonthly: 250,    // placeholder, pounds
  gets: [
    'Their logo and name on the card, both wallets',
    'The update loop: the card changes when the job does',
    'Push to the lock screen, SMS where there is no wallet',
    'The privacy rules, written down and kept',
    'An API their scheduler calls, or a webhook we listen to',
    'Attendance and confirmation records, per visit',
    'An SLA and a person to ring',
  ],
  why: 'A missed appointment already costs them money by regulation. A card costs pence.',
}

/**
 * What a missed appointment costs, by sector, under the rules as found on
 * 9 Oct 2026. These are the sales deck. Each one names who owns the
 * appointment today and the system it lives in, because that is who the
 * card sits beside, not who it replaces.
 */
export const WEDGES = [
  { sector: 'Social housing repairs', perMiss: '£20 to £50', rule: 'Housing Ombudsman rulings, case by case', owns: 'The landlord and its contractor', system: 'Repairs scheduling: Totalmobile and the like', ours: 'The resident card beside their system. Confirmation and attendance fed back', state: 'green',
    href: 'https://www.housing-ombudsman.org.uk/decisions/london-borough-of-tower-hamlets-202419479/' },
  { sector: 'Energy suppliers', perMiss: '£30, and £30 more if unpaid in 10 days', rule: 'Ofgem Guaranteed Standards, 2015 regulations', owns: 'The supplier and its field contractor', system: 'Field service platforms; Localz at British Gas, OVO', ours: 'The customer card their SMS could open. British Gas paid £1.1m in redress for missed appointments', state: 'green',
    href: 'https://www.ofgem.gov.uk/publications/british-gas-pays-ps11m-compensate-customers-after-agents-missed-appointments' },
  { sector: 'Broadband and landline', perMiss: '£32.31 from April 2026, was £25', rule: 'Ofcom automatic compensation; BT, Sky, TalkTalk, Virgin, Zen', owns: 'The provider; Openreach does the visit', system: 'Glympse at Virgin Media, provider portals', ours: 'One card across provider and Openreach, who the customer cannot tell apart', state: 'green',
    href: 'https://selectra.co.uk/tv-broadband/news/broadband-outage-compensation-ofcom-what-provider-owes' },
  { sector: 'Water companies', perMiss: '£50 England, £20 Wales, from July 2025', rule: 'Ofwat Guaranteed Standards Scheme', owns: 'The water company', system: 'Their own scheduling; metering contractors', ours: 'Metering and repair visits. The GSS was just rewritten; the standard is fresh in their minds', state: 'amber',
    href: 'https://www.ccw.org.uk/faq/what-standards-are-guaranteed-by-water-and-sewerage-companies/' },
  { sector: 'White goods and furniture delivery', perMiss: 'No fixed sum. Goodwill vouchers, refunds under the Consumer Rights Act', rule: 'Consumer Rights Act 2015; Which? and MSE guidance', owns: 'The retailer; a two-person delivery crew', system: 'Retailer delivery platforms', ours: 'The slot, the two-person crew and the install on one card. Weaker: no regulator sets the price', state: 'amber',
    href: 'https://www.which.co.uk/news/article/my-sofa.com-delivery-hasnt-turned-up-aKD2b1N8Td6P' },
  { sector: 'Parcel carriers', perMiss: 'Nothing to the recipient. The retailer carries it', rule: 'Contract is with the retailer', owns: 'The carrier', system: 'Follow My Parcel and the carrier apps', ours: 'Last. Offer the pass as a tick-box once the household holds the card for everything else', state: 'gray',
    href: 'https://app.dpdgroup.co.uk/content/products_services/followmyparcel.jsp' },
  { sector: 'Insurance claims and retrofit', perMiss: 'No fixed sum. Four firms, four phone numbers', rule: 'Contractor networks; PAS 2035 for retrofit', owns: 'The insurer or the retrofit coordinator', system: 'Claims platforms; TrustMark lodgement', ours: 'Several firms on one card. The multi-party product, later', state: 'gray',
    href: 'https://github.com/willgaze/tradestatus/blob/main/docs/research/formal-processes.md' },
]

/** Why the line sits where it does. */
export const PRICING_RULES = [
  { rule: 'The waiting end never pays', why: 'No account, no card details, ever' },
  { rule: 'Small senders never pay', why: 'The spread is the product. A free card from the plumber is the enterprise sale' },
  { rule: 'Enterprise pays per card', why: 'Cards are what they send, and what their regulator counts' },
  { rule: 'Price against the miss, not the card', why: 'Ofgem £30, Ofcom £32, Ofwat £50. Pence a card is nothing beside one of those' },
  { rule: 'They buy the integration, not the pass', why: 'Both wallets, the loop, push, SMS, privacy rules, an API. PassKit sells the pass; nobody sells the day' },
  { rule: 'The standard is public', why: 'Adopting TurnUp has to look like adopting a standard, not a vendor' },
]
