import Mark from '@/components/Mark'
import { PRODUCT_NAME, PRODUCT_NAME_TM, PRODUCT_TAGLINE } from '@/lib/product'

export const metadata = { title: PRODUCT_NAME, robots: { index: false, follow: false } }

// The product's own front door. Deliberately carries no trade's name, phone or
// branding: a customer who lands here has mistyped a link, and whose link it
// was is exactly what this page cannot know. Anything tenant-specific belongs
// on /t/[code], which knows which job it is showing.
//
// Also deliberately no lookup form. The code is the only thing standing in
// front of a customer's name and address, and a search box invites guessing at
// other people's.
export default function Home() {
  return (
    <div className="relative min-h-screen" style={{ '--tint': 'var(--mts-accent)' }}>
      <div className="stage-wash" aria-hidden="true" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
      <Mark className="mx-auto h-16 w-auto" id="home" />
      <h1 className="mt-5 text-[28px] font-bold tracking-[-0.02em]">Open the link you were sent</h1>
      <p className="mt-3 text-[17px] leading-snug muted">
        When your job is booked, your tradesperson sends you a tracking link by text or email.
        Open that link to see where the job is — booked in, on their way, on site, or done.
      </p>
      <p className="mt-5 text-[15px]" style={{ color: 'var(--label-3)' }}>
        Lost it? Ask whoever booked the job to send it again.
      </p>
      <p className="mt-10 text-[13px]" style={{ color: 'var(--label-3)' }}>
        {PRODUCT_NAME_TM} · {PRODUCT_TAGLINE}
      </p>

      {/* The way in for the trade. Small, because a customer landing here by
          mistyping a link has no use for it — but present, because without it
          this page is a dead end for the person who owns the thing. */}
      <a href="/dashboard"
         className="mx-auto mt-6 inline-flex min-h-[44px] items-center text-[15px] font-medium"
         style={{ color: 'var(--tint)' }}>
        Tradesperson? Sign in
      </a>
      </main>
    </div>
  )
}
