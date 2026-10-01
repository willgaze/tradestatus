import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { cleanText } from '@/lib/clean-text'
import { dbReason } from '@/lib/db-errors'
import { assistantConfigured, propose } from '@/lib/assistant'

export const dynamic = 'force-dynamic'

// Reads the words, returns a proposal. Writes nothing: the browser sends the
// confirmed proposal to /api/dashboard/trackers like any other form.
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  if (!assistantConfigured()) return NextResponse.json({ error: 'assistant_not_configured' }, { status: 503 })

  let text = null
  try { text = cleanText((await request.json())?.text, 4000) } catch { text = null }
  if (!text) return NextResponse.json({ error: 'nothing_said' }, { status: 400 })

  let jobs = []
  try {
    jobs = await prisma.tradeStatus.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 40,
      select: { id: true, customerName: true, jobRef: true, jobSummary: true, jobAddress: true, stage: true, scheduledFor: true },
    })
  } catch (error) {
    console.error('assistant: job list failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }

  try {
    const proposal = await propose(text, jobs)
    return NextResponse.json({ proposal })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'assistant_bad_key' }, { status: 503 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'assistant_busy' }, { status: 503 })
    }
    console.error('assistant failed:', error?.message)
    return NextResponse.json({ error: 'assistant_failed' }, { status: 503 })
  }
}
