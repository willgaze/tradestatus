'use client'
import { TickIcon } from '@/components/icons'

import { useMemo, useState } from 'react'
import { ALTERNATIVES, CALC_DEFAULTS, DECISIONS, MARKET_STATS, PLAN_META, RIVALS, SEGMENTS, TEMPLATES } from '@/lib/plan'
import { ENTERPRISE, FREE_FOR, NEVER_CHARGED, PRICING_RULES, WEDGES } from '@/lib/pricing'
import { Check, Chips, Eyebrow, Hero, Light, Section, Sub, Table, Tag } from './ui'

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

/** Five rivals: their edge, ours, and the move that beats them. */
export function Rivals() {
  return (
    <Section kicker="Rivals" title="Their edge, our edge, the move">
      <div className="grid gap-3">
        {RIVALS.map((r) => (
          <div key={r.name} className="glass r-inner p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a href={r.href} target="_blank" rel="noreferrer" className="text-[18px] font-bold underline decoration-black/20 dark:decoration-white/20">{r.name}</a>
              <span className="text-[12px] muted">{r.who}</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div><Eyebrow>Their edge</Eyebrow><div className="mt-1 text-[14px]">{r.their}</div></div>
              <div><Eyebrow>Our edge</Eyebrow><div className="mt-1 text-[14px]">{r.ours}</div></div>
              <div className="rounded-xl p-3" style={{ background: 'color-mix(in srgb, var(--mts-accent) 10%, transparent)' }}><Eyebrow tint>Beat them by</Eyebrow><div className="mt-1 text-[14px] font-semibold">{r.beat}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> The moves are judgement. The facts behind them are on the Facts page and the landscape asset.</div>
    </Section>
  )
}

export function Market() {
  return (
    <Section kicker="Market" title="Who sends a card, and who pays for one">
      <div className="grid gap-3 sm:grid-cols-3">
        {MARKET_STATS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="block"><Hero value={s.value} label={s.label} sub={s.source} kind={s.kind} /></a>
        ))}
      </div>
      <Sub>Six kinds of sender, in the order of the six moves</Sub>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SEGMENTS.map((s, i) => (
          <div key={s.who} className="glass r-inner p-4">
            <div className="flex items-center justify-between"><Eyebrow>{i + 1}</Eyebrow><span className="text-[12px] font-semibold accent-text">{s.plan}</span></div>
            <div className="mt-1 text-[17px] font-bold">{s.who}</div>
            <div className="text-[13px] muted">{s.why}</div>
          </div>
        ))}
      </div>
      <Sub>Where a regulator already prices the missed visit</Sub>
      <div className="mt-3">
        <Table head={['Sector', 'Per missed visit', 'Who owns the appointment', 'System it lives in', 'Our place', 'Fit']}
               rows={WEDGES.map((w) => [
                 <a key="s" href={w.href} target="_blank" rel="noreferrer" className="font-bold underline decoration-black/20 dark:decoration-white/20">{w.sector}</a>,
                 <b key="m">{w.perMiss}</b>,
                 <span key="o">{w.owns}</span>,
                 <span key="y" className="muted">{w.system}</span>,
                 <span key="u">{w.ours}</span>,
                 <Light key="l" state={w.state} />,
               ])} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[12px] muted"><Tag kind="fact" /> Figures as found 9 Oct 2026. Check each regulator before quoting to a customer.</div>
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

const Q = Object.fromEntries(DECISIONS.map((d) => [d.key, d]))
const pick = (answers, key, fallback) => Number(answers[key] || Q[key]?.decided || fallback)

function DecideCard({ q, answers, set, readOnly, unit }) {
  return (
    <div className="glass r-inner p-4">
      <Tag kind="decision" />
      <div className="mt-2 text-[15px] font-bold">{q.question}</div>
      <div className="mt-3"><Chips options={q.options} value={answers[q.key] || q.decided} onPick={(o) => set(q.key, o)} readOnly={readOnly} /></div>
      {unit && <div className="mt-2 text-[12px] muted">{unit}</div>}
    </div>
  )
}

export function Pricing({ answers, set, readOnly }) {
  const pence = pick(answers, 'perCard', ENTERPRISE.perCardPence)
  return (
    <Section kicker="Business model" title="Free for every sender. Enterprise pays per card.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Hero value="£0" label="homes, trades, small firms" sub="no cap, no card details, no activation" kind="fact" />
        <Hero value={`${pence}p`} label="per card, enterprise" sub={`placeholder, minimum £${ENTERPRISE.minimumMonthly} a month`} kind="decision" />
        <Hero value="£30 to £50" label="what one missed visit costs them" sub="Ofgem, Ofcom, Ofwat, the Ombudsman" kind="fact" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="glass r-inner p-5 tone-done">
          <Eyebrow tint>Free, forever</Eyebrow>
          <div className="mt-2 grid gap-2">
            {FREE_FOR.map((f) => (
              <div key={f.who}><div className="font-semibold">{f.who}</div><div className="text-[13px] muted">{f.why}</div></div>
            ))}
          </div>
          <div className="mt-3 border-t pt-3 hairline">
            <Eyebrow>Never charged for, whoever sends</Eyebrow>
            <ul className="mt-2 grid gap-1 text-[14px]">
              {NEVER_CHARGED.map((n) => <li key={n} className="flex gap-2"><span className="mt-0.5 shrink-0 text-stage-done"><TickIcon size={16} /></span>{n}</li>)}
            </ul>
          </div>
        </div>
        <div className="glass r-inner p-5 tone-onsite">
          <Eyebrow tint>Enterprise</Eyebrow>
          <div className="mt-2 text-[15px] font-semibold">{ENTERPRISE.line}</div>
          <ul className="mt-3 grid gap-1 text-[14px]">
            {ENTERPRISE.gets.map((g) => <li key={g} className="flex gap-2"><span className="mt-0.5 shrink-0" style={{ color: 'var(--tint)' }}><TickIcon size={16} /></span>{g}</li>)}
          </ul>
          <div className="mt-3 rounded-xl p-3 text-[14px] font-semibold" style={{ background: 'color-mix(in srgb, var(--tint) 12%, transparent)' }}>{ENTERPRISE.why}</div>
        </div>
      </div>

      <Sub>Decide</Sub>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <DecideCard q={Q.perCard} answers={answers} set={set} readOnly={readOnly} unit={`Default ${ENTERPRISE.perCardPence}. The tile above follows it.`} />
        <DecideCard q={Q.firstWedge} answers={answers} set={set} readOnly={readOnly} unit="The Market page has the per-miss figure for each." />
      </div>

      <Sub>Why the line sits there</Sub>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {PRICING_RULES.map((r) => (
          <div key={r.rule} className="glass r-inner px-4 py-3">
            <div className="font-semibold">{r.rule}</div>
            <div className="text-[13px] muted">{r.why}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] muted"><Tag kind="decision" /> Proposed. Nothing is charged today and nothing is wired to a payment provider.</div>
    </Section>
  )
}

/** Every figure comes from the inputs and the per-card decision. The chart is drawn in pixels so it cannot be empty. */
export function Financials({ answers }) {
  const [v, setV] = useState(CALC_DEFAULTS)
  const pence = pick(answers, 'perCard', ENTERPRISE.perCardPence)
  const rows = useMemo(() => {
    const out = []
    let free = v.freeSenders, ent = v.enterprises
    for (let m = 1; m <= v.months; m += 1) {
      free += v.newFree
      ent += v.newEnterprises
      const cards = ent * v.cardsPerEnterprise
      const revenue = Math.round(Math.max(cards * (pence / 100), ent >= 1 ? ENTERPRISE.minimumMonthly * Math.floor(ent) : 0))
      out.push({ month: m, free: Math.round(free), ent: Math.round(ent * 100) / 100, cards: Math.round(cards), revenue, margin: revenue - v.hosting })
    }
    return out
  }, [v, pence])
  const last = rows[rows.length - 1] || { free: 0, ent: 0, cards: 0, revenue: 0, margin: 0 }
  const max = Math.max(1, ...rows.map((r) => r.revenue))
  const H = 140
  const money = (n) => `£${Math.round(n).toLocaleString('en-GB')}`
  const field = (key, label, step = 1, min = 0) => (
    <label key={key} className="block text-[14px] font-medium muted">
      {label}
      <input type="number" step={step} min={min} value={v[key]} id={`calc-${key}`}
             onChange={(e) => setV({ ...v, [key]: Number(e.target.value) })} className="field mt-1.5" />
    </label>
  )
  const firstPound = rows.find((r) => r.revenue > 0)
  return (
    <Section kicker="Financials" title="Turn the dials">
      <div className="mb-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> Every number here comes from the inputs. None is a forecast. The price follows the per-card decision. Free senders earn nothing and cost hosting; that is the point.</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass r-outer grid gap-3 p-5">
          {field('freeSenders', 'Free senders today')}
          {field('newFree', 'New free senders a month')}
          {field('enterprises', 'Enterprise customers today', 0.25)}
          {field('newEnterprises', 'New enterprises a month', 0.25)}
          {field('cardsPerEnterprise', 'Cards per enterprise a month', 100)}
          <label className="block text-[14px] font-medium muted">Pence per card
            <input type="number" value={pence} readOnly id="calc-pence" className="field mt-1.5 opacity-70" /></label>
          {field('hosting', 'Hosting and services, pounds a month')}
          {field('months', 'Months out', 1, 1)}
        </div>
        <div className="min-w-0 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Hero value={money(last.revenue)} label={`revenue, month ${v.months}`} />
            <Hero value={money(last.revenue * 12)} label="run rate, a year" />
            <Hero value={last.free.toLocaleString('en-GB')} label="free senders" sub={`${last.cards.toLocaleString('en-GB')} enterprise cards a month`} />
            <Hero value={firstPound ? `month ${firstPound.month}` : 'never'} label="first pound" sub="when an enterprise signs" />
          </div>
          <div className="glass r-outer mt-3 p-4">
            <div className="flex items-end gap-1" style={{ height: `${H + 20}px` }}>
              {rows.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center justify-end" title={`Month ${r.month}: ${money(r.revenue)}`}>
                  <div className="w-full rounded-t accent-fill" style={{ height: `${Math.max(2, Math.round((r.revenue / max) * H))}px` }} />
                  <div className="mt-1 text-[10px] muted">{r.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] muted">
              <span>Enterprise revenue by month</span>
              <span className="tabular-nums">top of chart {money(max)}</span>
            </div>
          </div>
          <div className="mt-3 text-[13px] muted">After hosting at month {v.months}: <b className="tabular-nums">{money(last.margin)}</b> a month.</div>
        </div>
      </div>
    </Section>
  )
}
