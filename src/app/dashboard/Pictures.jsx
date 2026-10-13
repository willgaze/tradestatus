'use client'
import Mark from '@/components/Mark'

/**
 * Small drawings for the setup panels, so each one shows the thing it is
 * about instead of describing it. Same rule as the homepage: a picture of
 * the part, not a paragraph. Nothing here is a screenshot of anyone's data.
 */

/* A push notification as it lands on the TRADE's lock screen. The words are
   the ones src/lib/nudge.js actually sends; change them there, not here. */
export function TradeBanner({ title, body, when = 'now' }) {
  return (
    <div className="r-inner px-3.5 py-3 text-[#15161a] shadow-[0_10px_24px_-14px_rgba(0,0,0,.5)] ring-1 ring-black/[.06]"
         style={{ background: 'rgba(255,255,255,.92)' }}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white shadow-sm"><Mark className="h-5 w-auto" id="nudge" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-semibold">{title}</span>
            <span className="shrink-0 text-[12px] text-[#5f6672]">{when}</span>
          </span>
          <span className="block text-[14px] leading-snug">{body}</span>
        </span>
      </div>
    </div>
  )
}

/* The lock screen the banner sits on, cropped to the band that matters. */
export function LockBand({ children }) {
  return (
    <div className="overflow-hidden r-inner px-3 pb-3 pt-2.5 text-white"
         style={{ background: 'linear-gradient(180deg, #2b2a7a 0%, #5856d6 70%, #8e8cf0 100%)' }}>
      <p className="mb-2 text-center text-[34px] font-semibold leading-none tracking-[-0.03em] opacity-90">09:41</p>
      {children}
    </div>
  )
}

/* Three rows of the attendance record, drawn. Every name is invented. */
const ROWS = [
  ['29 Sep', 'Whitfield', '07:42', '08:10', '12:35', 'Done'],
  ['29 Sep', 'Beck',      '13:05', '13:30', '',      'Paused'],
  ['30 Sep', 'Hale',      '08:01', '08:24', '',      'No one home'],
]
export function AttendanceSheet() {
  return (
    <div className="overflow-x-auto r-inner ring-1 ring-black/[.06] dark:ring-white/10" style={{ background: 'rgb(var(--glass-line) / 0.05)' }}>
      <table className="w-full border-collapse whitespace-nowrap text-[12px] tabular-nums">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide muted">
            {['Date', 'Customer', 'Set off', 'Arrived', 'Finished', 'Outcome'].map((h) => (
              <th key={h} className="px-2.5 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r[1]} className="border-t hairline">
              {r.map((c, i) => <td key={i} className={`px-2.5 py-2 ${i === 1 ? 'font-semibold' : ''} ${!c ? 'muted' : ''}`}>{c || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
