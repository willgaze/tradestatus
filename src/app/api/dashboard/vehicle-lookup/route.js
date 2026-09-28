import { NextResponse } from 'next/server'
import { requireOperator } from '@/lib/operator-auth'
import { lookupVehicle } from '@/lib/dvla'

export const dynamic = 'force-dynamic'

// Operator-guarded deliberately. The trade looks up their own van; this is not
// a plate-lookup service for anyone who finds the URL.
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  const { reg } = await request.json().catch(() => ({}))
  return NextResponse.json(await lookupVehicle(reg))
}
