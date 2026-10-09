import { redirect } from 'next/navigation'
import { isOperator } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plan | TurnUp', robots: { index: false, follow: false } }

// The business plan. Guarded the same way as the dashboard, in the layout, so
// it cannot be skipped by a bundling detail. Also disallowed in robots.js.
export default async function PlanLayout({ children }) {
  if (!(await isOperator())) redirect('/login')
  return children
}
