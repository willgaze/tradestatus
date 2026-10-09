'use client'
import { dayAndMonth } from '@/lib/when'

import { useCallback, useEffect, useState } from 'react'
import { CANONICAL_HOST } from '@/lib/trade'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'

// Named so a lost device can be found in the list and switched off.
function guessDeviceName() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android phone'
  if (/Macintosh/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows PC'
  return 'This device'
}

export default function Passkeys() {
  const [keys, setKeys] = useState([])
  const [supported, setSupported] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)

  const load = useCallback(async () => {
    const r = await fetch('/api/auth/passkey/list')
    if (r.ok) setKeys((await r.json()).passkeys || [])
  }, [])

  useEffect(() => { setSupported(browserSupportsWebAuthn()); load() }, [load])

  const addDevice = async () => {
    setBusy(true); setNote(null)
    try {
      const o = await fetch('/api/auth/passkey/register/options', { method: 'POST' })
      if (!o.ok) throw new Error('Could not start. Try again.')
      const { options } = await o.json()

      const response = await startRegistration({ optionsJSON: options })

      const v = await fetch('/api/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, label: guessDeviceName() }),
      })
      if (!v.ok) {
        const body = await v.json().catch(() => ({}))
        throw new Error(body.error === 'already_enrolled'
          ? 'This device is already set up.'
          : 'That did not work. Try again.')
      }
      setNote('Done. Next time, just Face ID.')
      load()
    } catch (err) {
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') setNote(null)
      else setNote(err.message || 'That did not work.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    // Removing the last one would leave only the password, which is a
    // reasonable thing to do on a lost phone — so it is allowed, but said out loud.
    const last = keys.length === 1
    if (!window.confirm(last
      ? 'Remove the only device? You will need your password to sign in again.'
      : 'Remove this device?')) return
    await fetch('/api/auth/passkey/list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  if (!supported) return null

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
      <MovedNote />
      <MoveBanner />
      <h2 className="font-bold">Signing in</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add a device and you sign in with Face ID or Touch ID instead of typing a password.
      </p>

      <button type="button" onClick={addDevice} disabled={busy}
              className="mt-3 min-h-[48px] w-full r-inner accent-fill px-4 text-base font-semibold disabled:opacity-60">
        {busy ? 'One moment…' : 'Set up this device'}
      </button>

      {note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{note}</p>}

      {keys.length > 0 && (
        <ul className="mt-4 space-y-2">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-3 r-inner border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{k.label || 'Device'}</p>
                <p className="text-xs text-slate-500">
                  {k.lastUsedAt
                    ? `Last used ${dayAndMonth(k.lastUsedAt)}`
                    : 'Not used yet'}
                </p>
              </div>
              <button type="button" onClick={() => remove(k.id)}
                      className="min-h-[44px] shrink-0 r-inner border border-red-300 px-3 text-sm font-semibold text-red-700">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Keep your password somewhere safe. It is how you get back in if you lose every device.
      </p>
    </section>
  )
}


/* Signed in on an old address: carry it to the real one, no password. */
function MovedNote() {
  const [moved, setMoved] = useState(false)
  useEffect(() => { setMoved(Boolean(new URLSearchParams(window.location.search).get('moved'))) }, [])
  if (!moved) return null
  return (
    <div className="r-inner mb-4 px-4 py-3.5 text-[14px]" style={{ background: 'color-mix(in srgb, var(--stage-done) 14%, transparent)' }}>
      <p className="font-semibold">Moved. You are signed in here now.</p>
      <p className="mt-1">Press <b>Set up this device</b> below and Face ID works on this address from now on.</p>
    </div>
  )
}

function MoveBanner() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [here, setHere] = useState(null)
  useEffect(() => { setHere(window.location.host) }, [])
  const move = async () => {
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/auth/handoff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: CANONICAL_HOST }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.url) throw new Error(j.error || 'failed')
      window.location.href = j.url
    } catch (e) { setErr('Could not start the move. Try again.'); setBusy(false) }
  }
  if (!here || here === CANONICAL_HOST || here.startsWith('localhost') || here.startsWith('127.')) return null
  return (
    <div className="r-inner mb-4 px-4 py-3.5 text-[14px]" style={{ background: 'color-mix(in srgb, var(--stage-paused) 13%, transparent)' }}>
      <p className="font-semibold">This is the old address.</p>
      <p className="mt-1">TurnUp lives at <b>{CANONICAL_HOST}</b> now. Face ID is set up per address, so take this sign-in there and set it up once.</p>
      <button type="button" onClick={move} disabled={busy} className="btn accent-fill mt-2.5 !min-h-[42px] !px-4 !text-[14px]">{busy ? 'Moving…' : `Move my sign-in to ${CANONICAL_HOST}`}</button>
      {err && <p className="mt-2 text-[13px]">{err}</p>}
    </div>
  )
}
