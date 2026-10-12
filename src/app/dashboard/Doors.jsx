'use client'

import { useCallback, useEffect, useState } from 'react'
import { HouseIcon, CopyIcon, PlusIcon, LinkOffIcon } from '@/components/icons'

/**
 * Household cards: one door, everything coming to it.
 *
 * A job link answers "where is my plumber". A household card answers "what is
 * happening at my house this week" — the plumber, the sofa, four parcels, in
 * one list, because that is how the person living there already thinks about
 * it. The trade makes the card and sends the link; the household forwards
 * their own delivery emails to the address and fills it themselves.
 *
 * TWO SECRETS, AND THEY DO DIFFERENT JOBS. Mixing them up is the thing to
 * avoid, so the panel labels both:
 *
 *   the link   — read. Goes to the customer. Shows what is coming.
 *   the inbox  — write. Goes into a mail rule. Puts things on the card.
 *
 * Both live here because here is behind a password. Neither is ever on the
 * card itself, so a card link that gets forwarded around a family group chat
 * can never become a way to post onto somebody's door.
 */
export default function Doors() {
  const [state, setState] = useState('loading')
  const [places, setPlaces] = useState([])
  const [configured, setConfigured] = useState(false)
  const [host, setHost] = useState('')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard/places', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'failed')
      setPlaces(d.places || []); setConfigured(Boolean(d.configured)); setHost(d.host || '')
      setState('ready')
    } catch { setState('error') }
  }, [])
  useEffect(() => { load() }, [load])

  const make = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/dashboard/places', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (r.ok) { setLabel(''); await load() }
    } finally { setBusy(false) }
  }

  const revoke = async (code) => {
    setBusy(true)
    try {
      await fetch('/api/dashboard/places', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      await load()
    } finally { setBusy(false) }
  }

  const copy = async (text, tag) => {
    try { await navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(''), 1800) } catch { /* no clipboard */ }
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin

  return (
    <section id="panel-doors" className="glass mt-8 scroll-mt-4 overflow-hidden r-outer">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
          <HouseIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-semibold">Household cards</span>
          <span className="block text-[14px] muted">
            {state === 'ready'
              ? `${places.length} card${places.length === 1 ? '' : 's'}`
              : state === 'error' ? 'Could not read them' : '…'}
          </span>
        </span>
      </div>

      <div className="px-6 pb-5 text-[15px] leading-snug muted">
        <p>
          One card per door, with everything coming to it: your visit, the sofa, the parcels.
          They forward a delivery email to the card&apos;s own address and it turns up on the list.
        </p>

        {/* The address is the whole promise, so it is not offered until it can
            work. A row that hands out an address nothing is listening on is
            the push row that opened onto an empty drawer. */}
        {state === 'ready' && !configured && (
          <p className="mt-2 text-[14px]">
            <b>Forwarding is not switched on yet.</b> Cards still work for your own jobs —
            the forwarding addresses below start receiving once <code>{host}</code> is pointed
            at a mail provider and <code>INBOUND_EMAIL_TOKEN</code> is set.
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80}
            placeholder="14 Church Lane" aria-label="What to call this door"
            className="field min-h-[44px] flex-1" style={{ minWidth: '12rem' }}
          />
          <button type="button" onClick={make} disabled={busy}
                  className="btn accent-fill !min-h-[44px] !px-4 !text-[14px]">
            <PlusIcon size={15} /> {busy ? '…' : 'New card'}
          </button>
        </div>

        {places.length > 0 && (
          <ul className="mt-4 grid gap-2.5">
            {places.map((p) => (
              <li key={p.code} className="r-inner p-3.5" style={{ background: 'color-mix(in srgb, var(--mts-accent) 6%, transparent)' }}>
                <p className="text-[16px] font-semibold" style={{ color: 'var(--label-1)' }}>
                  {p.label || 'A door'}
                </p>
                <p className="text-[13px] muted">
                  {p.arrivals} thing{p.arrivals === 1 ? '' : 's'} on it
                </p>

                <p className="mt-2.5 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--label-3)' }}>
                  Send them this
                </p>
                <p className="break-all font-mono text-[13px]" style={{ color: 'var(--label-1)' }}>
                  {origin}/h/{p.code}
                </p>

                <p className="mt-2.5 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--label-3)' }}>
                  They forward delivery emails here
                </p>
                <p className="break-all font-mono text-[13px]" style={{ color: 'var(--label-1)' }}>{p.inbox}</p>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => copy(`${origin}/h/${p.code}`, `link-${p.code}`)}
                          className="btn btn-grey !min-h-[38px] !px-3 !text-[13px]">
                    <CopyIcon size={14} /> {copied === `link-${p.code}` ? 'Copied' : 'Copy link'}
                  </button>
                  <button type="button" onClick={() => copy(p.inbox, `inbox-${p.code}`)}
                          className="btn btn-grey !min-h-[38px] !px-3 !text-[13px]">
                    <CopyIcon size={14} /> {copied === `inbox-${p.code}` ? 'Copied' : 'Copy address'}
                  </button>
                  <a href={`/h/${p.code}`} target="_blank" rel="noreferrer"
                     className="btn btn-grey !min-h-[38px] !px-3 !text-[13px]">Open</a>
                  <button type="button" onClick={() => revoke(p.code)} disabled={busy}
                          className="btn btn-grey !min-h-[38px] !px-3 !text-[13px]">
                    <LinkOffIcon size={14} /> Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[12px]">
          The link only ever shows what someone said was coming. Nothing the household
          tells you is on it, and the forwarding address is never on it either — so a card
          passed round a family group chat cannot be used to post onto their door.
        </p>
      </div>
    </section>
  )
}
