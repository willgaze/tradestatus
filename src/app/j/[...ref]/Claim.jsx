'use client'

import { useState } from 'react'

export default function Claim({ number }) {
  const [digits, setDigits] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function go(e) {
    e.preventDefault()
    if (digits.replace(/\D/g, '').length < 4) return
    setBusy(true); setErr('')
    try {
      const r = await fetch(`/api/j/${number}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ digits }) })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.to) { window.location.href = d.to; return }
      setErr(r.status === 429 ? 'Too many tries. Wait a few minutes, or ring.' : 'Those digits do not match the booking. Try the number the text came to.')
    } catch { setErr('No connection. Try again.') }
    setBusy(false)
  }

  return (
    <form onSubmit={go} className="glass r-outer mt-5 p-4">
      <label className="block text-[13px] font-semibold muted" htmlFor="digits">Last four digits</label>
      <input id="digits" inputMode="numeric" autoComplete="off" pattern="[0-9 ]*" maxLength={14} value={digits}
             onChange={(e) => setDigits(e.target.value)} placeholder="1234" autoFocus
             className="field mt-1.5 text-center !text-[24px] font-semibold tracking-[0.25em]" />
      {err && (
        <p className="r-inner mt-3 p-3 text-[14px]" style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>{err}</p>
      )}
      <button type="submit" disabled={busy || digits.replace(/\D/g, '').length < 4}
              className="btn accent-fill mt-3 w-full disabled:opacity-50">
        {busy ? 'Checking…' : 'Show my booking'}
      </button>
      <p className="mt-2.5 text-center text-[13px]" style={{ color: 'var(--label-3)' }}>The whole number works too.</p>
    </form>
  )
}
