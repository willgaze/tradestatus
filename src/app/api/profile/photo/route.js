import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * The face at the door. Public on purpose: it is the trade's own photo, shown
 * to every customer the moment the trade sets off, and the same picture goes
 * in the On-my-way notification. Nothing else about the trade rides on it.
 */
export async function GET() {
  try {
    const p = await prisma.tradeProfile.findUnique({ where: { id: 'singleton' }, select: { engineerPhotoData: true, engineerPhotoAt: true } })
    if (!p?.engineerPhotoData) return new Response('', { status: 404 })
    return new Response(Buffer.from(p.engineerPhotoData), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400, immutable', 'Last-Modified': p.engineerPhotoAt?.toUTCString() || new Date().toUTCString() },
    })
  } catch { return new Response('', { status: 503 }) }
}
