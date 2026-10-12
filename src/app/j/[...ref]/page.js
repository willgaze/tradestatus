import { redirect } from 'next/navigation'
import Link from 'next/link'
import { sm8Configured, fetchJob, fetchJobContact, phoneMatches, findOrCreateForJob } from '@/lib/servicem8'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
import Mark from '@/components/Mark'
import Shot from '@/components/Shot'
import Claim from './Claim'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your booking | TurnUp', robots: { index: false, follow: false } }

/**
 * /j/<ServiceM8 job number>            — the link ServiceM8 can write into its
 * /j/<ServiceM8 job number>/<mobile>     own booking text, because its templates
 *                                         know the job number and the mobile and
 *                                         nothing unguessable.
 *
 * A job number on its own is guessable, and a status page carries a first
 * name, an address and where the plumber is. So the number alone shows
 * nothing: the customer proves it is their booking with the last four digits
 * of the mobile ServiceM8 sent the text to, once, and lands on the real page.
 * If the template also wrote the mobile into the link, that check passes on
 * its own and nobody types anything.
 *
 * Drawn like the page it leads to (the glass, the wash, Booked in's tint),
 * with a picture of that page under the box, so the person who just tapped
 * a link from a text can see what the four digits are for before typing.
 */
function Shell({ eyebrow, title, children, picture = false }) {
  return (
    <div className="tone-booked relative min-h-screen">
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
        <Mark className="mx-auto h-12 w-auto" id="claim" />
        {eyebrow && <p className="mt-6 text-center text-[13px] font-semibold uppercase tracking-[0.13em] muted">{eyebrow}</p>}
        <h1 className="mt-2 text-center text-[28px] font-bold leading-tight tracking-[-0.02em]">{title}</h1>
        {children}
        {picture && (
          /* The page the digits unlock. The same card the customer's page draws, from the fixture. */
          <Shot name="stage-booked" label="Then the page is yours" note="The day, the hours, who is coming. It moves as the day does." className="mx-auto mt-8 max-w-[300px]" />
        )}
        <p className="mt-8 text-center text-[13px]" style={{ color: 'var(--label-3)' }}><Link href="/" className="underline">TurnUp</Link></p>
      </main>
    </div>
  )
}

/* A dead end: one line, and the phone number, because that is what is left to do. */
function Stop({ title, children }) {
  return (
    <Shell title={title}>
      <p className="mt-3 text-center text-[16px] leading-snug muted">{children}</p>
      {TRADE_PHONE && (
        <a href={`tel:${TRADE_PHONE_TEL}`} className="btn accent-fill mx-auto mt-6 !px-6">Call {TRADE_PHONE}</a>
      )}
    </Shell>
  )
}

export default async function JobLinkPage({ params }) {
  const { ref = [] } = await params
  const number = String(ref[0] || '').replace(/\D/g, '').slice(0, 12)
  const given = ref[1] ? decodeURIComponent(ref[1]) : ''

  if (!number) return <Stop title="That link is incomplete">Open it exactly as it was sent to you.</Stop>
  if (!sm8Configured()) return <Stop title="Not switched on yet">{TRADE_NAME} has not connected ServiceM8 to TurnUp. Ring and ask where things are.</Stop>

  let job = null
  try { job = await fetchJob({ number }) } catch (e) { console.error('j lookup:', e?.message) ; return <Stop title="Status unavailable right now">Try again in a minute.</Stop> }
  if (!job) return <Stop title="No booking with that number">Check the link in your text, or ring and quote job {number}.</Stop>
  if (job.status === 'Quote') return <Stop title="Not booked in yet">Job {number} is still a quote. Once it is booked, this link shows the day and follows the job.</Stop>
  if (job.status === 'Unsuccessful') return <Stop title="This job was cancelled">If that is a surprise, ring and quote job {number}.</Stop>

  const contact = await fetchJobContact(job.uuid).catch(() => null)
  if (given && phoneMatches(contact, given)) {
    const { tracker } = await findOrCreateForJob(job, contact)
    redirect(`/t/${tracker.code}`)
  }

  return (
    <Shell eyebrow={`${TRADE_NAME} · job ${number}`} title="Is this your booking?" picture>
      <p className="mt-3 text-center text-[16px] leading-snug muted">The last four digits of the mobile the text came to. Once.</p>
      <Claim number={number} />
    </Shell>
  )
}
