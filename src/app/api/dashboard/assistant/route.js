import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { cleanText } from '@/lib/clean-text'
import { dbReason } from '@/lib/db-errors'
import { assistantConfigured, propose } from '@/lib/assistant'
import { pushConfigured, tradeDeviceCount } from '@/lib/push'
import { sm8Configured } from '@/lib/servicem8'

export const dynamic = 'force-dynamic'

// What is switched on. The box uses it to answer "how do I..." honestly, and
// the dashboard uses it to drip one tip at a time rather than show every
// panel at once. Every read sits in its own catch: a table that is not there
// yet is a count of zero, not a broken dashboard.
async function setupFacts() {
  const quiet = async (fn, fallback) => { try { return await fn() } catch { return fallback } }
  const profile = await quiet(() => prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }), null)
  const vehicle = [profile?.vehicleColour, profile?.vehicleMake, profile?.vehicleModel].filter(Boolean).join(' ')
  return {
    engineerName: profile?.engineerName || null,
    vehicle: vehicle || null,
    pushConfigured: pushConfigured(),
    devices: await quiet(() => tradeDeviceCount(), 0),
    passkeys: await quiet(() => prisma.passkey.count(), 0),
    sm8Configured: sm8Configured(),
  }
}

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  return NextResponse.json({ configured: assistantConfigured(), setup: await setupFacts() })
}

// Reads the words, returns an answer or a proposal. Writes nothing: the
// browser sends a confirmed proposal to /api/dashboard/trackers like any form.
export async function POST(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })

  if (!assistantConfigured()) return NextResponse.json({ error: 'assistant_not_configured' }, { status: 503 })

  let body = null
  try { body = await request.json() } catch { body = null }
  const text = cleanText(body?.text, 4000)
  if (!text) return NextResponse.json({ error: 'nothing_said' }, { status: 400 })
  const history = Array.isArray(body?.history) ? body.history.slice(-10) : []

  let jobs = []
  try {
    // Open work plus the recent finished jobs, so "when did I finish at
    // Beck's?" has an answer. The last few stage changes ride along for the
    // same reason. Phone numbers are not selected: the model never needs one.
    jobs = await prisma.tradeStatus.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 40,
      select: {
        id: true, jobRef: true, externalId: true, customerName: true, jobAddress: true, jobSummary: true,
        stage: true, stageNote: true, scheduledFor: true, arrivingAt: true,
        windowStart: true, windowEnd: true, windowState: true, windowBy: true, windowNote: true,
        position: true, askedAt: true, askAnsweredAt: true, lateMinutes: true, lateAt: true,
        missedAt: true, missedChoice: true, doorToUse: true, petsOnSite: true, accessNotes: true,
        presence: true, presenceNote: true, presenceAt: true, viewCount: true, lastViewedAt: true,
        isActive: true,
        events: { orderBy: { createdAt: 'desc' }, take: 5, select: { stage: true, createdAt: true } },
      },
    })
  } catch (error) {
    console.error('assistant: job list failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }

  try {
    const proposal = await propose(text, jobs, { setup: await setupFacts(), history })
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
