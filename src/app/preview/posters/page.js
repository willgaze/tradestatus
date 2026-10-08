import { notFound } from 'next/navigation'
import Posters from './Posters'

/**
 * The App Store-style posters, one per ?n=, for the capture script to
 * photograph into public/home/store-N.webp. Gated exactly like /preview: a
 * 404 on the live site, available under `next start` locally.
 */
export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

export default async function PostersPage({ searchParams }) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const { n } = await searchParams
  return <Posters n={n} />
}
