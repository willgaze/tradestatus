import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanText } from '@/lib/clean-text'
import { isValidPresence } from '@/lib/presence'

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
    const door = typeof body.doorToUse === 'string' ? body.doorToUse.toUpperCase() : null

    const updated = await prisma.tradeStatus.update({
      where: { id: row.id },
      data: {
        doorToUse: DOORS.includes(door) ? door : null,
        petsOnSite: Boolean(body.petsOnSite),
        // ///filled.count.soap — keep the words, drop anything else.
        what3words: cleanText(body.what3words, 60),
        accessNotes: cleanText(body.accessNotes, 400),
        notesUpdatedAt: new Date(),
        // Presence is stamped separately: it goes stale in hours, while "use
        // the back gate" is true until the gate moves.
        ...(body.presence !== undefined
          ? {
              presence: isValidPresence(body.presence) ? body.presence : null,
              presenceNote: cleanText(body.presenceNote, 200),
              presenceAt: body.presence ? new Date() : null,
            }
          : {}),
      },
    })

    return NextResponse.json({
      notes: {
        doorToUse: updated.doorToUse,
        petsOnSite: updated.petsOnSite,
        what3words: updated.what3words,
        accessNotes: updated.accessNotes,
        presence: updated.presence,
        presenceNote: updated.presenceNote,
        presenceAt: updated.presenceAt,
      },
    })
  } catch (error) {
    console.error('notes update failed:', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
