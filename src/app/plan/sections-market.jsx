'use client'
import { TickIcon } from '@/components/icons'

import { useMemo, useState } from 'react'
import { ALTERNATIVES, CALC_DEFAULTS, DECISIONS, MARKET_STATS, PLAN_META, SEGMENTS, TEMPLATES } from '@/lib/plan'
import { AT_THE_CAP, FEATURES, FREE_CARDS_PER_MONTH, PRICING_RULES, TIERS } from '@/lib/pricing'
import { Check, Chips, Eyebrow, Hero, Light, Section, Steps, Sub, Table, Tag } from './ui'

/* Who else, who buys, what they pay, and what that adds up to. */

export function Alternatives({ answers, set, readOnly }) {
  const head = readOnly ? ['Instead of', 'They', 'TurnUp'] : ['Instead of', 'They', 'TurnUp', 'Check my work']
  return (
    <Section kicker="Why this, not that" title="Alternatives">
      <Table head={head}
             rows={ALTERNATIVES.map((a) => [
               <b key="w">{a.who}</b>,
               <span key="t" className="muted">{a.them}</span>,
               <b key="u" className="text-stage-done">{a.us}</b>,
               ...(readOnly ? [] : [<Check key="c" id={`alt:${a.who}`} answers={answers} set={set} />]),
             ])} />
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> A working view of the field, not a product-by-product study</div>
    </Section>
  )
}

export function Market() {
  return (
    <Section kicker="Market" title="Who sends a card">
      <div className="grid gap-3 sm:grid-cols-3">
        {MARKET_STATS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="block"><Hero value={s.value} label={s.label} sub={s.source} kind={s.kind} /></a>
        ))}
      </div>
      <Sub>Six kinds of sender</Sub>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SEGMENTS.map((s, i) => (
          <div key={s.who} className="glass r-inner p-4">
            <div className="flex items-center justify-between"><Eyebrow>{i + 1}</Eyebrow><span className="text-[12px] font-semibold accent-text">{s.plan} plan</span></div>
            <div className="mt-1 text-[17px] font-bold">{s.who}</div>
            <div className="text-[13px] muted">{s.why}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> Order is a guess. The first one is a fact.</div>
      <Sub>Formal processes the card could speak</Sub>
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

const CAP_Q = DECISIONS.find((d) => d.key === 'freeCap')
const PRICE_Q = DECISIONS.find((d) => d.key === 'tradePrice')

export function Pricing({ answers, set, readOnly }) {
  const cap = Number(answers.freeCap || CAP_Q.decided || FREE_CARDS_PER_MONTH)
  const tradePrice = Number(answers.tradePrice || PRICE_Q.decided || TIERS[1].price)
  const price = (t) => {
    if (t.key === 'home') return 'Free'
    if (t.key === 'trade') return `£${tradePrice}`
    if (t.price == null) return 'Quoted'
    return `£${t.price}`
  }
  return (
    <Section kicker="Business model" title="Free for homes. Paid for the trade bits.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.key} className={`glass r-inner p-5 tone-${t.tone}`}>
            <Eyebrow tint>{t.name}</Eyebrow>
            <div className="mt-1 text-[32px] font-bold leading-none tabular-nums">{price(t)}</div>
            <div className="text-[13px] muted">{t.per}</div>
            <div className="mt-3 text-[15px] font-semibold">{t.who}</div>
            <div className="text-[13px] muted">{t.key === 'home' ? `${cap} cards a month` : t.cards}</div>
            <div className="mt-3 text-[13px]">{t.line}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="decision" /> Proposed. Nothing is charged today and nothing is wired to a payment provider.</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="glass r-inner p-5">
          <Tag kind="decision" />
          <div className="mt-2 text-[17px] font-bold">{CAP_Q.question}</div>
          <div className="mt-3"><Chips options={CAP_Q.options} value={answers.freeCap || CAP_Q.decided} onPick={(o) => set('freeCap', o)} readOnly={readOnly} /></div>
          <div className="mt-2 text-[12px] muted">Decided {CAP_Q.decidedAt}. The Home tile above follows it.</div>
        </div>
        <div className="glass r-inner p-5">
          <Tag kind="decision" />
          <div className="mt-2 text-[17px] font-bold">{PRICE_Q.question}</div>
          <div className="mt-3"><Chips options={PRICE_Q.options} value={answers.tradePrice || PRICE_Q.decided} onPick={(o) => set('tradePrice', o)} readOnly={readOnly} /></div>
          <div className="mt-2 text-[12px] muted">Decided {PRICE_Q.decidedAt}. The calculator follows it.</div>
        </div>
      </div>

      <Sub>What each plan includes</Sub>
      <div className="mt-3">
        <Table head={['Feature', ...TIERS.map((t) => t.name), 'Built?']}
               rows={FEATURES.map((f) => [
                 <span key="n" className="font-semibold">{f.name}</span>,
                 ...TIERS.map((t) => (f[t.key] ? <span key={t.key} className="text-stage-done"><TickIcon size={18} /></span> : <span key={t.key} className="muted">&ndash;</span>)),
                 <Light key="b" state={f.live ? 'green' : 'gray'} />,
               ])} />
      </div>
      <div className="mt-2 text-[12px] muted">A grey dot is a promise about something not built yet, read against the roadmap on 9 Oct 2026.</div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Sub>Why the line sits there</Sub>
          <div className="mt-3 grid gap-2">
            {PRICING_RULES.map((r) => (
              <div key={r.rule} className="glass r-inner px-4 py-3">
                <div className="font-semibold">{r.rule}</div>
                <div className="text-[13px] muted">{r.why}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Sub>At the cap</Sub>
          <div className="glass r-inner mt-3 p-5"><Steps items={AT_THE_CAP} tone="done" /></div>
        </div>
      </div>
    </Section>
  )
}

/** Every figure comes from the inputs. The chart is drawn in pixels so it cannot be empty. */
export function Financials({ answers }) {
  const [v, setV] = useState(CALC_DEFAULTS)
  const price = Number(answers.tradePrice || PRICE_Q.decided || v.price)
  const rows = useMemo(() => {
    const out = []
    let paid = v.paid
    for (let m = 1; m <= v.months; m += 1) {
      paid = paid - paid * (v.churnPct / 100) + v.newPaid
      const mrr = Math.round(paid * price)
      out.push({ month: m, paid: Math.round(paid), mrr, margin: mrr - v.hosting })
    }
    return out
  }, [v, price])
  const last = rows[rows.length - 1] || { paid: 0, mrr: 0, margin: 0 }
  const max = Math.max(1, ...rows.map((r) => r.mrr))
  const H = 140
  const field = (key, label, step = 1, min = 0) => (
    <label key={key} className="block text-[14px] font-medium muted">
      {label}
      <input type="number" step={step} min={min} value={v[key]} id={`calc-${key}`}
             onChange={(e) => setV({ ...v, [key]: Number(e.target.value) })} className="field mt-1.5" />
    </label>
  )
  const money = (n) => `£${n.toLocaleString('en-GB')}`
  return (
    <Section kicker="Financials" title="Turn the dials">
      <div className="mb-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> Every number here comes from the inputs. None is a forecast. The price follows the Trade decision.</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass r-outer grid gap-3 p-5">
          {field('paid', 'Paying customers today')}
          {field('newPaid', 'New paying customers a month')}
          <label className="block text-[14px] font-medium muted">Pounds per customer a month
            <input type="number" value={price} readOnly id="calc-price" className="field mt-1.5 opacity-70" /></label>
          {field('churnPct', 'Monthly churn, percent', 0.5)}
          {field('hosting', 'Hosting and services, pounds a month')}
          {field('months', 'Months out', 1, 1)}
        </div>
        <div className="min-w-0 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Hero value={money(last.mrr)} label={`MRR at month ${v.months}`} />
            <Hero value={money(last.mrr * 12)} label="ARR run rate" />
            <Hero value={last.paid.toLocaleString('en-GB')} label="paying customers" />
            <Hero value={money(last.margin)} label="a month after hosting" />
          </div>
          <div className="glass r-outer mt-3 p-4">
            <div className="flex items-end gap-1" style={{ height: `${H + 20}px` }}>
              {rows.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center justify-end" title={`Month ${r.month}: ${money(r.mrr)}`}>
                  <div className="w-full rounded-t accent-fill" style={{ height: `${Math.max(2, Math.round((r.mrr / max) * H))}px` }} />
                  <div className="mt-1 text-[10px] muted">{r.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] muted">
              <span>Monthly recurring revenue by month</span>
              <span className="tabular-nums">top of chart {money(max)}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
