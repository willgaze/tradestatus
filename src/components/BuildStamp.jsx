import { VERSION, BUILD_DATE, theme } from '@/lib/version'

/**
 * The version, small, on every page. Visible enough to answer "did last
 * night's build land" at a glance; quiet enough that a customer never
 * wonders what it means.
 */
export default function BuildStamp({ className = '', compact = false }) {
  const t = theme()
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] muted ${className}`}>
      <span className="h-2 w-2 rounded-full" style={{ background: t.accent }} aria-hidden />
      v{VERSION}
      {/* The theme name and the build date answer "did last night's build
          land", which is a question the owner asks and the customer does not.
          On the customer's page they are three-quarters of the width of the
          line and push the wordmark onto a second one, so there they go. */}
      {!compact && (
        <>
          <span className="opacity-50">·</span>
          <span className="opacity-70">{t.name}</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">{BUILD_DATE}</span>
        </>
      )}
    </span>
  )
}
