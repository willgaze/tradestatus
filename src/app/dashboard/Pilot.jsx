'use client'

import { useEffect, useState } from 'react'

/**
 * The pilot, in four numbers, for the thirty days decided on 11 Oct 2026.
 * Three are counted from the rows; the fourth, calls to the booking line, is
 * a person's count and the panel says so rather than guessing one.
 */
function Tile({ n, pct, label, note }) {
  return (
    <div className="r-inner px-4 py-3" style={{ background: 'rgb(var(--glass-line) / 0.08)' }}>
      <div className="text-[26px] font-bold leading-none tabular-nums">
        {n === null || n === undefined ? '—' : n}
        {pct !== null && pct !== undefined && <span className="ml-1.5 text-[14px] font-semibold muted">{pct}%</span>}
      </div>
      <div className="mt-1 text-[14px] font-semibold">{label}</div>
      {note && <div className="text-[12px] muted">{note}</div>}
    </div>
  )
}

export default function Pilot() {
  const [r, setR] = useState(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState(false)

  useEffect(() => {
    let live = true
    setError(false)
    fetch(`/api/dashboard/pilot?days=${days}`, { cache: 'no-store' })
      .then((x) => (x.ok ? x.json() : Promise.reject()))
      .then((j) => live && setR(j))
      .catch(() => live && setError(true))
    return () => { live = false }
  }, [days])

  return (
    <section className="glass r-outer mt-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[20px] font-bold tracking-[-0.02em]">The pilot</h2>
        <div className="flex gap-1">
          {[30, 90].map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} aria-pressed={days === d}
                    className={`btn text-[13px] ${days === d ? 'btn-filled' : 'btn-grey'}`}>{d} days</button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-[14px] muted">Four numbers decide whether this works. Three are counted here. The fourth is yours.</p>
      {error && <p className="mt-3 text-[14px]" style={{ color: 'var(--stage-paused)' }}>Could not load the numbers. Try again in a moment.</p>}
      {r && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Tile n={r.linksOpened.n} pct={r.linksOpened.pct} label="Links opened" note={`of ${r.jobs} job${r.jobs === 1 ? '' : 's'}`} />
            <Tile n={r.inAnswered.n} pct={r.inAnswered.pct} label="“Will someone be in?” answered" note={`asked the day before on ${r.askedDayBefore.n}`} />
            <Tile n={r.wastedTrips.n} label="Wasted trips" note="No one home records" />
            <Tile n={null} label="“When are you coming?” calls" note={`Count by hand. ${r.stillComingAsks.n} asked it from the card.`} />
          </div>
          <p className="mt-3 text-[12px] muted">If the first two stay low, the product is wrong, not the pitch. Nothing moves on housing or pricing until these are in.</p>
        </>
      )}
    </section>
  )
}
