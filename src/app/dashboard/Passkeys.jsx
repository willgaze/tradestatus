'use client'

import { useCallback, useEffect, useState } from 'react'
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
      <h2 className="font-bold">Signing in</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add a device and you sign in with Face ID or Touch ID instead of typing a password.
      </p>

      <button type="button" onClick={addDevice} disabled={busy}
              className="mt-3 min-h-[48px] w-full rounded-xl bg-brand-600 px-4 text-base font-semibold text-white disabled:opacity-60">
        {busy ? 'One moment…' : 'Set up this device'}
      </button>

      {note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{note}</p>}

      {keys.length > 0 && (
        <ul className="mt-4 space-y-2">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{k.label || 'Device'}</p>
                <p className="text-xs text-slate-500">
                  {k.lastUsedAt
                    ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                    : 'Not used yet'}
                </p>
              </div>
              <button type="button" onClick={() => remove(k.id)}
                      className="min-h-[44px] shrink-0 rounded-xl border border-red-300 px-3 text-sm font-semibold text-red-700">
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
