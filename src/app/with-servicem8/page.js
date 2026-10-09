import Link from 'next/link'
import Mark from '@/components/Mark'
import { sm8Configured } from '@/lib/servicem8'
import { CANONICAL_HOST } from '@/lib/trade'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Using TurnUp with ServiceM8',
  description: 'How a ServiceM8 job becomes a TurnUp link in the booking text, what moves the card, and how to test it in ten minutes.',
}

/**
 * The page a ServiceM8 user reads once, then never again. It says what the
 * connector does in its current form, gives the exact booking text to paste
 * into ServiceM8, and a ten-minute test. No roadmap here: only what works.
 */
const TEMPLATE = (host) =>
  `Hi {job.contact_first}, your booking with {vendor.name} is confirmed for {job.next_booking_date}, arriving {job.next_booking_time}. Follow the job here — it moves as the day does: https://${host}/j/{job.generated_job_id}  — {calculation.current_user_first}`

const STAGES = [
  ['Booked in', 'The job is a Work Order in ServiceM8. The link works from the moment it is booked.'],
  ['On my way', 'Your tap, on the TurnUp dashboard. ServiceM8 has no event for setting off that the API exposes, so this one stays yours — for now. The dashboard is one tap on the phone.'],
  ['On site', 'You check in on the ServiceM8 app. TurnUp hears it and moves the card.'],
  ['Paused', 'You check out before the job is complete. The card says you are away from site and coming back.'],
  ['Job done', 'You complete the job in ServiceM8. The card closes the day.'],
]

function Step({ n, title, children }) {
  return (
    <li className="glass r-outer flex gap-4 p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: 'var(--tint)' }}>{n}</span>
      <div className="min-w-0">
        <p className="text-[16px] font-semibold leading-tight">{title}</p>
        <div className="mt-1.5 text-[15px] leading-snug muted">{children}</div>
      </div>
    </li>
  )
}

export default function WithServiceM8() {
  const connected = sm8Configured()
  const host = CANONICAL_HOST
  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-2xl px-5 pb-16 pt-safe">
        <header className="flex items-center justify-between pt-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="TurnUp home">
            <Mark className="h-8 w-auto" id="top" />
            <span className="text-[21px] font-bold tracking-[-0.02em]">TurnUp</span>
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center text-[15px] font-medium" style={{ color: 'var(--tint)' }}>Dashboard</Link>
        </header>

        <section className="mt-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.13em] muted">With ServiceM8</p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">Book the job in ServiceM8. The link sends itself.</h1>
          <p className="mt-4 text-[17px] leading-snug muted">
            One line in your booking confirmation text. The customer taps it, proves it is their booking with four digits, and gets a page that follows the job: check in and it says On site, complete it and it says Job done. Nothing else changes about how you use ServiceM8.
          </p>
          <p className="glass r-outer mt-5 inline-flex items-center gap-2 px-3.5 py-2 text-[14px] font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: connected ? '#34c759' : '#ff9500' }} />
            {connected ? 'This TurnUp is connected to a ServiceM8 account' : 'This TurnUp is not connected to ServiceM8 yet'}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">The one line</h2>
          <p className="mt-2 text-[16px] muted">The link is your ServiceM8 job number, which every template already knows. The number alone shows nobody anything: the customer types the last four digits of the mobile the text came to, once.</p>
          <ol className="mt-5 grid gap-3">
            <Step n="1" title="Edit your booking confirmation template">
              <a href="https://go.servicem8.com/" target="_blank" rel="noopener">ServiceM8 online</a> → Settings → <b>SMS Templates</b> → edit <b>Booking Confirmation</b> (or add one). Replace the message with this, or add the last sentence to yours:
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white/60 p-3.5 font-mono text-[13px] leading-snug text-slate-800 dark:bg-black/30 dark:text-slate-100">{TEMPLATE(host)}</pre>
              The curly fields are ServiceM8’s own and fill themselves in. Keep the link exactly as written.
            </Step>
            <Step n="2" title="Make ServiceM8 send it when you book">
              Settings → <b>Automations</b> → <b>Booking Confirmation</b> → switch on, Edit, choose SMS and pick that template. Then, when you schedule a job from the job card (Schedule on the desktop, Add Booking on the app), tick <b>Send Booking Confirmation</b>. ServiceM8 remembers the tick.
              <span className="mt-1.5 block text-[13px]">Dragging a job onto the calendar does not send a confirmation — ServiceM8’s rule, not ours. Book from the job card.</span>
            </Step>
            <Step n="3" title="That is the setup">
              Nothing to add to TurnUp per job. The card appears on your dashboard the moment the customer opens the link, already linked to the job and showing its real state.
            </Step>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">What moves the card</h2>
          <ul className="mt-4 grid gap-2">
            {STAGES.map(([name, how]) => (
              <li key={name} className="glass r-outer flex items-start gap-3 px-4 py-3.5">
                <span className="w-24 shrink-0 text-[15px] font-semibold">{name}</span>
                <span className="text-[15px] leading-snug muted">{how}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] muted">Nothing ServiceM8 sends is taken on trust. Every event is checked against the job itself, and the customer opening their page pulls the truth too, so a missed webhook costs a minute, not a wrong card.</p>
        </section>

        <section className="mt-12">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">Test it in ten minutes</h2>
          <ol className="mt-5 grid gap-3">
            <Step n="1" title="Make a test job for yourself">New job in ServiceM8, you as the contact with your own mobile, any address.</Step>
            <Step n="2" title="Book it from the job card">Schedule → pick a time → tick Send Booking Confirmation → Save. The text arrives within a few minutes.</Step>
            <Step n="3" title="Tap the link on your phone">Type the last four digits of your mobile. You land on the customer page: Booked in, with the day on it. Open the <Link href="/dashboard">dashboard</Link>: the job is there, linked.</Step>
            <Step n="4" title="Work the job in the ServiceM8 app">Check in → the page says On site within a minute. Check out → Paused. Complete → Job done. Set off is your tap on the dashboard.</Step>
            <Step n="5" title="Watch it happen">Dashboard → ServiceM8 → <b>Lately</b> lists every event received and what it did. If a stage does not move, that log says why.</Step>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">What it does not do yet</h2>
          <ul className="mt-4 grid gap-2 text-[15px] leading-snug muted">
            <li className="glass r-outer px-4 py-3.5"><b className="text-[var(--ink,inherit)]">On my way from ServiceM8’s own text.</b> When you press Navigate in the app, ServiceM8 sends its “on the way” SMS. Reading that to move the card is the next build, once the connector has run on real jobs.</li>
            <li className="glass r-outer px-4 py-3.5"><b>Jobs you booked before today.</b> They work the moment a customer opens a link, or you add them on the dashboard by job number. Nothing is created behind your back.</li>
            <li className="glass r-outer px-4 py-3.5"><b>Quotes.</b> The link says “not booked in yet” until the job is a Work Order.</li>
          </ul>
        </section>

        <footer className="mt-12 text-center">
          <Mark className="mx-auto h-6 w-auto opacity-60" id="foot" />
          <p className="mt-2 text-[13px]" style={{ color: 'var(--label-3)' }}>TurnUp — live job tracking for trades</p>
        </footer>
      </main>
    </div>
  )
}
