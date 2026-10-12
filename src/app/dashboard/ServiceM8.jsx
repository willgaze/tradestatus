'use client'
import { useCallback, useEffect, useState } from 'react'
import { ChevronIcon, TickIcon } from '@/components/icons'

/**
 * The ServiceM8 panel: is it connected, is it listening, what has it done.
 *
 * Honest about the three states. No key: say exactly what to do. Key but no
 * webhooks: it still works by pull-on-read, say that too, and offer the
 * button. Listening: show the last few things it did, so "did it fire?" is
 * a glance rather than a support ticket.
 */
export default function ServiceM8({ onChanged }) {
  const [open, setOpen] = useState(false)
  const [s, setS] = useState(null)
  const [busy, setBusy] = useState(null)
  const [note, setNote] = useState(null)

  const load = useCallback(async () => {
    const r = await fetch('/api/dashboard/servicem8')
    if (r.ok) setS(await r.json())
  }, [])
  useEffect(() => { load() }, [load])

  const act = async (action, attempt = 0) => {
    setBusy(action); if (!attempt) setNote(null)
    try {
      const r = await fetch('/api/dashboard/servicem8', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const j = await r.json().catch(() => ({}))
      if (r.status === 202 && j.activating) {
        // ServiceM8 switches webhooks on for an account the first time anyone
        // asks, and says "try again in a few moments". So we do — every 20
        // seconds for up to five minutes, while this stays open.
        if (attempt < 15) {
          setNote(`ServiceM8 is switching webhooks on for your account. Trying again in 20 seconds… (${attempt + 1}/15)`)
          setTimeout(() => act(action, attempt + 1), 20_000)
          return
        }
        return setNote('ServiceM8 is still switching webhooks on. Leave it a few minutes and press Start listening again.')
      }
      if (!r.ok) setNote(j.error === 'sm8_key_rejected' ? 'ServiceM8 rejected the key. Check SM8_API_KEY in Vercel.' : `Did not work: ${j.error || r.status}`)
      else if (action === 'sync') setNote(`Checked ${j.results.length} linked job${j.results.length === 1 ? '' : 's'}: ${j.results.filter((x) => String(x.outcome).startsWith('moved')).length} moved.`)
      else if (action === 'subscribe') setNote(j.results.every((x) => x.ok) ? 'Listening. ServiceM8 will ring this page when a job moves.' : `Some subscriptions failed: ${j.results.filter((x) => !x.ok).map((x) => `${x.event} (${x.error})`).join(', ')}`)
      else setNote('Stopped listening.')
      await load(); onChanged?.()
    } finally { setBusy(null) }
  }

  const live = s?.configured && (s?.subscriptions?.length || 0) > 0
  const sub = !s ? '…' : !s.configured ? 'Not connected — needs an API key' : live ? `Listening · ${s.linked ?? 0} job${s.linked === 1 ? '' : 's'} linked` : 'Connected · checks when a page is opened'

  return (
    <section className="glass mt-8 overflow-hidden r-outer">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-[66px] w-full items-center gap-3 px-6 py-4 text-left">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${live ? 'tone-done' : s?.configured ? 'tone-booked' : 'tone-paused'}`}
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
          <TickIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-semibold">ServiceM8</span>
          <span className="block text-[14px] muted">{sub}</span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && s && (
        <div className="px-6 pb-6">
          {!s.configured ? (
            <div className="r-inner px-4 py-3.5 text-[14px]" style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
              <p className="font-semibold">Connect it: one setting in Vercel.</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>In ServiceM8: <b>Settings → API Keys → Create</b>. Copy the key.</li>
                <li>Open <a className="underline" href="https://vercel.com/willgazes-projects/turnup/settings/environment-variables" target="_blank" rel="noreferrer">Vercel → turnup → Environment Variables</a>. Press <b>Add</b>: Key <code className="font-mono">SM8_API_KEY</code>, Value the key, Environment <b>Production</b>. Save.</li>
                <li>Open <a className="underline" href="https://vercel.com/willgazes-projects/turnup/deployments" target="_blank" rel="noreferrer">Deployments</a> → <b>⋯</b> on the top one → <b>Redeploy</b>. About a minute.</li>
                <li>Come back here and press <b>Start listening</b>.</li>
              </ol>
              <p className="mt-2 muted">That is all. The webhook secret is derived, and the tables are created on deploy. Until the key is in, this panel does nothing and nothing else is affected.</p>
            </div>
          ) : (
            <>
              <p className="text-[15px] muted">
                A card that follows a ServiceM8 job moves on its own: check in and the customer sees <b>On site</b>; complete the job and they see <b>Job done</b>; check out before it is finished and it reads <b>Paused</b>. Setting off stays your tap. Nothing ServiceM8 sends is trusted — every event is checked against the job itself.
              </p>
              {s.tablesMissing && (
                <p className="r-inner mt-3 px-4 py-3 text-[14px]" style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
                  The log tables are not in the database yet. Run <code className="font-mono">npx prisma db push</code> against production (the connect script does this).
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {live ? (
                  <button type="button" onClick={() => act('unsubscribe')} disabled={busy} className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">Stop listening</button>
                ) : (
                  <button type="button" onClick={() => act('subscribe')} disabled={busy || !s.hasToken} className="btn accent-fill !min-h-[44px] !px-4 !text-[14px]">{busy === 'subscribe' ? '…' : 'Start listening'}</button>
                )}
                <button type="button" onClick={() => act('sync')} disabled={busy} className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">{busy === 'sync' ? '…' : 'Check all linked jobs now'}</button>
              </div>
              {/* The add-on half: the diary. The key cannot write there; an
                  authorised add-on can. Three states, each with its next step. */}
              <div className="r-inner mt-4 px-4 py-3.5 text-[14px]" style={{ background: 'rgb(var(--glass-line) / 0.07)' }}>
                <p className="font-semibold">As an add-on: TurnUp writes to the job diary</p>
                {s.oauth?.connected ? (
                  <>
                    <p className="mt-1 muted">Connected{s.oauth.vendorName ? ` to ${s.oauth.vendorName}` : ''} since {new Date(s.oauth.connectedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. Set off, on site, paused, done, terms agreed, no one home and the customer’s replies each go into the job diary as a line from TurnUp.</p>
                    <button type="button" onClick={() => act('oauth_disconnect')} disabled={busy} className="btn btn-grey mt-2.5 !min-h-[40px] !px-4 !text-[13px]">Disconnect the add-on</button>
                  </>
                ) : s.oauth?.configured ? (
                  <>
                    <p className="mt-1 muted">The app details are in. One more step: authorise it on your ServiceM8 account.</p>
                    <a href="/api/servicem8/oauth/start" className="btn accent-fill mt-2.5 !min-h-[44px] !px-4 !text-[14px]">Connect ServiceM8 as an add-on</a>
                  </>
                ) : (
                  <>
                    <p className="mt-1 muted">Needs a free ServiceM8 developer account and two settings in Vercel (<code className="font-mono">SM8_APP_ID</code>, <code className="font-mono">SM8_APP_SECRET</code>). The steps are in <code className="font-mono">docs/servicem8-add-on.md</code>. Return URL for the app: <code className="font-mono break-all">{s.oauth?.redirectUri}</code></p>
                  </>
                )}
              </div>
              {!s.hasToken && <p className="mt-2 text-[13px] muted">No SM8_WEBHOOK_TOKEN set, so webhooks cannot be received. Pull-on-read still works.</p>}
              {s.subscriptionsError && <p className="mt-2 text-[13px] muted">Could not list subscriptions: {s.subscriptionsError}</p>}
              {note && <p className="mt-3 text-[14px]">{note}</p>}
              {s.recent?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[13px] font-semibold muted">Lately</p>
                  <ul className="mt-1.5 grid gap-1 text-[13px]">
                    {s.recent.map((e) => (
                      <li key={e.id} className="flex items-baseline gap-2">
                        <span className="muted tabular-nums">{new Date(e.receivedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-mono">{e.event}</span>
                        <span className={String(e.outcome).startsWith('moved') ? 'font-semibold' : 'muted'}>{e.outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
