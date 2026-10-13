'use client'

import { useCallback, useEffect, useState } from 'react'
import { HouseIcon, CopyIcon, TickIcon } from '@/components/icons'

/**
 * Switching the letterbox on.
 *
 * THIS PANEL HAS BEEN CUT DOWN ONCE AND THE REASON MATTERS. It used to be four
 * steps: make a password, set it in Vercel and redeploy, move the DNS, and
 * deploy a Worker with wrangler. Two of those needed a laptop. Told to do it,
 * the owner asked again for the whole thing to be set up for him — the same
 * signal as the push script being run zero times out of four. The ask was the
 * problem, so two steps were deleted rather than re-explained:
 *
 *   - the password is written to a row by the button below, so there is no
 *     Vercel visit and no redeploy;
 *   - the Worker is handed over as finished code with the address and the
 *     password already in it, to paste into Cloudflare's own editor.
 *
 * What is left is a Cloudflare account and a nameserver change. Nothing can
 * remove those: they are an account somebody has to own and a domain somebody
 * has to prove they control.
 */
function Copy({ value, label, wide }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 2000) }
        catch { /* older browsers: the value is on screen to select */ }
      }}
      className={`btn ${wide ? 'accent-fill' : 'btn-grey'} !min-h-[44px] !px-4 !text-[14px]`}
    >
      {done ? <TickIcon size={15} /> : <CopyIcon size={15} />} {done ? 'Copied' : label}
    </button>
  )
}

export default function InboundSetup() {
  const [state, setState] = useState('checking')
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const read = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard/inbound', { cache: 'no-store' })
      const d = await r.json()
      setInfo(d)
      setState(d.configured ? 'on' : 'off')
    } catch { setState('off') }
  }, [])
  useEffect(() => { read() }, [read])

  const switchOn = async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/dashboard/inbound', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'failed')
      setInfo(d); setState('on')
    } catch (e) { setErr(e.message || 'That did not take. Try again in a moment.') }
    finally { setBusy(false) }
  }

  if (state === 'checking') return null

  const bare = (info?.host || 'in.getturnup.com').replace(/^[^.]+\./, '')
  const sub = (info?.host || 'in.getturnup.com').split('.')[0]

  return (
    <section id="panel-inbound" className="glass mt-8 scroll-mt-4 overflow-hidden r-outer">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
          <HouseIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-semibold">Turn on forwarding</span>
          <span className="block text-[14px] muted">
            {state === 'on' ? 'Switched on here — two things left, both in Cloudflare' : 'So forwarded emails can land on a household card'}
          </span>
        </span>
      </div>

      <div className="px-6 pb-6 text-[15px] leading-snug muted">
        {state === 'off' && (
          <>
            <p>
              Two steps, both in a browser. Press this first and the rest appears.
            </p>
            {err && <p className="mt-2 text-[14px] text-red-600">{err}</p>}
            <button type="button" onClick={switchOn} disabled={busy}
                    className="btn accent-fill mt-3 !min-h-[46px] !px-5 !text-[15px]">
              {busy ? '…' : 'Switch it on'}
            </button>
            <p className="mt-2 text-[13px]">
              Nothing to set in Vercel and nothing to redeploy. This writes the password itself.
            </p>
          </>
        )}

        {state === 'on' && info?.worker && (
          <>
            <p>
              <b>Done on this side.</b> Two things left, both inside Cloudflare, both in a browser.
              Do them on a quiet evening — step 1 moves the website&apos;s DNS and is the only
              part with any risk in it.
            </p>

            <ol className="mt-5 grid gap-5">
              <li>
                <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--label-3)' }}>
                  1 — Point the domain at Cloudflare
                </p>
                <p className="mt-1">
                  Sign up at <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer">Cloudflare</a>,
                  add <b>{bare}</b>, take the <b>Free</b> plan. It copies your existing records across —
                  <b> check the website records are in that list before going on.</b>
                </p>
                <p className="mt-1.5">
                  Then <a href="https://hpanel.hostinger.com/" target="_blank" rel="noreferrer">Hostinger</a> →
                  Domains → {bare} → <b>Change nameservers</b>, and paste the two Cloudflare gives you.
                </p>
                <p className="mt-1.5 text-[13px]">
                  <b>You will see:</b> Cloudflare says <b>Active</b>, usually within 15 minutes.
                  Check <a href={`https://www.${bare}`} target="_blank" rel="noreferrer">the website</a> still loads.
                </p>
              </li>

              <li>
                <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--label-3)' }}>
                  2 — The letterbox and the Worker
                </p>
                <p className="mt-1">
                  In Cloudflare on <b>{bare}</b>: <b>Email</b> → <b>Email Routing</b> → <b>Get started</b>.
                  Then <b>Settings</b> → add the subdomain <b>{sub}</b>. That keeps your own email at
                  {' '}<span className="font-mono">{bare}</span> untouched, now and later.
                </p>
                <p className="mt-2">
                  Next, <b>Workers &amp; Pages</b> → <b>Create</b> → <b>Start with Hello World</b> →
                  <b> Deploy</b> → <b>Edit code</b>. Select everything in the editor, paste this over it,
                  and press <b>Deploy</b>. Name it <b>turnup-inbound</b>.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Copy value={info.worker} label="Copy the Worker" wide />
                </div>
                <p className="mt-2.5">
                  Last, back in <b>Email Routing</b> on <b>{info.host}</b>: <b>Routes</b> → turn on
                  {' '}<b>Catch-all address</b> → Action <b>Send to a Worker</b> → <b>turnup-inbound</b>.
                </p>
                <p className="mt-1.5 text-[13px]">
                  <b>You will see:</b> Catch-all showing as <b>Active</b>.
                </p>
              </li>
            </ol>

            <p className="mt-5 text-[13px]">
              <b>How you will know it all worked:</b> forward any delivery email to a card&apos;s
              address and the thing turns up on the card within a few seconds. If nothing appears,
              Cloudflare → Email Routing → <b>Activity log</b> shows every message and what happened
              to it.
            </p>
            <p className="mt-3 text-[12px]">
              The code above has the address and the password in it, which is why there is nothing
              else to copy. Keep it to yourself the way you would a key — anyone with it could
              post rows onto your cards.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
