import Link from 'next/link'
import { placeByCode, cardShape } from '@/lib/arrivals'
import { nearDay, timeOnly, dayAndMonth } from '@/lib/when'
import { TRADE_NAME } from '@/lib/trade'
import Mark from '@/components/Mark'
import { VanIcon, TickIcon, ClockIcon, HouseIcon, ChevronIcon } from '@/components/icons'

/**
 * The household card: everything coming to one door.
 *
 * The second half of the product. A job page answers "where is my plumber".
 * This answers "what is happening at my house this week" — the plumber, the
 * sofa, four parcels, in one list, because that is how the person living there
 * already thinks about it. A card that splits parcels from trades makes them
 * do the merging in their head.
 *
 * Same credential rules as a job page: the code in the URL is the only thing
 * standing in front of it, so it is unguessable, revocable, and never indexed.
 * Nothing on this page is anything the household told us — it is all things
 * other people said were coming to them.
 */
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Coming to your door | TurnUp', robots: { index: false, follow: false } }

// Arrival stages borrow the job stages' colours rather than inventing a second
// palette. A customer who has used a TurnUp job link already knows amber means
// something is wrong and green means it is finished; teaching them a second
// set of colours for the same five ideas would be worse than useless.
const TONE = {
  ORDERED: 'tone-booked',
  BOOKED: 'tone-booked',
  ON_THE_WAY: 'tone-onway',
  OUT_FOR_DELIVERY: 'tone-onway',
  MISSED: 'tone-paused',
  DONE: 'tone-done',
}

const LABEL = {
  ORDERED: 'Ordered',
  BOOKED: 'Booked in',
  ON_THE_WAY: 'On the way',
  OUT_FOR_DELIVERY: 'Out for delivery',
  MISSED: 'They missed you',
  DONE: 'Arrived',
}

/**
 * When it is expected, always attributed.
 *
 * "Evri said Tuesday", never "Tuesday". The product does not work out arrival
 * times and does not want to look as though it has — the words came from the
 * carrier and the card says so, exactly as a trade's proposed window says
 * whose it is.
 */
function Expected({ a }) {
  if (!a.expectedFor && !a.windowSaid) return null
  const hours = a.windowStart && a.windowEnd
    ? `${timeOnly(a.windowStart)}–${timeOnly(a.windowEnd)}`
    : a.windowSaid
  // Somebody always said it. A carrier's own words carry the carrier's name; a
  // row the trade put here is the trade speaking, so it carries theirs. An
  // unattributed date would read as the product working out an arrival, which
  // it never does.
  const who = a.carrier || (a.source === 'TRADE' ? TRADE_NAME : null)
  return (
    <p className="mt-1.5 text-[15px] font-semibold" style={{ color: 'var(--tint)' }}>
      {who ? `${who} said ` : 'Expected '}
      {a.expectedFor ? nearDay(a.expectedFor) : ''}{hours ? `, ${hours}` : ''}
    </p>
  )
}

function Row({ a }) {
  const done = a.stage === 'DONE'
  return (
    <li className={`${TONE[a.stage] || 'tone-booked'} glass r-outer p-4 ${done ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px]"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
          {a.kind === 'SERVICE' ? <HouseIcon size={19} /> : <VanIcon size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tint)' }}>
            {LABEL[a.stage] || a.stage}
          </p>
          <p className="mt-0.5 text-[17px] font-semibold leading-snug">{a.title}</p>
          {a.carrier && !a.expectedFor && !a.windowSaid && (
            <p className="text-[15px] muted">{a.carrier}</p>
          )}
          <Expected a={a} />
          {a.reference && (
            <p className="mt-1 break-all font-mono text-[12px]" style={{ color: 'var(--label-3)' }}>{a.reference}</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {/* A live TurnUp job gets the real page, not a flat row: that one
                has the stage the trade is actually tapping. */}
            {a.tradeStatusCode && (
              <Link href={`/t/${a.tradeStatusCode}`} className="btn btn-tinted !min-h-[40px] !px-4 !text-[14px]">
                Follow it live <ChevronIcon size={14} />
              </Link>
            )}
            {a.trackUrl && (
              <a href={a.trackUrl} target="_blank" rel="noreferrer"
                 className="btn btn-grey !min-h-[40px] !px-4 !text-[14px]">
                Track with {a.carrier}
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default async function HouseholdCard({ params }) {
  const { code } = await params
  const place = await placeByCode(code)

  if (!place) {
    return (
      <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
        <div className="stage-wash" aria-hidden="true" />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
          <Mark className="mx-auto h-12 w-auto" id="gone" />
          <h1 className="mt-5 text-[24px] font-bold">That card has expired</h1>
          <p className="mt-2 text-[17px] muted">Ask whoever set it up to send you a new link.</p>
        </main>
      </div>
    )
  }

  const card = cardShape(place)
  const coming = card.arrivals.filter((a) => a.stage !== 'DONE')
  const settled = card.arrivals.filter((a) => a.stage === 'DONE')

  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-xl px-4 pb-16 pt-safe">
        <header className="pt-6">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--mts-accent)' }}>
            {card.label || 'Your door'}
          </p>
          <h1 className="mt-1 text-[32px] font-bold leading-tight tracking-[-0.02em]">
            {coming.length === 0
              ? 'Nothing on its way'
              : `${coming.length} thing${coming.length === 1 ? '' : 's'} coming`}
          </h1>
          <p className="mt-1.5 text-[16px] leading-snug muted">
            Parcels, deliveries and anyone booked to call round. Forward the emails and they land here.
          </p>
        </header>

        {coming.length > 0 && (
          <ul className="mt-6 grid gap-3">
            {coming.map((a, i) => <Row key={`${a.title}-${i}`} a={a} />)}
          </ul>
        )}

        {coming.length === 0 && (
          <div className="glass r-outer mt-6 p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full"
                  style={{ color: 'var(--mts-accent)', background: 'color-mix(in srgb, var(--mts-accent) 13%, transparent)' }}>
              <ClockIcon size={22} />
            </span>
            <p className="mt-3 text-[17px] font-semibold">Nothing due</p>
            <p className="mt-1 text-[16px] leading-snug muted">
              When a delivery or a booking email is forwarded here, it turns up on this card.
            </p>
          </div>
        )}

        {settled.length > 0 && (
          <>
            <h2 className="mt-9 text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--label-3)' }}>
              Arrived
            </h2>
            <ul className="mt-3 grid gap-2.5">
              {settled.map((a, i) => (
                <li key={`${a.title}-done-${i}`} className="tone-done glass r-outer flex items-center gap-3 p-3.5">
                  <span className="shrink-0" style={{ color: 'var(--tint)' }}><TickIcon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{a.title}</span>
                    <span className="block text-[14px] muted">
                      {a.carrier}{a.updatedAt ? ` · ${dayAndMonth(a.updatedAt)}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <footer className="mt-12 text-center">
          <span className="inline-flex items-center gap-2 opacity-60">
            <Mark className="h-4 w-auto" id="hfoot" />
            <span className="text-[12px] muted">Everything coming to your door, by TurnUp</span>
          </span>
        </footer>
      </main>
    </div>
  )
}
