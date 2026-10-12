'use client'

import { useCallback, useEffect, useState } from 'react'
import { BellIcon } from '@/components/icons'
import { LockBand, TradeBanner } from './Pictures'

/**
 * Nudges to the trade's own phone: "Sarah's window has started and the card
 * still says Booked in", "Sarah is asking if you are still coming". Same web
 * push the customer gets, pointed the other way. On an iPhone it only works
 * once the dashboard is on the home screen, so the panel says so instead of
 * showing a button that does nothing.
 */
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
function b64(base64) {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded); const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i)
  return out
}

export default function Nudges() {
  const [state, setState] = useState('checking')
  const [count, setCount] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const read = useCallback(async () => {
    try { const r = await fetch('/api/dashboard/devices', { cache: 'no-store' }); const d = await r.json(); setCount(d.count ?? 0); if (!d.configured) return setState('unconfigured') } catch { /* fall through */ }
    if (!VAPID) return setState('unconfigured')
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const installed = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
    const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (!capable) return setState(isApple && !installed ? 'needs-install' : 'unsupported')
    if (Notification.permission === 'denied') return setState('blocked')
    try { const reg = await navigator.serviceWorker.register('/sw.js'); setState((await reg.pushManager.getSubscription()) ? 'on' : 'off') } catch { setState('unsupported') }
  }, [])
  useEffect(() => { read() }, [read])

  const turnOn = async () => {
    setBusy(true); setErr('')
    try {
      if ((await Notification.requestPermission()) !== 'granted') { setState('blocked'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) })
      const r = await fetch('/api/dashboard/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) })
      if (!r.ok) { await sub.unsubscribe().catch(() => {}); throw new Error('save') }
      const d = await r.json(); setCount(d.count); setState('on')
    } catch (e) { console.error('trade push:', e); setErr('That did not take. Try again in a moment.') }
    finally { setBusy(false) }
  }
  const [tested, setTested] = useState(null)
  const sendTest = async () => {
    setBusy(true); setErr(''); setTested(null)
    try {
      const r = await fetch('/api/dashboard/devices/test', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'failed')
      // Say how many phones it actually reached. "Sent" with nothing arriving
      // is the failure this button exists to make visible, not hide.
      setTested(d.sent > 0
        ? `Sent to ${d.sent} phone${d.sent === 1 ? '' : 's'}. It should buzz within a few seconds \u2014 lock the screen if you are looking at this one.`
        : 'Nothing to send to. No phone is registered yet \u2014 press the button above first.')
    } catch {
      setErr('Could not send the test. Try again in a moment.')
    } finally { setBusy(false) }
  }

  const turnOff = async () => {
    setBusy(true)
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await fetch('/api/dashboard/devices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe() } setState('off'); read() }
    finally { setBusy(false) }
  }

  const line = state === 'on' ? `This phone gets nudged · ${count ?? 1} phone${count === 1 ? '' : 's'} registered`
    : state === 'needs-install' ? 'Add the dashboard to your home screen first'
    : state === 'unconfigured' ? 'Not switched on for this deployment'
    : state === 'blocked' ? 'Notifications are blocked for this site in your phone settings'
    : state === 'unsupported' ? 'This browser cannot receive pushes'
    : `${count ? `${count} phone${count === 1 ? '' : 's'} registered` : 'No phone registered yet'}`

  return (
    <section className="glass mt-8 overflow-hidden r-outer">
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl" style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}><BellIcon size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-semibold">Nudge me</span>
          <span className="block text-[14px] muted">{line}</span>
        </span>
      </div>
      <div className="px-6 pb-5 text-[15px] leading-snug muted">
        {/* What lands, drawn, in the words nudge.js sends: a customer asking,
            or a window that has started or ended with the card not moved. */}
        <div className="max-w-[360px]">
          <LockBand>
            <TradeBanner title="Sarah is asking" body="“Are you still coming?” Reply from the card: On my way, or how late." />
            <div className="mt-2"><TradeBanner title="Sarah’s window has started" body="From 09:00, and the card still says Booked in. Set off, or say you are running late." when="09:00" /></div>
          </LockBand>
        </div>
        {/* There are two notification buttons in this product and they are
            easy to mix up: this one is the trade's, and the one on a tracking
            page is the customer's. Somebody who had just set this one up
            could not tell which they had done. */}
        <p className="mt-3 text-[14px]"><b>This is your phone.</b> Customers switch their own on from their link.</p>
        {state === 'needs-install' && <p className="mt-2 text-[14px]">On an iPhone: Share → <b>Add to Home Screen</b>, open the dashboard from there, then press the button.</p>}
        {err && <p className="mt-2 text-[14px] text-red-600">{err}</p>}
        {tested && <p className="mt-2 text-[14px]" style={{ color: 'var(--tint)' }}>{tested}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {state === 'off' && <button type="button" onClick={turnOn} disabled={busy} className="btn accent-fill !min-h-[44px] !px-4 !text-[14px]">{busy ? '…' : 'Nudge me on this phone'}</button>}
          {state === 'on' && <button type="button" onClick={sendTest} disabled={busy} className="btn accent-fill !min-h-[44px] !px-4 !text-[14px]">{busy ? '…' : 'Send a test to this phone'}</button>}
          {state === 'on' && <button type="button" onClick={turnOff} disabled={busy} className="btn btn-grey !min-h-[44px] !px-4 !text-[14px]">Stop nudging this phone</button>}
        </div>
      </div>
    </section>
  )
}
