'use client'

import { useState } from 'react'
import { TickIcon } from '@/components/icons'

/**
 * The one thing a stranger on the homepage can do.
 *
 * It is a waiting list and it says so. There is one operator and multi-tenancy
 * is a different product, so an honest homepage cannot put "Sign up" on a
 * button and hand back a login — and a form that pretends to create an account
 * is the same lie as a status page that invents an arrival time.
 *
 * Three fields, two of them optional. Every extra box is a trade who starts
 * filling it in on a phone, in a van, and stops.
 */
export default function Waitlist() {
  const [form, setForm] = useState({ email: '', trade: '', town: '' })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState(null)

  const send = async (e) => {
    e.preventDefault()
    setState('sending')
    setError(null)
    try {
      const r = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(
          body.error === 'bad_email' ? 'That email does not look right — check it over.'
            : body.error === 'too_many' ? 'That is a few tries now. Give it an hour.'
            // Deliberately not "thanks, you are on the list". If it did not
            // save, saying it did means somebody waits for an email that is
            // never coming.
            : 'That did not save. Try again in a moment, or email me directly.',
        )
      }
      setState('done')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="glass r-outer p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full"
              style={{ color: 'var(--tint)', background: 'color-mix(in srgb, var(--tint) 14%, transparent)' }}>
          <TickIcon size={24} />
        </span>
        <p className="mt-3 text-[19px] font-semibold">You are on the list</p>
        <p className="mt-1.5 text-[16px] leading-snug muted">
          I will email you when there is a place. Not a newsletter — one email, when it is your turn.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={send} className="glass r-outer p-6">
      <p className="text-[19px] font-semibold">Want it for your own jobs?</p>
      <p className="mt-1.5 text-[16px] leading-snug muted">
        It is running for one plumbing firm while it is made properly. Leave your email and I will
        tell you when there is room.
      </p>

      <div className="mt-5 grid gap-3">
        <label className="block text-[14px] font-medium muted">
          Email
          <input type="email" required value={form.email} inputMode="email" autoComplete="email"
                 onChange={(e) => setForm({ ...form, email: e.target.value })}
                 placeholder="you@yourfirm.co.uk" className="field mt-1.5" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[14px] font-medium muted">
            Your trade <span className="font-normal">(optional)</span>
            <input type="text" value={form.trade} maxLength={60}
                   onChange={(e) => setForm({ ...form, trade: e.target.value })}
                   placeholder="Plumber" className="field mt-1.5" />
          </label>
          <label className="block text-[14px] font-medium muted">
            Near where <span className="font-normal">(optional)</span>
            <input type="text" value={form.town} maxLength={80}
                   onChange={(e) => setForm({ ...form, town: e.target.value })}
                   placeholder="Wiltshire" className="field mt-1.5" />
          </label>
        </div>
      </div>

      <button type="submit" disabled={state === 'sending'} className="btn btn-filled mt-4 w-full">
        {state === 'sending' ? 'Sending…' : 'Put me on the list'}
      </button>

      {error && (
        <p className="r-inner mt-3 p-3 text-[14px]"
           style={{ background: 'color-mix(in srgb, #ff3b30 12%, transparent)', color: '#ff3b30' }}>
          {error}
        </p>
      )}

      <p className="mt-3 text-[13px]" style={{ color: 'var(--label-3)' }}>
        Your email is used to tell you when there is a place, and for nothing else.
      </p>
    </form>
  )
}
