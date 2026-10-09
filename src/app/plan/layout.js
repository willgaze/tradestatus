export const dynamic = 'force-dynamic'
export const metadata = { title: 'Plan | TurnUp', robots: { index: false, follow: false } }

// Two doors into the plan, each checked on its own page:
//   /plan          the owner, by the same sign-in as Jobs (page.js)
//   /plan/<code>   a guest, by a share code that is the credential ([code]/page.js)
// Both are noindexed here and disallowed in robots.js. The check lives in
// each page rather than this layout because the two doors have different keys.
export default function PlanLayout({ children }) {
  return children
}
