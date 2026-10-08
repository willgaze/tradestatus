import Link from 'next/link'
import Mark from '@/components/Mark'
import Waitlist from './Waitlist'
import { STAGE_ORDER, STAGES, stageOf } from '@/lib/trade-status'
import { StageIcon, TickIcon, ChevronIcon } from '@/components/icons'
import Image from 'next/image'
import Device from '@/components/Device'
import WalletHero from '@/components/WalletHero'
import { POSTERS } from '@/lib/posters'

/**
 * The front door — the only page here a stranger is meant to find.
 *
 * It replaced a page that said "open the link you were sent", which was the
 * right page for a customer who had mistyped a tracking link and the wrong one
 * for everybody else: the product had no way of explaining itself to anyone
 * who had not already been sent a link by somebody who already used it. That
 * line is still here, at the bottom, where the person who needs it will find
 * it and nobody else has to read past it.
 *
 * INDEXABLE, and the only page here that is. Every other route carries
 * `robots: { index: false }` — a tracking link must never reach a search
 * index, and neither must the dashboard. A marketing page nobody can find is
 * not a marketing page, so this one opts back in, deliberately and on its own.
 *
 * Still no lookup form, for the reason the old page gave: the code is the only
 * thing standing in front of a customer's name and home address, and a search
 * box is an invitation to guess at other people's.
 */
export const metadata = {
  title: 'TurnUp — your customer always knows where you are',
  description:
    'One link, sent by text. Your customer sees whether you are booked in, on your way, on site or done — '
    + 'without ringing you to ask. No app and no login for them.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'TurnUp — your customer always knows where you are',
    description: 'The status bar the trades never got. One link per job, sent by text.',
    type: 'website',
  },
}

/* The job the pictures show. Same invented job as /demo and the diary, so a
   visitor who taps "See what they see" lands on the page they just looked at. */
const DEMO = {
  stage: 'ON_MY_WAY', jobRef: '2718', customerName: 'Sarah Whitfield',
  jobAddress: 'Church Lane, Burbage SN8', arrivingAt: '2026-10-01T07:00:00.000Z',
}


export default function Home() {
  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-2xl px-5 pb-16 pt-safe">

        {/* --- who this is ------------------------------------------------ */}
        <header className="flex items-center justify-between pt-5">
          {/* The name in words, not only the glyph. Nobody has heard of this
              yet, and a mark on its own teaches a first-time visitor nothing —
              the old page could get away with it because everyone arriving had
              already been sent a link by somebody who knew what it was. */}
          <span className="flex items-center gap-2.5">
            <Mark className="h-8 w-auto" id="top" />
            <span className="text-[21px] font-bold tracking-[-0.02em]">TurnUp</span>
          </span>
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center text-[15px] font-medium"
                style={{ color: 'var(--tint)' }}>
            Sign in
          </Link>
        </header>

        {/* --- the promise, in the customer's words ------------------------ */}
        <section className="mt-12">
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
            Your customer always knows where you are.
          </h1>
          <p className="mt-5 text-[19px] leading-snug muted">
            One link per job, sent by text. They open it and see whether you are booked in, on your way,
            on site or done — without ringing you to find out. No app for them to download and nothing to
            log in to.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#list" className="btn btn-filled !px-6">Get on the list</a>
            <Link href="/demo" className="btn btn-grey !px-6">
              See what they see <ChevronIcon size={16} />
            </Link>
          </div>
        </section>

        {/* --- what it looks like ------------------------------------------
            Shown before it is explained. A page of words about a visual
            product is a page nobody finishes; the two pictures below are the
            customer's phone and the customer's wallet, and they do the rest. */}
        <section className="mt-12 grid items-start gap-8 sm:grid-cols-2">
          <figure className="mx-auto">
            <Device screen="/home/customer-on-my-way.webp" width={250} tilt priority className="mx-auto"
                    alt="The page your customer opens from the text: Hello Sarah, On my way, set off at 08:00, between 09:00 and 11:00" />
            <figcaption className="mt-4 text-center text-[14px] leading-snug muted">
              What they open from the text. No app, no login.
            </figcaption>
          </figure>
          <figure className="mx-auto w-full max-w-[340px]" style={{ '--tint': '#5856d6' }}>
            <WalletHero tracker={DEMO} tradeName="Sam Hale Plumbing" />
            <figcaption className="mt-2.5 text-center text-[14px] leading-snug muted">
              The same job as a card in their wallet, updating on the lock screen.
              Built; waiting on Apple&rsquo;s signing certificate.
            </figcaption>
          </figure>
        </section>

        {/* --- the thing it is actually for -------------------------------- */}
        <section className="glass r-outer mt-12 p-6">
          <p className="text-[17px] leading-relaxed">
            <span className="font-semibold">&ldquo;Someone will be with you between eight and six.&rdquo;</span>
            {' '}Then the customer writes off a day, and rings at eleven, and again at two, and you take
            both calls with your hands full.
          </p>
          <p className="mt-3 text-[17px] leading-relaxed muted">
            Parcels stopped working like that fifteen years ago. The trades never got the same thing —
            not because it is hard, but because it was built for warehouses and nobody built it for a
            van. This is that, for work at somebody&rsquo;s house.
          </p>
        </section>

        {/* --- the five stages, in their real colours ---------------------- */}
        <section className="mt-12">
          <h2 className="text-[26px] font-bold tracking-[-0.02em]">Four words and a reason</h2>
          <p className="mt-2 text-[17px] muted">
            That is the whole vocabulary. A customer who has used it once reads it without reading it.
          </p>
          <ul className="mt-5 grid gap-2.5">
            {[...STAGE_ORDER, 'PAUSED'].map((s) => {
              const st = stageOf(s)
              return (
                <li key={s} className={`tone-${st.tone} glass r-outer flex items-center gap-4 p-4`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                        style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
                    <StageIcon tone={st.tone} size={21} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold">{st.label}</span>
                    <span className="block text-[15px] muted">{STAGES[s].customerLine}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* --- how it goes, as a store listing would tell it ------------------
            Six frames, the grammar of an App Store page: big line, quiet line,
            the device running off the bottom. Rendered from the real screens by
            /preview/posters and captured into public/home/store-N.webp, so they
            are also the artwork for any listing or ad later. */}
        <section className="mt-12">
          <h2 className="text-[26px] font-bold tracking-[-0.02em]">How it goes</h2>
          <p className="mt-2 text-[17px] muted">Swipe through. Every screen is the real thing.</p>
          <ul className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {POSTERS.map((p, i) => (
              <li key={p.n} className="w-[256px] shrink-0 snap-center sm:w-[232px]">
                <Image src={`/home/store-${p.n}.webp`} alt={`${p.head.replace('\n', ' ')} ${p.sub}`}
                       width={1242} height={2688} loading={i < 3 ? 'eager' : 'lazy'} sizes="256px"
                       className="block h-auto w-full rounded-[22px] shadow-[0_18px_40px_-18px_rgba(0,0,0,.5)]" />
              </li>
            ))}
          </ul>
        </section>

        {/* --- the part that is a promise about what it will NOT do --------
            This is not a disclaimer section. It is the reason to trust the
            thing, and on a product whose whole job is telling somebody the
            truth about where you are, it belongs on the front page rather than
            in a policy nobody opens. */}
        <section className="mt-12">
          <h2 className="text-[26px] font-bold tracking-[-0.02em]">What it will never do</h2>
          <ul className="mt-5 grid gap-3">
            {[
              ['It never invents a time.',
               'No countdown, no "with you in 20 minutes". You cannot promise traffic, so it will not promise it for you. '
               + '"On my way" is a fact. "Set off at 07:42" is a record.'],
              ['It never shows a time you have not agreed.',
               'A window is two people arranging something. They can say a time suits, or say what does. '
               + 'Only an agreed one is ever stated as settled.'],
              ['It never puts their details on a link that gets forwarded.',
               'Tracking links get passed into family group chats. What they tell you — which door, whether '
               + 'there is a dog, whether anyone is in — stays with you and their own phone. It is not on the page.'],
            ].map(([title, body]) => (
              <li key={title} className="glass r-outer flex items-start gap-4 p-5">
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--tint)' }}><TickIcon size={20} /></span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold">{title}</span>
                  <span className="mt-1 block text-[16px] leading-snug muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* --- the ask ----------------------------------------------------- */}
        <section id="list" className="mt-12 scroll-mt-6">
          <Waitlist />
        </section>

        {/* --- the page this page replaced --------------------------------- */}
        <section className="glass r-outer mt-10 p-5 text-center">
          <p className="text-[16px] font-semibold">Looking for your own job?</p>
          <p className="mt-1.5 text-[15px] leading-snug muted">
            Open the link your tradesperson sent you by text. Lost it? Ask whoever booked the job to
            send it again — only they can.
          </p>
        </section>

        <footer className="mt-12 text-center">
          <Mark className="mx-auto h-6 w-auto opacity-60" id="foot" />
          <p className="mt-2 text-[13px]" style={{ color: 'var(--label-3)' }}>
            TurnUp — live job tracking for trades
          </p>
        </footer>
      </main>
    </div>
  )
}
