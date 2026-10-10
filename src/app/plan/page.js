import { redirect } from 'next/navigation'
import { isOperator } from '@/lib/operator-auth'
import { planShareCode } from '@/lib/plan-share'
import { CANONICAL_HOST } from '@/lib/trade'
import Plan from './Plan'

export const dynamic = 'force-dynamic'

// The owner's door. Fails closed: no session, no plan.
export default async function PlanPage() {
  if (!(await isOperator())) redirect('/login')
  const code = planShareCode()
  const shareUrl = code ? `https://${CANONICAL_HOST}/plan/${code}` : null
  return <Plan mode="owner" shareUrl={shareUrl} />
}
