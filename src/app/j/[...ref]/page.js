import { redirect } from 'next/navigation'
import Link from 'next/link'
import { sm8Configured, fetchJob, fetchJobContact, phoneMatches, findOrCreateForJob } from '@/lib/servicem8'
import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'
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
 */
function Shell({ title, children }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-4 text-slate-600">{children}</div>
      {TRADE_PHONE && (
        <a href={`tel:${TRADE_PHONE_TEL}`} className="mx-auto mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">
          Call {TRADE_PHONE}
        </a>
      )}
      <p className="mt-8 text-sm text-slate-400"><Link href="/" className="underline">TurnUp</Link></p>
    </main>
  )
}

export default async function JobLinkPage({ params }) {
  const { ref = [] } = await params
  const number = String(ref[0] || '').replace(/\D/g, '').slice(0, 12)
  const given = ref[1] ? decodeURIComponent(ref[1]) : ''

  if (!number) return <Shell title="That link is incomplete">Open the link exactly as it was sent to you.</Shell>
  if (!sm8Configured()) return <Shell title="Not switched on yet">{TRADE_NAME} has not connected ServiceM8 to TurnUp. Ring and someone will tell you where things are.</Shell>

  let job = null
  try { job = await fetchJob({ number }) } catch (e) { console.error('j lookup:', e?.message) ; return <Shell title="Status unavailable right now">Try again in a minute.</Shell> }
  if (!job) return <Shell title="No booking with that number">Check the link in your text, or ring and quote job {number}.</Shell>
  if (job.status === 'Quote') return <Shell title="Not booked in yet">Job {number} is still a quote. Once it is booked, this link will show the day and follow the job.</Shell>
  if (job.status === 'Unsuccessful') return <Shell title="This job was cancelled">If that is a surprise, ring and quote job {number}.</Shell>

  const contact = await fetchJobContact(job.uuid).catch(() => null)
  if (given && phoneMatches(contact, given)) {
    const { tracker } = await findOrCreateForJob(job, contact)
    redirect(`/t/${tracker.code}`)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-slate-500">{TRADE_NAME} · job {number}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight">Is this your booking?</h1>
      <p className="mt-3 text-[16px] leading-snug text-slate-600">
        Type the last four digits of the mobile this text was sent to. Once, and then the page is yours.
      </p>
      <Claim number={number} />
      <p className="mt-8 text-sm text-slate-400"><Link href="/" className="underline">TurnUp</Link></p>
    </main>
  )
}
