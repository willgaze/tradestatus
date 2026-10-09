import Link from 'next/link'
import Image from 'next/image'
import Mark from '@/components/Mark'
import Device from '@/components/Device'
import { sm8Configured } from '@/lib/servicem8'
import { CANONICAL_HOST } from '@/lib/trade'
import { Sm8Window, Sm8Phone, SmsMock, SM8_LINE } from './Sm8Mocks'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Using TurnUp with ServiceM8',
  description: 'How a ServiceM8 job becomes a TurnUp link in the booking text, what moves the card, and how to test it in ten minutes. Every step with the screen.',
}

/**
 * The page a ServiceM8 user reads once. Every sentence has the screen next to
 * it: a real capture where the screen is TurnUp's, a drawing where it is
 * ServiceM8's (nobody's account belongs on a public page, and their help
 * images are theirs). Captures live in public/with-servicem8/ and are made by
 * scripts/capture-with-servicem8.mjs against the seeded local database.
 */
const shot = (name) => `/with-servicem8/${name}.webp`

function Phone({ name, alt, children, width = 210, className = '' }) {
  return <Device screen={name ? shot(name) : undefined} alt={alt} width={width} className={className}>{children}</Device>
}

function Panel({ name, alt, caption, className = '' }) {
  return (
    <figure className={`m-0 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-black/10 shadow-[0_18px_40px_rgba(0,0,0,.14)]">
        <Image src={shot(name)} alt={alt} width={780} height={520} sizes="(min-width: 640px) 360px, 90vw" className="block h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-1.5 text-[12px] muted">{caption}</figcaption>}
    </figure>
  )
}

const Drawn = () => <p className="mt-1.5 text-[12px] muted">Drawn from ServiceM8’s layout, not a screenshot.</p>

/* A step: number, words on the left, the screen on the right (below, on a phone). */
function Step({ n, title, visual, children }) {
  return (
    <li className="glass r-outer p-4 sm:p-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_minmax(0,340px)] sm:items-start">
        <div className="flex gap-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: 'var(--tint)' }}>{n}</span>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold leading-tight">{title}</p>
            <div className="mt-1.5 text-[15px] leading-snug muted">{children}</div>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">{visual}</div>
      </div>
    </li>
  )
}

const STAGES = [
  ['Booked in', 'booked', 'The job is a Work Order in ServiceM8 and the confirmation text has gone. The link works from that moment.', 'sms'],
  ['On my way', 'onway', 'Your tap, on the TurnUp dashboard. ServiceM8 has no event for setting off that the API exposes, so this one stays yours for now.', 'dashboard-stage'],
  ['On site', 'onsite', 'You check in on the ServiceM8 app. TurnUp hears it and moves the card.', 'checkin'],
  ['Paused', 'paused', 'You check out before the job is complete. The card says you are away from site and coming back.', 'checkout'],
  ['Job done', 'done', 'You complete the job in ServiceM8. The card closes the day.', 'complete'],
]

export default function WithServiceM8() {
  const connected = sm8Configured()
  const host = CANONICAL_HOST
  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-16 pt-safe">
        <header className="flex items-center justify-between pt-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="TurnUp home">
            <Mark className="h-8 w-auto" id="top" />
            <span className="text-[21px] font-bold tracking-[-0.02em]">TurnUp</span>
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center text-[15px] font-medium" style={{ color: 'var(--tint)' }}>Dashboard</Link>
        </header>

        {/* --- what you get ------------------------------------------------ */}
        <section className="mt-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.13em] muted">With ServiceM8</p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">Book the job in ServiceM8. The link sends itself.</h1>
          <p className="mt-4 text-[17px] leading-snug muted">
            One line in your booking confirmation text. The customer taps it, proves it is their booking with four digits, and gets a page that follows the job. Nothing else changes about how you use ServiceM8.
          </p>
          <p className="glass r-outer mt-5 inline-flex items-center gap-2 px-3.5 py-2 text-[14px] font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: connected ? '#34c759' : '#ff9500' }} />
            {connected ? 'This TurnUp is connected to a ServiceM8 account' : 'This TurnUp is not connected to ServiceM8 yet'}
          </p>

          <h2 className="mt-10 text-[24px] font-bold tracking-[-0.02em]">What you get</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <figure className="m-0 flex flex-col items-center text-center">
              <Phone alt="The booking text from ServiceM8 with the TurnUp link in it"><SmsMock host={host} /></Phone>
              <figcaption className="mt-4 text-[14px] leading-snug"><b>The text ServiceM8 already sends</b><span className="block muted">now carries a link. You typed nothing.</span></figcaption>
            </figure>
            <figure className="m-0 flex flex-col items-center text-center">
              <Phone name="customer-booked" alt="The customer's page: Booked in, with the day and the window" />
              <figcaption className="mt-4 text-[14px] leading-snug"><b>The customer gets a page</b><span className="block muted">that moves as the day does, instead of ringing to ask.</span></figcaption>
            </figure>
            <figure className="m-0 flex flex-col items-center text-center">
              <Phone name="dashboard-card" alt="The job on the TurnUp dashboard, marked as following the ServiceM8 job" />
              <figcaption className="mt-4 text-[14px] leading-snug"><b>You get the card for free</b><span className="block muted">already on your dashboard, following the job. Check in, check out, complete: it moves itself.</span></figcaption>
            </figure>
          </div>
          <p className="mt-6 text-[15px] leading-snug muted">
            What that buys you: fewer “what time are you coming?” calls, a customer who can see you are on site rather than wondering, and a record of the day they can keep. All from a booking you were already making.
          </p>
        </section>

        {/* --- the one line ------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">The one line</h2>
          <p className="mt-2 text-[16px] muted">The link is your ServiceM8 job number, which every template already knows. The number alone shows nobody anything: the customer types the last four digits of the mobile the text came to, once.</p>
          <ol className="mt-5 grid gap-4">
            <Step n="1" title="Edit your booking confirmation template" visual={<div className="w-full max-w-[340px]"><Sm8Window kind="template" host={host} /><Drawn /></div>}>
              <a href="https://go.servicem8.com/" target="_blank" rel="noopener">ServiceM8 online</a> → Settings → <b>SMS Templates</b> → edit <b>Booking Confirmation</b> (or add one). Replace the message with this, or add the last sentence to yours:
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white/60 p-3.5 font-mono text-[13px] leading-snug text-slate-800 dark:bg-black/30 dark:text-slate-100">{SM8_LINE(host)}</pre>
              The curly fields are ServiceM8’s own and fill themselves in. Keep the link exactly as written.
            </Step>
            <Step n="2" title="Make ServiceM8 send it when you book" visual={<div className="w-full max-w-[340px]"><Sm8Window kind="automation" /><Drawn /></div>}>
              Settings → <b>Automations</b> → <b>Booking Confirmation</b> → switch on, Edit, choose SMS and pick that template.
            </Step>
            <Step n="3" title="Tick it once when you book" visual={<div className="w-full max-w-[340px]"><Sm8Window kind="booking" /><Drawn /></div>}>
              When you schedule a job from the job card (Schedule on the desktop, Add Booking on the app), tick <b>Send Booking Confirmation</b>. ServiceM8 remembers the tick.
              <span className="mt-1.5 block text-[13px]">Dragging a job onto the calendar does not send a confirmation — ServiceM8’s rule, not ours. Book from the job card.</span>
            </Step>
            <Step n="4" title="That is the setup" visual={<Panel name="dashboard-sm8" alt="The ServiceM8 panel on the TurnUp dashboard, listening" caption="Your dashboard, already listening." />}>
              Nothing to add to TurnUp per job. The card appears on your dashboard the moment the customer opens the link, already linked to the job and showing its real state.
            </Step>
          </ol>
        </section>

        {/* --- what moves the card ------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">What moves the card</h2>
          <p className="mt-2 text-[16px] muted">Left, what you do. Right, what the customer sees a minute later.</p>
          <ul className="mt-5 grid gap-4">
            {STAGES.map(([name, cap, how, trigger]) => (
              <li key={name} className="glass r-outer p-4 sm:p-5">
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-[18px] font-bold tracking-[-0.01em]">{name}</p>
                    <p className="mt-1 text-[15px] leading-snug muted">{how}</p>
                  </div>
                  <div className="flex items-end justify-center gap-4 sm:justify-end">
                    {trigger === 'dashboard-stage' && <figure className="m-0 text-center"><Phone name="dashboard-stage" alt="The stage buttons on the TurnUp dashboard" width={150} /><figcaption className="mt-2 text-[11px] muted">Your dashboard</figcaption></figure>}
                    {trigger === 'sms' && <figure className="m-0 text-center"><Phone alt="The booking text with the link" width={150}><SmsMock host={host} /></Phone><figcaption className="mt-2 text-[11px] muted">The text, from ServiceM8</figcaption></figure>}
                    {trigger && trigger !== 'dashboard-stage' && trigger !== 'sms' && <figure className="m-0 text-center"><Phone alt={`The ServiceM8 app: ${trigger}`} width={150}><Sm8Phone kind={trigger} /></Phone><figcaption className="mt-2 text-[11px] muted">ServiceM8 app, drawn</figcaption></figure>}
                    {trigger && <span className="pb-16 text-[22px] muted">→</span>}
                    <figure className="m-0 text-center"><Phone name={`customer-${cap}`} alt={`The customer's page showing ${name}`} width={150} /><figcaption className="mt-2 text-[11px] muted">Customer’s page</figcaption></figure>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] muted">Nothing ServiceM8 sends is taken on trust. Every event is checked against the job itself, and the customer opening their page pulls the truth too, so a missed webhook costs a minute, not a wrong card.</p>
        </section>

        {/* --- test it ------------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">Test it in ten minutes</h2>
          <ol className="mt-5 grid gap-4">
            <Step n="1" title="Make a test job for yourself" visual={<Phone alt="A ServiceM8 job card" width={170}><Sm8Phone kind="job" /></Phone>}>New job in ServiceM8, you as the contact with your own mobile, any address.</Step>
            <Step n="2" title="Book it from the job card" visual={<div className="w-full max-w-[340px]"><Sm8Window kind="booking" /><Drawn /></div>}>Schedule → pick a time → tick Send Booking Confirmation → Save. The text arrives within a few minutes.</Step>
            <Step n="3" title="Tap the link on your phone" visual={<div className="flex items-end gap-3"><Phone alt="The text with the link" width={150}><SmsMock host={host} from="Your firm" /></Phone><Phone name="claim" alt="TurnUp asking for the last four digits of the mobile" width={150} /></div>}>
              Type the last four digits of your mobile. You land on the customer page: Booked in, with the day on it. Open the <Link href="/dashboard">dashboard</Link>: the job is there, linked.
            </Step>
            <Step n="4" title="Work the job in the ServiceM8 app" visual={<div className="flex items-end gap-3"><Phone alt="ServiceM8 app, Check In" width={150}><Sm8Phone kind="checkin" /></Phone><Phone name="customer-onsite" alt="The customer's page showing On site" width={150} /></div>}>
              Check in → the page says On site within a minute. Check out → Paused. Complete → Job done. Set off is your tap on the dashboard.
            </Step>
            <Step n="5" title="Watch it happen" visual={<Panel name="dashboard-lately" alt="The Lately log on the ServiceM8 panel" caption="Every event received, and what it did." />}>
              Dashboard → ServiceM8 → <b>Lately</b> lists every event received and what it did. If a stage does not move, that log says why.
            </Step>
          </ol>
        </section>

        {/* --- not yet ------------------------------------------------------- */}
        <section className="mt-14">
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">What it does not do yet</h2>
          <ul className="mt-4 grid gap-4">
            <li className="glass r-outer p-4 sm:p-5">
              <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div><p className="text-[16px] font-semibold">On my way from ServiceM8’s own text.</p><p className="mt-1 text-[15px] leading-snug muted">When you press Navigate in the app, ServiceM8 sends its “on the way” SMS. Reading that to move the card is the next build, once the connector has run on real jobs.</p></div>
                <figure className="m-0 text-center"><Phone alt="ServiceM8 app, Navigate" width={130}><Sm8Phone kind="navigate" /></Phone><figcaption className="mt-2 text-[11px] muted">Next</figcaption></figure>
              </div>
            </li>
            <li className="glass r-outer px-4 py-3.5 text-[15px] leading-snug muted"><b>Jobs you booked before today.</b> They work the moment a customer opens a link, or you add them on the dashboard by job number. Nothing is created behind your back.</li>
            <li className="glass r-outer px-4 py-3.5 text-[15px] leading-snug muted"><b>Quotes.</b> The link says “not booked in yet” until the job is a Work Order.</li>
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
