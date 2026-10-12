import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { termsFrom, termsSnapshot } from '@/lib/terms'
import { firstName } from '@/lib/profile'
import { diaryFor } from '@/lib/sm8-oauth'

export const dynamic = 'force-dynamic'

// "Got it, go ahead." Public, like the page; the code is the credential.
//
// Records the time and the exact words on the screen when the customer
// tapped, built from the profile as it stands at that moment. Once agreed it
// stays agreed: a second tap, from a forwarded link or a refresh, hands back
// the first record rather than overwriting it. Nothing is ever un-agreed
// from here; that would need a reason, and a human.
export async function POST(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive || row.stage === 'DONE') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (row.termsAgreedAt) {
      return NextResponse.json({ ok: true, already: true, termsAgreedAt: row.termsAgreedAt.toISOString(), termsAgreed: pick(row.termsAgreed) })
    }
    const profile = await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } }).catch(() => null)
    const snapshot = termsSnapshot(termsFrom(profile), firstName(profile?.engineerName))
    const now = new Date()
    const updated = await prisma.tradeStatus.update({ where: { id: row.id }, data: {
      termsAgreedAt: now, termsAgreed: snapshot,
      events: { create: { stage: row.stage, note: 'Booking terms read and agreed from the customer’s phone.' } },
    } })
    diaryFor(updated, `Booking terms read and agreed from the customer's phone${snapshot.fee ? ` (${snapshot.noticeHours}h notice, GBP ${snapshot.fee} at short notice)` : ''}`).catch(() => {})
    return NextResponse.json({ ok: true, termsAgreedAt: updated.termsAgreedAt.toISOString(), termsAgreed: pick(snapshot) })
  } catch (error) {
    console.error('terms failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}

const pick = (t) => (t && typeof t === 'object' ? { noticeHours: t.noticeHours ?? 24, fee: t.fee ?? null, first: t.first || null } : null)
