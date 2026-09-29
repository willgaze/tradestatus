import { VERSION, BUILD_DATE, theme } from '@/lib/version'

/**
 * The version, small, on every page. Visible enough to answer "did last
 * night's build land" at a glance; quiet enough that a customer never
 * wonders what it means.
 */
export default function BuildStamp({ className = '' }) {
  const t = theme()
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] muted ${className}`}>
      <span className="h-2 w-2 rounded-full" style={{ background: t.accent }} aria-hidden />
      v{VERSION}
      <span className="opacity-50">·</span>
      <span className="opacity-70">{t.name}</span>
      <span className="opacity-50">·</span>
      <span className="opacity-70">{BUILD_DATE}</span>
    </span>
  )
}
