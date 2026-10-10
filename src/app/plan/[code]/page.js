import { notFound } from 'next/navigation'
import { planShareCodeMatches } from '@/lib/plan-share'
import Plan from '../Plan'

export const dynamic = 'force-dynamic'

// The guest's door. The code in the URL is the credential, as it is for a
// customer's tracking link. A wrong code is a 404, not a sign-in page: there
// is nothing to sign in to.
export default async function SharedPlanPage({ params }) {
  const { code } = await params
  if (!planShareCodeMatches(code)) notFound()
  return <Plan mode="guest" />
}
