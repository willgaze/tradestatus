'use client'

import Mark from '@/components/Mark'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser'

export default function LoginPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [supported, setSupported] = useState(false)
  // The password is the spare key, not the front door. It is hidden until
  // asked for, so the normal way in is the only thing on screen.
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => setSupported(browserSupportsWebAuthn()), [])

  const done = () => { router.push('/dashboard'); router.refresh() }

  const signInWithPasskey = async () => {
    setBusy(true); setError(null)
    try {
      const o = await fetch('/api/auth/passkey/login/options', { method: 'POST' })
      if (!o.ok) throw new Error('Could not start sign-in.')
      const { options } = await o.json()

      const response = await startAuthentication({ optionsJSON: options })

      const v = await fetch('/api/auth/passkey/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })
      if (!v.ok) {
        const body = await v.json().catch(() => ({}))
        throw new Error(
          body.error === 'unknown_device'
            ? 'This device is not set up yet. Sign in with your password, then add it.'
            : 'That did not work. Try again.',
        )
      }
      done()
    } catch (err) {
      // A cancelled prompt and "no passkey on this device" both arrive as
      // NotAllowedError and the browser will not distinguish them. Silence
      // leaves someone tapping a button that appears dead, so offer the way
      // forward that works in both cases rather than calling it an error.
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        setError('Nothing to sign in with on this device yet — use your password, then set it up.')
        setShowPassword(true)
      } else {
        setError(err.message || 'That did not work.')
      }
    } finally {
      setBusy(false)
    }
  }

  const signInWithPassword = async (e) => {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(
          body.error === 'too_many_attempts' ? 'Too many tries. Wait ten minutes.'
            : r.status === 401 ? 'Wrong password.'
            : 'Login is not configured yet.',
        )
      }
      done()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Mark className="mx-auto h-14 w-auto" id="login" />
      <h1 className="mt-6 text-center text-[28px] font-bold tracking-[-0.02em]">Sign in</h1>

      {supported && (
        <button type="button" onClick={signInWithPasskey} disabled={busy}
                className="btn btn-filled mt-6 w-full">
          {busy ? 'One moment…' : 'Sign in with Face ID or Touch ID'}
        </button>
      )}

      {error && (
        <p className="r-inner mt-4 p-3.5 text-[15px]"
           style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          {error}
        </p>
      )}

      {!showPassword ? (
        <button type="button" onClick={() => setShowPassword(true)}
                className="mx-auto mt-6 min-h-[44px] text-[15px] muted">
          {supported ? 'Use my password instead' : 'Sign in with your password'}
        </button>
      ) : (
        <form onSubmit={signInWithPassword} className="mt-6 space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="Password" autoComplete="current-password" autoFocus
                 className="field" />
          <button type="submit" disabled={busy} className="btn btn-grey w-full">
            {busy ? 'Signing in…' : 'Sign in with password'}
          </button>
        </form>
      )}

      {supported && (
        <p className="mt-8 text-center text-[14px]" style={{ color: 'var(--label-3)' }}>
          Add a device from the dashboard once you are in.
        </p>
      )}
      </main>
    </div>
  )
}
