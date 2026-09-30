import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanText } from '@/lib/clean-text'
import { isValidPresence } from '@/lib/presence'
import { normaliseW3w, normaliseMapPin } from '@/lib/places'

export const dynamic = 'force-dynamic'

const DOORS = ['FRONT', 'BACK', 'SIDE']

/**
 * The customer writing back. Public, because the customer has no account and
 * the code is the credential — the same trade-off the read side already makes.
 *
 * Deliberately narrow: four fields, all of them about how to reach the door.
 * It cannot change the stage, the address, the job or anything the trade owns,
 * so the worst a leaked link can do here is scribble on a note the trade reads
 * before knocking, and any of it can be cleared from the dashboard.
 *
 * Nothing here should ever hold a key safe code. The page says so, because
 * people will otherwise type one in, and this is a URL sent by text message.
 */
export async function PUT(request, { params }) {
  const { code } = await params
  if (!code || code.length > 32) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  try {
    const row = await prisma.tradeStatus.findUnique({ where: { code: code.toUpperCase() } })
    if (!row || !row.isActive) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))

    // Only what was actually sent is written.
    //
    // This used to overwrite every access field on every call, which meant the
    // presence buttons had to re-send the door, the dog and the notes just to
    // avoid wiping them — reading those values back off the page. The page no
    // longer has them (they are not public any more), so the fix belongs here
    // rather than there: a field absent from the body is a field the caller is
    // not changing.
    const data = { notesUpdatedAt: new Date() }

    if (body.doorToUse !== undefined) {
      const door = typeof body.doorToUse === 'string' ? body.doorToUse.toUpperCase() : null
      data.doorToUse = DOORS.includes(door) ? door : null
    }
    if (body.petsOnSite !== undefined) data.petsOnSite = Boolean(body.petsOnSite)
    // ///filled.count.soap — keep the words, drop anything else. Three real
    // words or nothing: a typo stored here sends a van to the wrong field.
    // Same for the pin, which is held to Google's hosts.
    if (body.what3words !== undefined) data.what3words = normaliseW3w(body.what3words)
    if (body.mapPin !== undefined) data.mapPin = normaliseMapPin(body.mapPin)
    if (body.accessNotes !== undefined) data.accessNotes = cleanText(body.accessNotes, 400)

    // Presence is stamped separately: it goes stale in hours, while "use the
    // back gate" is true until the gate moves.
    if (body.presence !== undefined) {
      data.presence = isValidPresence(body.presence) ? body.presence : null
      data.presenceNote = cleanText(body.presenceNote, 200)
      data.presenceAt = body.presence ? new Date() : null
    }

    const updated = await prisma.tradeStatus.update({ where: { id: row.id }, data })

    // A confirmation, not a copy.
    //
    // This route is public — the code is the only credential — so anything it
    // returns is readable by anyone holding a forwarded link, including
    // someone who did not send it. It used to echo the whole set back, which
    // handed a link-holder the door, the dog, the notes and whether anyone was
    // in. The caller already knows what it just sent; its own device remembers
    // it (src/app/t/own-answers.js). Nobody else needs it back.
    return NextResponse.json({
      ok: true,
      presenceAt: updated.presenceAt,
    })
  } catch (error) {
    console.error('notes update failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
