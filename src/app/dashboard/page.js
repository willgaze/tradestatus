import Console from './Console'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  // The assistant is invisible until a key exists, the same gate as push. The
  // key itself never reaches the browser; only the fact that there is one.
  return <Console assistant={Boolean(process.env.ANTHROPIC_API_KEY)} />
}
