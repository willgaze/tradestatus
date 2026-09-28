/**
 * The My Trade Status mark — the one from 2015, redrawn.
 *
 * Five nodes on a journey: solid lines behind, dotted ahead. It was always the
 * right mark for this product, because that is exactly what the status page
 * does. Geometry is computed rather than eyeballed, so the gaps between each
 * line and the ring it touches are identical at every size.
 *
 * `id` must be unique per instance — two of these on one page with the same
 * gradient id and the second one renders unpainted.
 */
export default function Mark({ className = '', id = 'mts', title = 'My Trade Status' }) {
  const g = `${id}-grad`
  return (
    <svg viewBox="0 0 170 112" fill="none" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={g} x1="14" y1="86" x2="156" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2FA36B" />
          <stop offset=".5" stopColor="#2A8E96" />
          <stop offset="1" stopColor="#2F7FC4" />
        </linearGradient>
      </defs>
      <line x1="38.42" y1="61.58" x2="49.55" y2="50.45" stroke={`url(#${g})`} strokeWidth="4.4" strokeLinecap="round" />
      <line x1="68.61" y1="49.19" x2="80.83" y2="62.22" stroke={`url(#${g})`} strokeWidth="4.4" strokeLinecap="round" />
      <line x1="101.12" y1="60.19" x2="111.86" y2="48.86" stroke={`url(#${g})`} strokeWidth="4.4" strokeDasharray="0.1 8" strokeLinecap="round" />
      <line x1="133.61" y1="54.57" x2="139.43" y2="70.27" stroke={`url(#${g})`} strokeWidth="4.4" strokeDasharray="0.1 8" strokeLinecap="round" />
      <circle cx="24" cy="76" r="14" stroke={`url(#${g})`} strokeWidth="4.4" />
      <circle cx="60" cy="40" r="8" stroke={`url(#${g})`} strokeWidth="4.4" />
      <circle cx="90" cy="72" r="10" stroke={`url(#${g})`} strokeWidth="4.4" />
      <circle cx="126" cy="34" r="16" stroke={`url(#${g})`} strokeWidth="4.4" />
      <circle cx="146" cy="88" r="11" stroke={`url(#${g})`} strokeWidth="4.4" />
    </svg>
  )
}

/** Mark plus wordmark, for a page header. */
export function Wordmark({ className = '', id = 'mts-w' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark id={id} className="h-[22px] w-auto" />
      <span className="text-[13px] font-semibold uppercase tracking-[0.13em] muted">
        My Trade Status
      </span>
    </span>
  )
}
