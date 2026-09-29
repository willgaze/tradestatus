import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { cleanText } from '@/lib/clean-text'
import { ALL_ITEMS } from '@/lib/roadmap'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const rows = await prisma.featureInterest.findMany()
    return NextResponse.json({ interest: Object.fromEntries(rows.map((r) => [r.key, r])) })
  } catch (error) {
    console.error('roadmap read failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function PUT(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const { key, wanted, note } = await request.json()
    // Only keys this build actually knows about, so a stale client cannot
    // fill the table with features that no longer exist.
    if (!ALL_ITEMS.some((i) => i.key === key)) {
      return NextResponse.json({ error: 'unknown_feature' }, { status: 400 })
    }
    const data = { wanted: Boolean(wanted), note: cleanText(note, 300) }
    const row = await prisma.featureInterest.upsert({
      where: { key }, create: { key, ...data }, update: data,
    })
    return NextResponse.json({ interest: row })
  } catch (error) {
    console.error('roadmap write failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
