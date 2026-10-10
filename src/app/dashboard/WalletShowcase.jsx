'use client'
import { ChevronIcon } from '@/components/icons'
import PassCard, { StackView, PoppedView } from '@/components/PassCard'

import { useEffect, useState } from 'react'

/**
 * The pass, shown three ways: in the stack, lifted out of it, and on its own.
 * The drawing itself lives in src/components/PassCard.jsx so the homepage can
 * show the identical card.
 */

const VIEWS = [
  { id: 'stack',  label: 'In the wallet' },
  { id: 'popped', label: 'Opened' },
  { id: 'alone',  label: 'On its own' },
]

export default function WalletShowcase({ tracker }) {
  const [view, setView] = useState('stack')
  // Shut by default. 911px of a feature that does not exist yet, sitting in
  // the middle of the screen the trade opens every morning, is the showcase
  // costing more than it shows. It is worth looking at — occasionally.
  const [open, setOpen] = useState(false)
  // The card wears the trade's logo once one is set, so the preview is honest
  // about what the paid tier looks like.
  const [logo, setLogo] = useState(null)
  useEffect(() => {
    fetch('/api/dashboard/profile').then((r) => (r.ok ? r.json() : null))
      .then((j) => setLogo(j?.profile?.brandLogo || null)).catch(() => {})
  }, [])

  return (
    <section className="glass mt-8 overflow-hidden r-outer">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
              className="flex min-h-[66px] w-full items-center gap-3 px-6 py-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-semibold">The wallet card</span>
          <span className="block text-[14px] muted">Not live yet — what it will look like</span>
        </span>
        <ChevronIcon size={18} style={{ color: 'var(--label-3)' }}
                     className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (<>
      <div className="px-6">
        <p className="text-[15px] muted">
          It needs an Apple signing certificate and a Google Wallet issuer account. Until those exist this
          is a link, not a card.
        </p>

        <div className="mt-4 flex gap-1.5 rounded-2xl bg-black/[.05] p-1 dark:bg-white/[.06]">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)}
                    className={`min-h-[40px] flex-1 r-inner text-[14px] font-semibold transition-all ${
                      view === v.id ? 'surface shadow-sm' : 'muted'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 bg-black px-5 py-8">
        {view === 'stack' && <StackView tracker={tracker} logo={logo} />}
        {view === 'popped' && <PoppedView tracker={tracker} logo={logo} />}
        {view === 'alone' && <div className="mx-auto max-w-[300px]"><PassCard tracker={tracker} logo={logo} /></div>}
      </div>
      </>)}
    </section>
  )
}
