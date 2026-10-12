import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanText } from '@/lib/clean-text'
import { reviewTapped, feedbackLeft } from '@/lib/review'

export const dynamic = 'force-dynamic'

/**
 * After Job done: { action: 'google' } records that they went to leave a
 * review; { action: 'feedback', text } is a note to the trade. Public, like
 * the page. Only on a finished job: there is nothing to review before that.
 */
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive || row.stage !== 'DONE') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const body = await request.json().catch(() => ({}))
    if (body.action === 'google') {
      const u = await reviewTapped(row)
      return NextResponse.json({ ok: true, reviewClickedAt: u.reviewClickedAt.toISOString() })
    }
    if (body.action === 'feedback') {
      const text = cleanText(body.text, 600)
      if (!text) return NextResponse.json({ error: 'nothing_said' }, { status: 400 })
      const u = await feedbackLeft(row, text)
      return NextResponse.json({ ok: true, feedbackAt: u.feedbackAt.toISOString() })
    }
    return NextResponse.json({ error: 'bad_action' }, { status: 400 })
  } catch (error) {
    console.error('review failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
