'use client'

import { useEffect, useState } from 'react'
import { nextTip } from '@/lib/tips'
import { ChevronIcon } from '@/components/icons'

const KEY = 'turnup-tips-dismissed'

function readDismissed() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}

/**
 * The one next thing worth knowing, and nothing else. See src/lib/tips.js for
 * the order. `onOpen(panel)` opens the matching setup panel and scrolls to it,
 * so a tip is a door rather than a lecture.
 */
export default function Tip({ jobs, setup, onOpen }) {
  // Dismissals live in this browser. Read after mount: localStorage does not
  // exist during the server render, and a tip the server could not see
  // dismissed would flash and vanish.
  const [dismissed, setDismissed] = useState(null)
  useEffect(() => { setDismissed(readDismissed()) }, [])
  if (dismissed === null || !setup) return null

  const tip = nextTip({ jobs, setup }, dismissed)
  if (!tip) return null

  const dismiss = () => {
    const next = [...dismissed, tip.id]
    setDismissed(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private window */ }
  }

  return (
    <div className="r-inner mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
         style={{ background: 'color-mix(in srgb, var(--tint) 10%, transparent)' }}>
      <p className="min-w-0 flex-1 text-[14px] leading-snug">{tip.text}</p>
      <span className="flex shrink-0 items-center gap-1.5">
        {tip.panel && (
          <button type="button" onClick={() => onOpen?.(tip.panel)}
                  className="btn btn-tinted !min-h-[36px] !px-3 !text-[13px]">
            Open <ChevronIcon size={14} />
          </button>
        )}
        <button type="button" onClick={dismiss} className="btn btn-grey !min-h-[36px] !px-3 !text-[13px]">Got it</button>
      </span>
    </div>
  )
}
