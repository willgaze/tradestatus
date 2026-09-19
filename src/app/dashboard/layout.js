import { redirect } from 'next/navigation'
import { isOperator } from '@/lib/operator-auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Jobs | My Trade Status', robots: { index: false, follow: false } }

// Guarded in the layout so it cannot be skipped by a bundling detail. Every
// API route under /api/dashboard guards itself as well.
export default async function DashboardLayout({ children }) {
  if (!(await isOperator())) redirect('/login')
  return children
}
