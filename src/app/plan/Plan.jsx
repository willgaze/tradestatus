'use client'
import Mark from '@/components/Mark'
import { ChevronIcon, CopyIcon } from '@/components/icons'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { DECISIONS, PLAN_META } from '@/lib/plan'
import { Cover, Problem, Product, Wallet, WhereWeAre } from './sections-now'
import { Alternatives, Financials, Market, Pricing } from './sections-market'
import { Decide, Facts, GoToMarket, Risks, Team, Timeline } from './sections-plan'

/*
 * The plan as a deck. One section on screen at a time; left and right arrows
 * move, P hides the rail for showing someone. The content is in
 * src/lib/plan.js and src/lib/pricing.js; the sections are in the three
 * sections-*.jsx files beside this one; nothing in here is a sentence of its
 * own.
 *
 * Two modes. The owner (signed in at /plan) can tap decisions and mark
 * guesses right or wrong; those taps stay in this browser. A guest (at
 * /plan/<code>) reads the same deck with every control removed and the
 * owner-only links left out. The shared record of the owner's answers is the
 * Claude asset that reads them back; this page is the thing that gets shown.
 */

const STORAGE_KEY = 'mts-plan-answers'

const SECTIONS = [
  { key: 'cover', nav: 'TurnUp', C: Cover },
  { key: 'status', nav: 'Where we are', C: WhereWeAre },
  { key: 'problem', nav: 'Problem', C: Problem },
  { key: 'product', nav: 'Product', C: Product },
  { key: 'wallet', nav: 'The wallet card', C: Wallet },
  { key: 'alternatives', nav: 'Alternatives', C: Alternatives },
  { key: 'market', nav: 'Market', C: Market },
  { key: 'pricing', nav: 'Pricing', C: Pricing },
  { key: 'calc', nav: 'Financials', C: Financials },
  { key: 'gtm', nav: 'Go to market', C: GoToMarket },
  { key: 'timeline', nav: 'So far', C: Timeline },
  { key: 'risks', nav: 'Risks', C: Risks },
  { key: 'ask', nav: 'The ask', C: Team },
  { key: 'decide', nav: 'Decide', C: Decide },
  { key: 'facts', nav: 'Facts', C: Facts },
]

function useAnswers(enabled) {
  const [answers, setAnswers] = useState({})
  useEffect(() => {
    if (!enabled) return
    try { const raw = window.localStorage.getItem(STORAGE_KEY); if (raw) setAnswers(JSON.parse(raw)) } catch { /* storage blocked: nothing saved */ }
  }, [enabled])
  const set = useCallback((key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* same */ }
      return next
    })
  }, [])
  return [answers, set]
}

function CopyButton({ text, label }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) } catch { /* clipboard blocked */ }
  }
  return (
    <button type="button" onClick={copy} className="btn btn-grey text-[13px]"><CopyIcon size={16} />{done ? 'Copied' : label}</button>
  )
}

export default function Plan({ mode = 'owner', shareUrl = null }) {
  const readOnly = mode === 'guest'
  const [i, setI] = useState(0)
  const [present, setPresent] = useState(readOnly)
  const [answers, set] = useAnswers(!readOnly)
  const decided = DECISIONS.filter((d) => answers[d.key] || d.decided).length

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') setI((n) => Math.min(SECTIONS.length - 1, n + 1))
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setI((n) => Math.max(0, n - 1))
      if (e.key.toLowerCase() === 'p') setPresent((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const answersText = () => Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n') || 'no answers yet'
  const Current = SECTIONS[i].C

  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-safe">
        <div className="flex items-center justify-between pt-2">
          {readOnly ? (
            <span className="inline-flex min-h-[44px] items-center gap-2"><Mark className="h-7 w-auto" id="plan" /><span className="text-[17px] font-bold tracking-[-0.02em]">TurnUp</span><span className="text-[13px] muted">plan, shared read-only</span></span>
          ) : (
            <Link href="/dashboard" className="inline-flex min-h-[44px] items-center gap-1 pr-2 text-[15px] muted"><ChevronIcon size={16} className="rotate-180" /> Jobs</Link>
          )}
          <button type="button" onClick={() => setPresent((p) => !p)} className="inline-flex min-h-[44px] items-center px-2 text-[15px] muted">
            {present ? 'Show the rail' : 'Present'}
          </button>
        </div>

        <div className={`mt-4 ${present ? '' : 'md:grid md:grid-cols-[200px_1fr] md:gap-8'}`}>
          {!present && (
            <aside className="mb-6 md:mb-0">
              <div className="md:sticky md:top-4">
                <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide muted">Business plan</div>
                <ol className="flex gap-1 overflow-x-auto md:grid md:gap-0.5">
                  {SECTIONS.map((s, n) => (
                    <li key={s.key} className="shrink-0">
                      <button type="button" onClick={() => setI(n)}
                              className={`min-h-[44px] w-full whitespace-nowrap rounded-full px-3 text-left text-[14px] font-semibold md:rounded-xl ${n === i ? 'accent-fill' : 'muted'}`}>
                        <span className="mr-2 text-[11px] opacity-60">{n + 1}</span>{s.nav}
                      </button>
                    </li>
                  ))}
                </ol>
                {!readOnly && (
                  <div className="glass r-inner mt-4 hidden p-3 md:block">
                    <div className="text-[12px] font-semibold uppercase tracking-wide muted">Decisions</div>
                    <div className="text-[24px] font-bold tabular-nums">{decided}/{DECISIONS.length}</div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/[.08] dark:bg-white/[.1]">
                      <div className="h-2 rounded-full accent-fill" style={{ width: `${(decided / DECISIONS.length) * 100}%` }} />
                    </div>
                    <div className="mt-3 grid gap-2">
                      <CopyButton text={answersText()} label="Copy my answers" />
                      {shareUrl && <CopyButton text={shareUrl} label="Copy share link" />}
                    </div>
                    <div className="mt-3 text-[11px] muted">Arrow keys move. P presents.{shareUrl && ' The share link opens read-only, no sign-in.'}</div>
                  </div>
                )}
              </div>
            </aside>
          )}

          <div className="min-w-0">
            <Current answers={answers} set={set} readOnly={readOnly} />
            <div className="mt-10 flex items-center justify-between">
              <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} className="btn btn-grey">Back</button>
              <div className="text-[13px] font-semibold tabular-nums muted">{i + 1} / {SECTIONS.length}</div>
              <button type="button" onClick={() => setI((n) => Math.min(SECTIONS.length - 1, n + 1))} disabled={i === SECTIONS.length - 1} className="btn btn-filled">Next</button>
            </div>
            <div className="mt-6 text-[12px] muted">
              Updated {PLAN_META.updated}.{readOnly ? ' Shared by the owner. Figures are tagged fact, estimate or decision.' : ' Content in src/lib/plan.js. Answers stay on this device.'}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
