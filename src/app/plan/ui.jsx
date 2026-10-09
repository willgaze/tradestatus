'use client'

/**
 * The pieces every plan section is built from. Nothing here knows what the
 * plan says; it only knows how a fact, a guess and a decision are shown, and
 * that a button a thumb can hit is 44px.
 */

const LIGHT = { green: 'bg-stage-done', amber: 'bg-stage-onway', red: 'bg-stage-paused', gray: 'bg-stage-booked/40' }

const KIND = {
  fact: { label: 'Fact', cls: 'text-stage-done bg-stage-done/12' },
  estimate: { label: 'Estimate', cls: 'text-stage-onway bg-stage-onway/12' },
  decision: { label: 'Decide', cls: 'text-stage-onsite bg-stage-onsite/12' },
}

export function Tag({ kind }) {
  const k = KIND[kind] || KIND.estimate
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${k.cls}`}>{k.label}</span>
}

export function Light({ state }) {
  return <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${LIGHT[state] || LIGHT.gray}`} aria-label={state} />
}

export function Eyebrow({ children, tint }) {
  return (
    <div className="text-[12px] font-semibold uppercase tracking-wide" style={tint ? { color: 'var(--tint)' } : undefined}>
      {children}
    </div>
  )
}

/** A big number with its label. The number shrinks on long values so it never leaves its tile. */
export function Hero({ value, label, sub, kind }) {
  const long = String(value).length > 6
  return (
    <div className="glass r-inner min-w-0 p-5">
      <div className={`${long ? 'text-[28px]' : 'text-[40px]'} whitespace-nowrap font-bold leading-none tracking-[-0.02em] tabular-nums`}>{value}</div>
      <div className="mt-2 text-[15px] font-semibold">{label}</div>
      {sub && <div className="mt-1 text-[13px] muted">{sub}</div>}
      {kind && <div className="mt-2"><Tag kind={kind} /></div>}
    </div>
  )
}

export function Section({ title, kicker, children }) {
  return (
    <section>
      {kicker && <div className="text-[13px] font-semibold uppercase tracking-wide accent-text">{kicker}</div>}
      <h2 className="mt-1 text-[32px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Sub({ children }) {
  return <h3 className="mt-8 text-[20px] font-bold">{children}</h3>
}

export function Table({ head, rows }) {
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

const CHIP = 'inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-semibold'
const CHIP_OFF = 'bg-black/[.06] dark:bg-white/[.08]'

/** Right / Wrong on a guess. A fact never gets one of these. Read-only shows nothing. */
export function Check({ id, answers, set, readOnly }) {
  if (readOnly) return null
  const v = answers[`check:${id}`]
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => set(`check:${id}`, 'right')}
              className={`${CHIP} ${v === 'right' ? 'bg-stage-done text-white' : CHIP_OFF}`}>Right</button>
      <button type="button" onClick={() => set(`check:${id}`, 'wrong')}
              className={`${CHIP} ${v === 'wrong' ? 'bg-stage-paused text-white' : CHIP_OFF}`}>Wrong</button>
    </div>
  )
}

/** One decision as tap chips. Read-only shows the chosen one and nothing to press. */
export function Chips({ options, value, onPick, readOnly }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o
        if (readOnly && !on) return null
        return (
          <button key={o} type="button" disabled={readOnly} onClick={() => onPick(o)}
                  className={`${CHIP} ${on ? 'accent-fill' : CHIP_OFF} disabled:opacity-100`}>{o}</button>
        )
      })}
      {readOnly && !value && <span className="text-[14px] muted">Open</span>}
    </div>
  )
}

export function Steps({ items, tone }) {
  return (
    <ol className={`grid gap-2 tone-${tone}`}>
      {items.map((b, i) => (
        <li key={b} className="flex items-center gap-3 text-[15px] font-semibold">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: 'var(--tint)' }}>{i + 1}</span>{b}
        </li>
      ))}
    </ol>
  )
}
