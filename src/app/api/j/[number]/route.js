import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sm8Configured, fetchJob, fetchJobContact, phoneMatches, findOrCreateForJob } from '@/lib/servicem8'

export const dynamic = 'force-dynamic'

// Ten wrong guesses on one job number and it rests for fifteen minutes. The
// space is ten thousand, so this makes enumeration slower than ringing up and
// asking. Counted in the database, not in memory: a map in a module lasts
// exactly one serverless instance, which the first test proved by never
// locking at all.
const LIMIT = 10, REST_MS = 15 * 60_000
const MISS = 'claim.miss'
const since = () => new Date(Date.now() - REST_MS)
async function limited(number) {
  const n = await prisma.sm8Event.count({ where: { event: MISS, outcome: `job:${number}`, receivedAt: { gte: since() } } }).catch(() => 0)
  return n >= LIMIT
}
const miss = (number) => prisma.sm8Event.create({ data: { event: MISS, outcome: `job:${number}` } }).catch(() => {})

export async function POST(request, { params }) {
  const { number: raw } = await params
  const number = String(raw || '').replace(/\D/g, '').slice(0, 12)
  if (!number || !sm8Configured()) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (await limited(number)) return NextResponse.json({ error: 'too_many' }, { status: 429 })

  let body = {}
  try { body = await request.json() } catch { /* empty is a miss below */ }
  const given = String(body?.digits || '').slice(0, 20)

  try {
    const job = await fetchJob({ number })
    if (!job || job.status === 'Quote' || job.status === 'Unsuccessful') return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const contact = await fetchJobContact(job.uuid).catch(() => null)
    await new Promise((r) => setTimeout(r, 400))
    if (!phoneMatches(contact, given)) { await miss(number); return NextResponse.json({ error: 'no_match' }, { status: 403 }) }
    const { tracker } = await findOrCreateForJob(job, contact)
    return NextResponse.json({ to: `/t/${tracker.code}` })
  } catch (error) {
    console.error('j claim failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
