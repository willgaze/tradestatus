/**
 * A day's work, in a local database, so the dashboard can be looked at.
 *
 *   bash scripts/local-db.sh        # starts Postgres and runs this
 *
 * Every name, address and phone number below is invented. Nothing here ever
 * runs against the real database: it refuses unless DATABASE_URL points at
 * localhost, because a seed that wipes a live table is a seed that does it
 * exactly once.
 *
 * The jobs are deliberately not all tidy. A real Thursday has one job that is
 * finished, one running, one paused on a part that has not turned up, one with
 * a window the customer has countered and not had answered, and one booked for
 * next week that nobody has touched. A dashboard that only ever gets looked at
 * with neat data is a dashboard whose awkward states nobody has seen.
 */
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL || ''
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error('Refusing to seed: DATABASE_URL is not a local database.')
  process.exit(1)
}

const prisma = new PrismaClient()
const day = (offset, hour = 9) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, 0, 0, 0)
  return d
}

const JOBS = [
  {
    code: 'K7M4PQRT', customerName: 'Sarah Whitfield', customerPhone: '07700 900412',
    jobRef: '2718', jobAddress: '14 Church Lane, Burbage SN8 3AQ',
    jobSummary: 'Unvented cylinder swap', stage: 'ON_SITE',
    stageNote: 'Old cylinder is out. Starting on the new one now.',
    scheduledFor: day(0), arrivingAt: day(0, 8), position: 2,
    windowStart: day(0, 9), windowEnd: day(0, 11), windowState: 'AGREED', windowBy: 'TRADE', windowAt: day(-1, 17),
    presence: 'IN', presenceAt: day(0, 7), doorToUse: 'SIDE', petsOnSite: true,
    accessNotes: 'Gate sticks. Park on the verge, not the drive.',
    events: [['BOOKED', 'Booked in for Thursday.', day(-3, 14)],
             ['ON_MY_WAY', null, day(0, 8)],
             ['ON_SITE', null, day(0, 9)]],
  },
  {
    code: 'B3XN8WHF', customerName: 'Mr & Mrs Doherty', customerPhone: '07700 900188',
    jobRef: '2716', jobAddress: '3 Mill Cottages, Pewsey SN9 5LW',
    jobSummary: 'Bathroom install — second fix', stage: 'PAUSED',
    stageNote: 'Waiting on the basin. Merchant has it Monday.',
    scheduledFor: day(0), position: 1,
    events: [['BOOKED', null, day(-7, 11)], ['ON_SITE', null, day(-1, 8)], ['PAUSED', 'Waiting on the basin.', day(-1, 15)]],
  },
  {
    code: 'QF52MDKR', customerName: 'Janet Pryce', customerPhone: '07700 900733',
    jobRef: '2719', jobAddress: 'The Old Forge, Oare SN8 4JQ',
    jobSummary: 'Leaking rad valve', stage: 'BOOKED',
    scheduledFor: day(1),
    // The customer has asked for different hours and nobody has answered yet.
    // The row that should be shouting on the dashboard.
    windowStart: day(1, 14), windowEnd: day(1, 16), windowState: 'PROPOSED', windowBy: 'CUSTOMER',
    windowNote: 'School run until half one, sorry.', windowAt: day(0, 7),
    presence: 'BACK_SOON', presenceAt: day(0, 7),
    events: [['BOOKED', null, day(-1, 16)]],
  },
  {
    code: 'TW9HJ4CN', customerName: 'Alan Beck', customerPhone: '07700 900051',
    jobRef: '2714', jobAddress: '22 Kennet Place, Hungerford RG17 0BZ',
    jobSummary: 'Outside tap', stage: 'DONE',
    scheduledFor: day(-1), arrivingAt: day(-1, 13),
    events: [['BOOKED', null, day(-5, 9)], ['ON_MY_WAY', null, day(-1, 13)],
             ['ON_SITE', null, day(-1, 14)], ['DONE', 'All done, tested, no leaks.', day(-1, 15)]],
  },
  {
    code: 'ZD6RVB8M', customerName: 'Priya Raman', customerPhone: '07700 900620',
    jobRef: '2721', jobAddress: 'Flat 2, 8 High Street, Marlborough SN8 1AA',
    jobSummary: 'Quote — full bathroom', stage: 'BOOKED',
    scheduledFor: day(6),
    events: [['BOOKED', null, day(0, 6)]],
  },
]

const run = async () => {
  await prisma.tradeStatusEvent.deleteMany({})
  await prisma.tradeStatus.deleteMany({})

  for (const { events, ...job } of JOBS) {
    const row = await prisma.tradeStatus.create({ data: job })
    for (const [stage, note, createdAt] of events) {
      await prisma.tradeStatusEvent.create({ data: { tradeStatusId: row.id, stage, note, createdAt } })
    }
    console.log(`  ${job.code}  ${job.stage.padEnd(9)} ${job.customerName}`)
  }

  await prisma.tradeProfile.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton', engineerName: 'Sam Hale', aboutLine: 'Twelve years on the tools',
      vehicleReg: 'SH21 VAN', vehicleMake: 'Vauxhall', vehicleModel: 'Vivaro', vehicleColour: 'White',
    },
    update: {},
  })
  console.log('\nSeeded. Dashboard password: whatever OPERATOR_PASSWORD is set to.')
}

run().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
