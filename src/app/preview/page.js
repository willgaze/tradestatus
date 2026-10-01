import { notFound } from 'next/navigation'
import Preview from './Preview'

/**
 * The customer's page, drawn from a fixture instead of the database.
 *
 * This exists so the diary can be captured, and so a layout change can be
 * measured, without a DATABASE_URL and without pointing a camera at a real
 * customer's name and address. Every value below is invented.
 *
 * It is NOT part of the product: on the live site it is a 404. The gate is
 * VERCEL_ENV rather than NODE_ENV, because `next start` — which is what the
 * diary is captured against — is NODE_ENV=production too, and gating on that
 * would 404 the one server that needs it.
 */
export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

export default function PreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()
  return <Preview />
}
