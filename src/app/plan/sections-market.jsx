'use client'
import { ChevronIcon, TickIcon } from '@/components/icons'

import { useMemo, useState } from 'react'
import { ALTERNATIVES, CALC_DEFAULTS, DECISIONS, MARKET_STATS, PLAN_META, SEGMENTS, TEMPLATES } from '@/lib/plan'
import { ACTIVATION, AT_ACTIVATION, BUNDLES, FREE_CORE, PAYMENTS, PRICING_RULES, REFERRALS, TIERS, weekly } from '@/lib/pricing'
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
            <div className="flex items-center justify-between"><Eyebrow>{i + 1}</Eyebrow><span className="text-[12px] font-semibold accent-text">{s.plan}</span></div>
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

/* The open pricing decisions, read once. */
const Q = Object.fromEntries(DECISIONS.map((d) => [d.key, d]))
const pick = (answers, key, fallback) => Number(answers[key] || Q[key]?.decided || fallback)

/** The journey from first card to first pound, as a row of steps. */
function ActivationFlow({ jobs, fee, annual }) {
  const steps = [
    { label: 'Sign up', note: 'Name and phone. No card.' },
    { label: 'Send cards', note: 'Free. No cap. The job too.' },
    { label: `A month in, ${jobs}+ jobs`, note: 'They are staying.' },
    { label: `£${fee} once, £${annual} a year`, note: 'Card details on file.' },
    { label: 'Bundles', note: 'Upsold, never pushed.' },
  ]
  return (
    <div className="glass r-outer mt-4 overflow-x-auto p-4">
      <div className="flex min-w-[640px] items-stretch gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-2">
            <div className={`glass r-inner flex-1 p-3 ${i === 3 ? 'tone-onway' : i === 4 ? 'tone-done' : 'tone-booked'}`}>
              <Eyebrow tint>Step {i + 1}</Eyebrow>
              <div className="text-[15px] font-bold">{s.label}</div>
              <div className="text-[12px] muted">{s.note}</div>
            </div>
            {i < steps.length - 1 && <ChevronIcon size={16} style={{ color: 'var(--label-3)' }} className="shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const jobs = pick(answers, 'activationJobs', ACTIVATION.afterJobs)
  const fee = pick(answers, 'activationFee', ACTIVATION.fee)
  const annual = pick(answers, 'annualFee', ACTIVATION.annual)
  const margin = pick(answers, 'paymentMargin', PAYMENTS.marginPct)
  const refJobs = pick(answers, 'referralJobs', REFERRALS.perReferral)
  const example = 180
  const processorTake = (example * PAYMENTS.processorPct) / 100 + PAYMENTS.processorPence / 100
  const ourTake = (example * margin) / 100

  return (
    <Section kicker="Business model" title="The card is free. The features are the business.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Hero value="£0" label="the card and the job" sub="no cap, no card details, ever" />
        <Hero value={`£${fee}`} label="activation, once" sub={`after a month and ${jobs} jobs, then £${annual} a year`} kind="decision" />
        <Hero value={`${margin}%`} label="on payments through the card" sub="on top of the processor, not the job" kind="decision" />
      </div>

      <ActivationFlow jobs={jobs} fee={fee} annual={annual} />

      <Sub>Free, forever</Sub>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {FREE_CORE.map((f) => (
          <div key={f} className="glass r-inner flex items-center gap-3 px-4 py-3 text-[14px] font-semibold"><span className="text-stage-done"><TickIcon size={18} /></span>{f}</div>
        ))}
      </div>

      <Sub>Three bundles, each sold on its own</Sub>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {BUNDLES.map((b) => (
          <div key={b.key} className={`glass r-inner p-5 tone-${b.tone}`}>
            <div className="flex items-baseline justify-between gap-2">
              <Eyebrow tint>{b.name}</Eyebrow>
              <span className="text-[13px] font-semibold tabular-nums">£{b.price} a month or £{weekly(b.price)} a week</span>
            </div>
            <div className="mt-1 text-[17px] font-bold">{b.line}</div>
            <ul className="mt-3 grid gap-1 text-[14px]">
              {b.features.map((f) => <li key={f} className="flex gap-2"><span className="mt-0.5 shrink-0" style={{ color: 'var(--tint)' }}><TickIcon size={16} /></span>{f}</li>)}
            </ul>
            {b.note && <div className="mt-3 text-[12px] muted">{b.note}</div>}
          </div>
        ))}
      </div>

      <Sub>Or a tier, for anyone who would rather not pick</Sub>
      <div className="mt-3">
        <Table head={['Tier', 'Bundles', 'Vans', 'A month', 'A week']}
               rows={TIERS.map((t) => [
                 <b key="n">{t.name}</b>,
                 <span key="b" className="muted">{t.line}</span>,
                 <span key="v" className="tabular-nums">{t.vans}</span>,
                 <b key="m" className="tabular-nums">{t.monthly ? `£${t.monthly}` : 'Free'}</b>,
                 <b key="w" className="tabular-nums">{t.monthly ? `£${weekly(t.monthly)}` : 'Free'}</b>,
               ])} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[12px] muted"><Tag kind="estimate" /> Bundle and tier prices are placeholders. Weekly is monthly over four, rounded up, for the trade paid on a Friday.</div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass r-inner p-5 tone-done">
          <Eyebrow tint>Get paid, worked through</Eyebrow>
          <div className="mt-1 text-[17px] font-bold">A £{example} job paid through the card</div>
          <div className="mt-3 grid gap-1 text-[14px] tabular-nums">
            <div className="flex justify-between"><span className="muted">Processor, {PAYMENTS.processorPct}% + {PAYMENTS.processorPence}p</span><b>£{processorTake.toFixed(2)}</b></div>
            <div className="flex justify-between"><span className="muted">TurnUp, {margin}%</span><b>£{ourTake.toFixed(2)}</b></div>
            <div className="flex justify-between border-t pt-1 hairline"><span className="muted">The trade keeps</span><b>£{(example - processorTake - ourTake).toFixed(2)}</b></div>
          </div>
          <div className="mt-3 text-[12px] muted">{PAYMENTS.needs} Processor rate is Stripe&apos;s published UK card rate, Oct 2026.</div>
        </div>
        <div className="glass r-inner p-5 tone-onsite">
          <Eyebrow tint>Referrals, the Dropbox way</Eyebrow>
          <div className="mt-1 text-[17px] font-bold">Free jobs before activation</div>
          <div className="mt-3 grid gap-1 text-[14px]">
            <div className="flex justify-between"><span className="muted">Each mate who sends a card</span><b className="tabular-nums">+{refJobs} jobs, both of you</b></div>
            <div className="flex justify-between"><span className="muted">{REFERRALS.waiveYearAt} mates</span><b>First year&apos;s fee waived</b></div>
            <div className="flex justify-between"><span className="muted">{REFERRALS.bundleYearAt} mates</span><b>A bundle for a year</b></div>
          </div>
          <div className="mt-3 text-[12px] muted">{REFERRALS.how}</div>
        </div>
      </div>

      <Sub>Decide</Sub>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DecideCard q={Q.activationJobs} answers={answers} set={set} readOnly={readOnly} unit={`Default ${ACTIVATION.afterJobs}. And a month in, always.`} />
        <DecideCard q={Q.activationFee} answers={answers} set={set} readOnly={readOnly} unit={`Default ${ACTIVATION.fee}. Card details on file from here.`} />
        <DecideCard q={Q.annualFee} answers={answers} set={set} readOnly={readOnly} unit={`Default ${ACTIVATION.annual}. Zero means activation only.`} />
        <DecideCard q={Q.paymentMargin} answers={answers} set={set} readOnly={readOnly} unit={`Default ${PAYMENTS.marginPct}. The example above follows it.`} />
        <DecideCard q={Q.referralJobs} answers={answers} set={set} readOnly={readOnly} unit={`Default ${REFERRALS.perReferral}. The referral card follows it.`} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <Sub>At the activation line</Sub>
          <div className="glass r-inner mt-3 p-5"><Steps items={AT_ACTIVATION} tone="done" /></div>
        </div>
      </div>
    </Section>
  )
}

/** Every figure comes from the inputs and the pricing decisions. The chart is drawn in pixels so it cannot be empty. */
export function Financials({ answers }) {
  const [v, setV] = useState(CALC_DEFAULTS)
  const fee = pick(answers, 'activationFee', ACTIVATION.fee)
  const annual = pick(answers, 'annualFee', ACTIVATION.annual)
  const margin = pick(answers, 'paymentMargin', PAYMENTS.marginPct)

  const rows = useMemo(() => {
    const out = []
    let trades = v.trades
    for (let m = 1; m <= v.months; m += 1) {
      trades = trades - trades * (v.churnPct / 100) + v.newTrades
      const activated = trades * (v.activatePct / 100)
      const oneOff = v.newTrades * (v.activatePct / 100) * fee
      const yearly = (activated * annual) / 12
      const bundles = activated * (v.bundlePct / 100) * v.bundlePrice
      const payments = activated * (v.payPct / 100) * v.jobsPerMonth * v.jobValue * (margin / 100)
      const total = Math.round(oneOff + yearly + bundles + payments)
      out.push({ month: m, trades: Math.round(trades), activated: Math.round(activated), oneOff: Math.round(oneOff), yearly: Math.round(yearly), bundles: Math.round(bundles), payments: Math.round(payments), total, margin: total - v.hosting })
    }
    return out
  }, [v, fee, annual, margin])

  const last = rows[rows.length - 1] || { trades: 0, activated: 0, oneOff: 0, yearly: 0, bundles: 0, payments: 0, total: 0, margin: 0 }
  const max = Math.max(1, ...rows.map((r) => r.total))
  const H = 140
  const money = (n) => `£${Math.round(n).toLocaleString('en-GB')}`
  const field = (key, label, step = 1, min = 0) => (
    <label key={key} className="block text-[14px] font-medium muted">
      {label}
      <input type="number" step={step} min={min} value={v[key]} id={`calc-${key}`}
             onChange={(e) => setV({ ...v, [key]: Number(e.target.value) })} className="field mt-1.5" />
    </label>
  )
  const parts = [
    { key: 'payments', label: 'Payments margin', cls: 'bg-stage-done' },
    { key: 'bundles', label: 'Bundles', cls: 'bg-stage-onsite' },
    { key: 'yearly', label: 'Annual fees', cls: 'bg-stage-onway' },
    { key: 'oneOff', label: 'Activations', cls: 'bg-stage-booked' },
  ]

  return (
    <Section kicker="Financials" title="Turn the dials">
      <div className="mb-3 flex items-center gap-2 text-[13px] muted"><Tag kind="estimate" /> Every number here comes from the inputs. None is a forecast. The fee, the annual and the margin follow the pricing decisions.</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass r-outer grid gap-3 p-5">
          {field('trades', 'Trades sending cards today')}
          {field('newTrades', 'New trades a month')}
          {field('activatePct', 'Percent that reach activation')}
          {field('bundlePct', 'Percent of activated who buy a bundle')}
          {field('bundlePrice', 'Bundle price, pounds a month')}
          {field('payPct', 'Percent of activated using Get paid')}
          {field('jobsPerMonth', 'Jobs a month, each')}
          {field('jobValue', 'Average job, pounds')}
          {field('churnPct', 'Monthly churn, percent', 0.5)}
          {field('hosting', 'Hosting and services, pounds a month')}
          {field('months', 'Months out', 1, 1)}
        </div>
        <div className="min-w-0 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Hero value={money(last.total)} label={`revenue, month ${v.months}`} />
            <Hero value={money(last.total * 12)} label="run rate, a year" />
            <Hero value={last.activated.toLocaleString('en-GB')} label="activated trades" sub={`of ${last.trades.toLocaleString('en-GB')} sending cards`} />
            <Hero value={money(last.margin)} label="a month after hosting" />
          </div>
          <div className="glass r-outer mt-3 p-4">
            <div className="flex items-end gap-1" style={{ height: `${H + 20}px` }}>
              {rows.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center justify-end" title={`Month ${r.month}: ${money(r.total)}`}>
                  <div className="flex w-full flex-col-reverse overflow-hidden rounded-t">
                    {parts.map((p) => (
                      <div key={p.key} className={p.cls} style={{ height: `${Math.round((r[p.key] / max) * H)}px` }} />
                    ))}
                  </div>
                  <div className="mt-1 text-[10px] muted">{r.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] muted">
              <div className="flex flex-wrap gap-3">
                {parts.map((p) => <span key={p.key} className="inline-flex items-center gap-1.5"><span className={`inline-block h-2.5 w-2.5 rounded-sm ${p.cls}`} />{p.label}</span>)}
              </div>
              <span className="tabular-nums">top of chart {money(max)}</span>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {parts.map((p) => (
              <div key={p.key} className="glass r-inner px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide muted">{p.label}</div>
                <div className="text-[18px] font-bold tabular-nums">{money(last[p.key])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
