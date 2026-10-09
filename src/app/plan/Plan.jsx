'use client'
import { ChevronIcon, TickIcon } from '@/components/icons'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { VERSION } from '@/lib/version'
import {
  ALTERNATIVES, BEFORE_AFTER, CALC_DEFAULTS, DECISIONS, FACTS_TABLE, GTM_PHASES, MARKET_STATS,
  PLAN_META, PRICING_OPTIONS, PROBLEM_STATS, PRODUCT, RISKS, STAGES, STATUS, TEMPLATES, WAITING_ON_OWNER,
} from '@/lib/plan'

/*
 * The plan as a deck. One section on screen at a time; left and right arrows
 * move, P hides the rail for showing someone. The content is in
 * src/lib/plan.js and nothing here is a sentence of its own.
 *
 * The owner's taps on the DECIDE questions stay in this browser. The shared
 * record of those answers is the Claude asset that reads them back; this page
 * is the thing that gets shown, not the system of record.
 */

const STORAGE_KEY = 'mts-plan-answers'

const LIGHT = { green: 'bg-stage-done', amber: 'bg-stage-onway', red: 'bg-stage-paused', gray: 'bg-stage-booked/40' }

const KIND = {
  fact: { label: 'Fact', cls: 'text-stage-done bg-stage-done/12' },
  estimate: { label: 'Estimate', cls: 'text-stage-onway bg-stage-onway/12' },
  decision: { label: 'Decide', cls: 'text-stage-onsite bg-stage-onsite/12' },
}

function Tag({ kind }) {
  const k = KIND[kind] || KIND.estimate
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${k.cls}`}>{k.label}</span>
}

function Light({ state }) {
  return <span className={`inline-block h-3 w-3 rounded-full ${LIGHT[state] || LIGHT.gray}`} aria-label={state} />
}

function Hero({ value, label, sub, kind }) {
  return (
    <div className="glass r-inner p-5">
      <div className="text-[40px] font-bold leading-none tracking-[-0.02em] tabular-nums">{value}</div>
      <div className="mt-2 text-[15px] font-semibold">{label}</div>
      {sub && <div className="mt-1 text-[13px] muted">{sub}</div>}
      {kind && <div className="mt-2"><Tag kind={kind} /></div>}
    </div>
  )
}

function Section({ title, kicker, children }) {
  return (
    <section>
      {kicker && <div className="text-[13px] font-semibold uppercase tracking-wide accent-text">{kicker}</div>}
      <h2 className="mt-1 text-[32px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Table({ head, rows }) {
  return (
    <div className="glass r-outer overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-wide muted">
            {head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-t hairline">
              {cells.map((c, j) => <td key={j} className="px-4 py-3 align-top">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function useAnswers() {
  const [answers, setAnswers] = useState({})
  useEffect(() => {
    try { const raw = window.localStorage.getItem(STORAGE_KEY); if (raw) setAnswers(JSON.parse(raw)) } catch { /* storage blocked: nothing saved */ }
  }, [])
  const set = useCallback((key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* same */ }
      return next
    })
  }, [])
  return [answers, set]
}

function Check({ id, answers, set }) {
  const v = answers[`check:${id}`]
  const base = 'inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-semibold'
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => set(`check:${id}`, 'right')}
              className={`${base} ${v === 'right' ? 'bg-stage-done text-white' : 'bg-black/[.06] dark:bg-white/[.08]'}`}>Right</button>
      <button type="button" onClick={() => set(`check:${id}`, 'wrong')}
              className={`${base} ${v === 'wrong' ? 'bg-stage-paused text-white' : 'bg-black/[.06] dark:bg-white/[.08]'}`}>Wrong</button>
    </div>
  )
}

/* ---------- sections ---------- */

function Cover() {
  return (
    <Section kicker="TurnUp" title={PLAN_META.strap}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((s, i) => (
          <div key={s.key} className={`glass r-inner p-4 tone-${s.key === 'onway' ? 'onway' : s.key}`}>
            <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tint)' }}>Stage {i + 1}</div>
            <div className="text-[20px] font-bold">{s.label}</div>
            <div className="text-[14px] muted">{s.plain}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Hero value="1" label="link per job" />
        <Hero value="0" label="arrival times promised" />
        <Hero value="1" label="business using it" sub="customer zero" kind="fact" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={PLAN_META.demoUrl} target="_blank" rel="noreferrer" className="btn btn-filled">Open the demo card</a>
        <a href={PLAN_META.repoUrl} target="_blank" rel="noreferrer" className="btn">Code</a>
      </div>
    </Section>
  )
}

function WhereWeAre() {
  const greens = STATUS.filter((s) => s.state === 'green').length
  return (
    <Section kicker="Where we are" title={`Version ${VERSION}, live since ${PLAN_META.liveSince}`}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Hero value={`${greens}/${STATUS.length}`} label="items green" kind="fact" />
        <Hero value={WAITING_ON_OWNER.length} label="waiting on the owner" kind="fact" />
        <Hero value="0" label="revenue" sub="no price set" kind="fact" />
      </div>
      <div className="mt-4">
        <Table head={['Item', 'State', 'Note']}
               rows={STATUS.map((s) => [<b key="i">{s.item}</b>, <Light key="l" state={s.state} />, <span key="n" className="muted">{s.note}</span>])} />
      </div>
      <h3 className="mt-8 text-[20px] font-bold">Three taps only the owner can make</h3>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {WAITING_ON_OWNER.map((w, i) => (
          <li key={w.label} className="glass r-inner p-4 tone-onway">
            <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tint)' }}>Tap {i + 1}</div>
            <a href={w.href} target="_blank" rel="noreferrer" className="text-[17px] font-bold underline decoration-stage-onway/60">{w.label}</a>
            <div className="mt-1 text-[13px] muted">{w.step}</div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Problem() {
  return (
    <Section kicker="The problem" title="Waiting in for a trade">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROBLEM_STATS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="block"><Hero value={s.value} label={s.label} sub={s.source} kind={s.kind} /></a>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="glass r-inner p-5 tone-paused">
          <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tint)' }}>Today</div>
          <ol className="mt-2 grid gap-2">
            {BEFORE_AFTER.before.map((b, i) => (
              <li key={b} className="flex items-center gap-3 text-[15px] font-semibold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: 'var(--tint)' }}>{i + 1}</span>{b}
              </li>
            ))}
          </ol>
        </div>
        <div className="glass r-inner p-5 tone-done">
          <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tint)' }}>With TurnUp</div>
          <ol className="mt-2 grid gap-2">
            {BEFORE_AFTER.after.map((b, i) => (
              <li key={b} className="flex items-center gap-3 text-[15px] font-semibold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: 'var(--tint)' }}>{i + 1}</span>{b}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="mt-3 text-[13px] muted">Small samples. Two surveys were paid for by trade businesses. Their figures, not ours.</p>
    </Section>
  )
}

function Product() {
  return (
    <Section kicker="Product" title="What the card does, and will not">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-stage-done">Does</div>
          <div className="grid gap-2">
            {PRODUCT.does.map((d) => (
              <div key={d.label} className="glass r-inner flex items-center gap-3 px-4 py-3">
                <span className="text-stage-done"><TickIcon size={18} /></span>
                <span className="min-w-0"><span className="block font-semibold">{d.label}</span>{d.note && <span className="block text-[13px] muted">{d.note}</span>}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-stage-paused">Never</div>
          <div className="grid gap-2">
            {PRODUCT.never.map((d) => (
              <div key={d.label} className="glass r-inner px-4 py-3 font-semibold tone-paused" style={{ borderColor: 'color-mix(in srgb, var(--tint) 35%, transparent)' }}>{d.label}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass r-outer mt-4 flex items-center gap-2 overflow-x-auto p-4">
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold text-white accent-fill">{s.label}</span>
            {i < STAGES.length - 1 && <ChevronIcon size={16} style={{ color: 'var(--label-3)' }} />}
          </div>
        ))}
      </div>
    </Section>
  )
}

function Alternatives({ answers, set }) {
  return (
    <Section kicker="Why this, not that" title="Alternatives">
      <Table head={['Instead of', 'They', 'TurnUp', 'Check my work']}
             rows={ALTERNATIVES.map((a) => [<b key="w">{a.who}</b>, <span key="t" className="muted">{a.them}</span>, <b key="u" className="text-stage-done">{a.us}</b>, <Check key="c" id={`alt:${a.who}`} answers={answers} set={set} />])} />
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> A working view of the field, not a product-by-product study</div>
    </Section>
  )
}

function Market() {
  return (
    <Section kicker="Market" title="Who could hold a card">
      <div className="grid gap-3 sm:grid-cols-3">
        {MARKET_STATS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="block"><Hero value={s.value} label={s.label} sub={s.source} kind={s.kind} /></a>
        ))}
      </div>
      <h3 className="mt-8 text-[20px] font-bold">Formal processes the card could speak</h3>
      <div className="mt-3">
        <Table head={['Process', 'Stages', 'Feed', 'Fit', 'Call']}
               rows={TEMPLATES.map((t) => [<b key="p">{t.process}</b>, <span key="s" className="muted">{t.stages}</span>, <span key="f" className="muted">{t.feed}</span>, <Light key="l" state={t.fit} />, <b key="c">{t.call}</b>])} />
      </div>
      <p className="mt-3 text-[13px] muted">
        RIBA, PAS 2035 and the Law Society own their names. The card says follows, never approved by. No logos.
        <a href={PLAN_META.researchUrl} target="_blank" rel="noreferrer" className="ml-1 underline">Research note</a>
      </p>
    </Section>
  )
}

function Pricing({ answers, set }) {
  return (
    <Section kicker="Business model" title="Pricing: not decided">
      <div className="grid gap-3 sm:grid-cols-3">
        {PRICING_OPTIONS.map((p) => {
          const chosen = answers.pricing === p.label
          return (
            <button key={p.key} type="button" onClick={() => set('pricing', p.label)}
                    className="glass r-inner p-5 text-left"
                    style={chosen ? { outline: '3px solid var(--mts-accent)', outlineOffset: '-3px' } : undefined}>
              <Tag kind="decision" />
              <div className="mt-2 text-[20px] font-bold">{p.label}</div>
              <div className="text-[14px] muted">{p.shape}</div>
              <div className="mt-3 text-[14px]"><span className="font-bold text-stage-done">+</span> {p.pro}</div>
              <div className="text-[14px]"><span className="font-bold text-stage-paused">&minus;</span> {p.con}</div>
              <div className="mt-3 text-[12px] muted">Calculator placeholder: {p.placeholder} {p.unit}</div>
            </button>
          )
        })}
      </div>
      <div className="mt-4 text-[15px]">Chosen: <b>{answers.pricing || 'nothing yet'}</b></div>
    </Section>
  )
}

function Calculator() {
  const [v, setV] = useState(CALC_DEFAULTS)
  const rows = useMemo(() => {
    const out = []
    let customers = v.customers
    for (let m = 1; m <= v.monthsOut; m += 1) {
      customers = customers - customers * (v.monthlyChurnPct / 100) + v.newPerMonth
      out.push({ month: m, customers: Math.round(customers), mrr: Math.round(customers * v.pricePerMonth) })
    }
    return out
  }, [v])
  const last = rows[rows.length - 1] || { customers: 0, mrr: 0 }
  const max = Math.max(1, ...rows.map((r) => r.mrr))
  const field = (key, label, step = 1, min = 0) => (
    <label key={key} className="block text-[14px] font-medium muted">
      {label}
      <input type="number" step={step} min={min} value={v[key]} id={`calc-${key}`}
             onChange={(e) => setV({ ...v, [key]: Number(e.target.value) })} className="field mt-1.5" />
    </label>
  )
  return (
    <Section kicker="Financials" title="Turn the dials">
      <div className="mb-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> Every number here comes from the inputs. None is a forecast.</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass r-outer grid gap-3 p-5">
          {field('customers', 'Customers today')}
          {field('newPerMonth', 'New customers a month')}
          {field('pricePerMonth', 'Pounds per customer a month')}
          {field('monthlyChurnPct', 'Monthly churn, percent', 0.5)}
          {field('monthsOut', 'Months out', 1, 1)}
        </div>
        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <Hero value={`£${last.mrr.toLocaleString('en-GB')}`} label={`MRR at month ${v.monthsOut}`} />
            <Hero value={`£${(last.mrr * 12).toLocaleString('en-GB')}`} label="ARR run rate" />
            <Hero value={last.customers.toLocaleString('en-GB')} label="customers" />
          </div>
          <div className="glass r-outer mt-3 p-4">
            <div className="flex h-40 items-end gap-1">
              {rows.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center justify-end" title={`Month ${r.month}: £${r.mrr}`}>
                  <div className="w-full rounded-t accent-fill" style={{ height: `${(r.mrr / max) * 100}%` }} />
                  <div className="mt-1 text-[10px] muted">{r.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[12px] muted">Monthly recurring revenue by month, pounds</div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function GoToMarket() {
  return (
    <Section kicker="Go to market" title="Gates, not dates">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GTM_PHASES.map((p) => (
          <div key={p.phase} className="glass r-inner p-5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold uppercase tracking-wide muted">Phase {p.phase}</div>
              <Light state={p.state} />
            </div>
            <div className="text-[20px] font-bold">{p.label}</div>
            <div className="text-[13px] muted">{p.when}</div>
            <div className="mt-3 rounded-full px-3 py-2 text-[12px] font-semibold text-white accent-fill">Gate: {p.gate}</div>
            <ul className="mt-3 grid gap-1 text-[14px]">
              {p.moves.map((m) => <li key={m} className="flex gap-2"><ChevronIcon size={14} style={{ color: 'var(--label-3)', marginTop: 4 }} />{m}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Risks({ answers, set }) {
  const tone = (l) => (l === 'high' ? 'red' : l === 'medium' ? 'amber' : 'green')
  return (
    <Section kicker="Risks" title="What could stop it">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RISKS.map((r) => (
          <div key={r.label} className="glass r-inner p-5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold uppercase tracking-wide muted">{r.likelihood}</div>
              <Light state={tone(r.likelihood)} />
            </div>
            <div className="mt-2 text-[18px] font-bold">{r.label}</div>
            <div className="text-[14px] muted">{r.answer}</div>
            <div className="mt-3"><Check id={`risk:${r.label}`} answers={answers} set={set} /></div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Decide({ answers, set }) {
  return (
    <Section kicker="Decide" title="Only the owner can answer these">
      <div className="grid gap-3 sm:grid-cols-2">
        {DECISIONS.map((d) => (
          <div key={d.key} className="glass r-inner p-5">
            <Tag kind="decision" />
            <div className="mt-2 text-[18px] font-bold">{d.question}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.options.map((o) => {
                const on = answers[d.key] === o
                return (
                  <button key={o} type="button" onClick={() => set(d.key, o)}
                          className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-semibold ${on ? 'accent-fill' : 'bg-black/[.06] dark:bg-white/[.08]'}`}>{o}</button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Facts() {
  return (
    <Section kicker="Facts" title="Every number, and where it came from">
      <Table head={['Figure', 'What', 'Source', 'Kind']}
             rows={FACTS_TABLE.map((f) => [
               <b key="f" className="whitespace-nowrap tabular-nums">{f.figure}</b>,
               <span key="w">{f.what}</span>,
               <a key="s" href={f.href} target="_blank" rel="noreferrer" className="underline muted">{f.source}</a>,
               <Tag key="k" kind={f.kind} />,
             ])} />
    </Section>
  )
}

/* ---------- shell ---------- */

const SECTIONS = [
  { key: 'cover', nav: 'TurnUp', C: Cover },
  { key: 'status', nav: 'Where we are', C: WhereWeAre },
  { key: 'problem', nav: 'Problem', C: Problem },
  { key: 'product', nav: 'Product', C: Product },
  { key: 'alternatives', nav: 'Alternatives', C: Alternatives },
  { key: 'market', nav: 'Market', C: Market },
  { key: 'pricing', nav: 'Pricing', C: Pricing },
  { key: 'calc', nav: 'Financials', C: Calculator },
  { key: 'gtm', nav: 'Go to market', C: GoToMarket },
  { key: 'risks', nav: 'Risks', C: Risks },
  { key: 'decide', nav: 'Decide', C: Decide },
  { key: 'facts', nav: 'Facts', C: Facts },
]

export default function Plan() {
  const [i, setI] = useState(0)
  const [present, setPresent] = useState(false)
  const [answers, set] = useAnswers()
  const decided = DECISIONS.filter((d) => answers[d.key]).length

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

  const copyAnswers = async () => {
    const lines = Object.entries(answers).map(([k, v]) => `${k}: ${v}`)
    try { await navigator.clipboard.writeText(lines.join('\n') || 'no answers yet') } catch { /* clipboard blocked */ }
  }

  const Current = SECTIONS[i].C

  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-safe">
        <div className="flex items-center justify-between pt-2">
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center gap-1 pr-2 text-[15px] muted">
            <ChevronIcon size={16} className="rotate-180" /> Jobs
          </Link>
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
                <div className="glass r-inner mt-4 hidden p-3 md:block">
                  <div className="text-[12px] font-semibold uppercase tracking-wide muted">Decisions</div>
                  <div className="text-[24px] font-bold tabular-nums">{decided}/{DECISIONS.length}</div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/[.08] dark:bg-white/[.1]">
                    <div className="h-2 rounded-full accent-fill" style={{ width: `${(decided / DECISIONS.length) * 100}%` }} />
                  </div>
                  <button type="button" onClick={copyAnswers} className="btn mt-3 w-full text-[13px]">Copy my answers</button>
                  <div className="mt-3 text-[11px] muted">Arrow keys move. P presents.</div>
                </div>
              </div>
            </aside>
          )}

          <div className="min-w-0">
            <Current answers={answers} set={set} />
            <div className="mt-10 flex items-center justify-between">
              <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} className="btn disabled:opacity-40">Back</button>
              <div className="text-[13px] font-semibold muted tabular-nums">{i + 1} / {SECTIONS.length}</div>
              <button type="button" onClick={() => setI((n) => Math.min(SECTIONS.length - 1, n + 1))} disabled={i === SECTIONS.length - 1} className="btn btn-filled disabled:opacity-40">Next</button>
            </div>
            <div className="mt-6 text-[12px] muted">Updated {PLAN_META.updated}. Content in src/lib/plan.js. Answers stay on this device.</div>
          </div>
        </div>
      </main>
    </div>
  )
}
