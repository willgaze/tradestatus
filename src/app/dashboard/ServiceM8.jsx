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
              <p className="font-semibold">Connect it in one go.</p>
              <p className="mt-1">In ServiceM8: Settings → API Keys → create one. Then on your Mac, in the repo:</p>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-black/80 px-3 py-2 font-mono text-[12px] text-white">bash scripts/connect-servicem8.sh</pre>
              <p className="mt-2 muted">It stores the key and a webhook secret in Vercel, creates the two tables, redeploys, and comes back here to switch on listening. Until then this panel does nothing and nothing else is affected.</p>
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
