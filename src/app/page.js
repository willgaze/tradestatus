export const metadata = { title: 'My Trade Status', robots: { index: false, follow: false } }

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
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
        My Trade Status
      </p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Open the link you were sent</h1>
      <p className="mt-4 text-lg text-slate-600">
        When your job is booked, your tradesperson sends you a tracking link by text or email.
        Open that link to see where the job is — booked in, on their way, on site, or done.
      </p>
      <p className="mt-6 text-slate-600">
        Lost it? Ask whoever booked the job to send it again.
      </p>
      <p className="mt-10 text-sm text-slate-400">
        Live job tracking for trades.
      </p>

      {/* The way in for the trade. Small, because a customer landing here by
          mistyping a link has no use for it — but present, because without it
          this page is a dead end for the person who owns the thing. */}
      <a href="/dashboard"
         className="mx-auto mt-6 inline-flex min-h-[44px] items-center text-sm font-medium text-brand-600 underline">
        Tradesperson? Sign in
      </a>
    </main>
  )
}
