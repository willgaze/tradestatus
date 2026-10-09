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
    <form onSubmit={go} className="mt-6">
      <label className="block text-[13px] font-semibold text-slate-500" htmlFor="digits">Last four digits</label>
      <input id="digits" inputMode="numeric" autoComplete="off" pattern="[0-9 ]*" maxLength={14} value={digits}
             onChange={(e) => setDigits(e.target.value)} placeholder="1234" autoFocus
             className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[22px] tracking-[0.2em]" />
      {err && <p className="mt-2 text-[14px] text-red-600">{err}</p>}
      <button type="submit" disabled={busy || digits.replace(/\D/g, '').length < 4}
              className="mt-4 w-full rounded-2xl bg-brand-600 px-6 py-3.5 text-[16px] font-semibold text-white disabled:opacity-50">
        {busy ? 'Checking…' : 'Show my booking'}
      </button>
      <p className="mt-3 text-[13px] text-slate-400">You can also type the whole number.</p>
    </form>
  )
}
