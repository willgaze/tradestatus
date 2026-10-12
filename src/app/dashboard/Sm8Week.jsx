'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarIcon, MessageIcon } from '@/components/icons'
import { dayAndTime, timeOnly } from '@/lib/when'
import { CANONICAL_HOST, TRADE_NAME } from '@/lib/trade'

/**
 * This week in ServiceM8. The question the trade actually asks on a Sunday
 * night: what is booked, did the link go, has it been opened, is the card
 * ready. ServiceM8 holds the answers (its own email and SMS history) and this
 * reads them; nothing here guesses. Where ServiceM8 sent nothing, the fix is
 * one tap: Text the link opens Messages with the number and the words in.
 */
const first = TRADE_NAME.split(' ')[0]

export default function Sm8Week() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)

  const load = useCallback(async (fresh = false) => {
    setError(null)
    try {
      const r = await fetch(`/api/dashboard/servicem8/week${fresh ? '?fresh=1' : ''}`)
      const j = await r.json().catch(() => ({}))
      if (!r.ok) setError(j.error === 'sm8_key_rejected' ? 'ServiceM8 rejected the key.' : 'ServiceM8 did not answer.')
      else setData(j)
    } catch { setError('ServiceM8 did not answer.') }
  }, [])
  useEffect(() => { load() }, [load])

  if (data && !data.configured) return null
  if (data && data.bookings.length === 0 && !error) return null

  const makeCard = async (b) => {
    setBusy(b.jobUuid)
    try { await fetch('/api/dashboard/servicem8/week', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobUuid: b.jobUuid }) }); await load(true) }
    finally { setBusy(null) }
  }
  const smsHref = (b) => {
    const to = String(b.mobile || b.phone || '').replace(/\s+/g, '')
    const when = b.start ? `${dayAndTime(b.start)}${b.end ? ` to ${timeOnly(b.end)}` : ''}` : 'as booked'
    const body = `Hi ${(b.customerName || '').split(' ')[0] || 'there'}, ${first} here from ${TRADE_NAME}. Your booking is ${when}. Follow the job here — it says when I set off, when I arrive and when I am done, and has the booking terms: https://${CANONICAL_HOST}/j/${b.jobNumber}`
    return `sms:${to}${to ? '?&' : '?'}body=${encodeURIComponent(body)}`
  }
  const tone = (v) => v.startsWith('texted') ? 'var(--stage-done)' : v.startsWith('emailed, opened') ? 'var(--stage-done)' : v === 'nothing sent' || v.includes('bounced') ? '#ff3b30' : '#ff9500'

  return (
    <section className="glass r-outer mt-6 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl" style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}><CalendarIcon size={19} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold">This week in ServiceM8</p>
          <p className="text-[13px] muted">{data ? `${data.bookings.length} booking${data.bookings.length === 1 ? '' : 's'} in the next ${data.days} days · what ServiceM8 sent, read from ServiceM8` : error || 'Asking ServiceM8…'}</p>
        </div>
        <button type="button" onClick={() => load(true)} className="btn btn-grey !min-h-[36px] !px-3 !text-[13px]">Refresh</button>
      </div>
      {data && (
        <ul className="mt-3 divide-y hairline">
          {data.bookings.map((b) => {
            const c = b.confirmation
            return (
              <li key={`${b.jobUuid}-${b.start}`} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-[15px] font-semibold">{dayAndTime(b.start)}{b.end ? `–${timeOnly(b.end)}` : ''} · {b.customerName || 'No contact'}{b.jobNumber ? ` · #${b.jobNumber}` : ''}</p>
                  <p className="text-[13px] font-semibold" style={{ color: tone(c.verdict) }}>
                    {c.verdict === 'nothing sent' ? 'Link not sent' : `Link ${c.verdict}`}
                  </p>
                </div>
                <p className="mt-0.5 text-[13px] muted">{[b.jobSummary, b.jobAddress].filter(Boolean).join(' — ')}</p>
                <p className="mt-0.5 text-[12px] muted">
                  {c.linkTexted && `Texted ${timeOnly(c.textedAt)}. `}
                  {c.linkEmailed && `Emailed ${dayAndTime(c.emailedAt)}${c.emailOpened ? `, opened ${dayAndTime(c.openedAt)}` : c.emailBounced ? ', bounced' : ', not opened yet'}. `}
                  {!c.linkTexted && !c.linkEmailed && (c.smsCount || c.emailCount ? 'ServiceM8 sent something, but not the link. ' : 'ServiceM8 sent no confirmation. Only a booking made from the job card with Send Booking Confirmation ticked sends one, and it only texts if the automation’s text method is ticked. ')}
                  {b.card ? `Card ready (${b.card.stage.toLowerCase().replace('_', ' ')}), opened ${b.card.opened} time${b.card.opened === 1 ? '' : 's'}${b.card.termsAgreed ? ', terms agreed' : ''}${b.card.reply ? `, replied ${b.card.reply.toLowerCase().replace('_', ' ')}` : ''}.` : 'No card yet: it appears when they open the link, or make it now.'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(b.mobile || b.phone) && b.jobNumber && (
                    <a href={smsHref(b)} className="btn accent-fill !min-h-[38px] !px-3.5 !text-[13px]"><MessageIcon size={15} /> {c.linkTexted ? 'Text the link again' : 'Text the link'}</a>
                  )}
                  {!b.card && <button type="button" onClick={() => makeCard(b)} disabled={busy === b.jobUuid} className="btn btn-grey !min-h-[38px] !px-3.5 !text-[13px]">{busy === b.jobUuid ? '…' : 'Make the card now'}</button>}
                  {b.card && <a href={`/t/${b.card.code}`} target="_blank" rel="noreferrer" className="btn btn-grey !min-h-[38px] !px-3.5 !text-[13px]">Open their page</a>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
