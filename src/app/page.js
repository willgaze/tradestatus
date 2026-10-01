import Link from 'next/link'
import Mark from '@/components/Mark'
import Waitlist from './Waitlist'
import { STAGE_ORDER, STAGES, stageOf } from '@/lib/trade-status'
import { StageIcon, TickIcon, MessageIcon, PinIcon, BellIcon, ChevronIcon } from '@/components/icons'

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

const STEPS = [
  { icon: <MessageIcon size={20} />, title: 'Book the job, send the link',
    body: 'One tap sends a text with their link in it. They open it — no app, no account, no password.' },
  { icon: <PinIcon size={20} />, title: 'Tap the stage as the day goes',
    body: 'Booked in, on my way, on site, done. Five buttons on your phone, one-handed, next to the van.' },
  { icon: <BellIcon size={20} />, title: 'Their page changes as you tap',
    body: 'They stop ringing to ask, because the answer is already on their phone.' },
  { icon: <TickIcon size={20} />, title: 'Running late? Say so once',
    body: 'Pause it with a reason — "waiting on the cylinder" — and everyone waiting on you reads it.' },
]

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

        {/* --- how a day goes ---------------------------------------------- */}
        <section className="mt-12">
          <h2 className="text-[26px] font-bold tracking-[-0.02em]">How it goes</h2>
          <ol className="mt-5 grid gap-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="glass r-outer flex items-start gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[15px] font-bold"
                      style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 13%, transparent)' }}>
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold">{step.title}</span>
                  <span className="mt-1 block text-[16px] leading-snug muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
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
