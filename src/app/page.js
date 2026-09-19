import { TRADE_NAME, TRADE_PHONE, TRADE_PHONE_TEL } from '@/lib/trade'

export const metadata = { title: 'My Trade Status', robots: { index: false, follow: false } }

// Someone typing the address with no code. Deliberately no lookup form: the
// code is the only thing standing in front of a customer's name and address,
// and a search box invites guessing at other people's.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
        My Trade Status
      </p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Open the link you were sent</h1>
      <p className="mt-4 text-lg text-slate-600">
        {TRADE_NAME} sends a tracking link by text or email when your job is booked. Open that
        link to see where it is — booked in, on my way, on site, or done.
      </p>
      {TRADE_PHONE && (
        <a
          href={`tel:${TRADE_PHONE_TEL}`}
          className="mx-auto mt-8 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white"
        >
          Lost the link? Call {TRADE_PHONE}
        </a>
      )}
    </main>
  )
}
