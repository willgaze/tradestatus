'use client'
import { useState } from 'react'
import FrameStrip from '@/components/FrameStrip'

/**
 * Two walkthroughs, one switch. The product has two ends and a visitor is
 * standing at one of them; make them say which, and show only that side.
 */
const SIDES = [
  { id: 'customer', label: 'I’m the customer', line: 'What arrives on your phone, and what you can do with it. Nothing to install.' },
  { id: 'trade',    label: 'I do the work',    line: 'What you tap, and when. Five buttons on a phone, next to the van.' },
]

export default function Walkthrough({ frames }) {
  const [side, setSide] = useState('customer')
  const current = SIDES.find((s) => s.id === side)
  return (
    <div>
      <div className="flex gap-1.5 rounded-2xl bg-black/[.05] p-1 dark:bg-white/[.06]" role="tablist" aria-label="Which side are you on?">
        {SIDES.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={side === s.id} onClick={() => setSide(s.id)}
                  className={`min-h-[44px] flex-1 r-inner text-[15px] font-semibold transition-all ${side === s.id ? 'surface shadow-sm' : 'muted'}`}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[17px] leading-snug muted">{current.line}</p>
      <FrameStrip frames={frames[side]} />
    </div>
  )
}
