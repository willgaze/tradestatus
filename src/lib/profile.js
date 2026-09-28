import { prisma } from '@/lib/prisma'

/**
 * What a customer is allowed to see about the person coming to their house.
 *
 * A whitelist, like publicShape: adding a column to TradeProfile does not
 * expose it. The trade's own phone, brand licence state and anything else
 * stays inside.
 */
/**
 * Plates are stored without spaces so a lookup is not defeated by how someone
 * typed it, but they are READ off the back of a van, where the space is part
 * of the shape. Put it back for display.
 *
 * Covers the current style (AB12 CDE), the prefix style (A123 BCD) and the
 * suffix style (ABC 123A). Anything else is returned untouched rather than
 * mangled — a personal plate is not worth guessing at.
 */
export function formatPlate(reg) {
  if (!reg) return null
  const r = String(reg).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(r)) return `${r.slice(0, 4)} ${r.slice(4)}`
  if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(r)) return `${r.slice(0, -3)} ${r.slice(-3)}`
  if (/^[A-Z]{3}\d{1,3}[A-Z]$/.test(r)) return `${r.slice(0, 3)} ${r.slice(3)}`
  return r
}

export async function publicProfile() {
  try {
    const p = await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } })
    if (!p) return null

    const vehicle = [p.vehicleColour, p.vehicleMake, p.vehicleModel].filter(Boolean).join(' ')
    return {
      engineerName: p.engineerName || null,
      engineerPhoto: p.engineerPhoto || null,
      aboutLine: p.aboutLine || null,
      // The plate is shown so a customer can check the van outside is the one
      // they are expecting. That is the whole point of putting it here.
      vehicleReg: formatPlate(p.vehicleReg),
      vehicle: vehicle || null,
      vehiclePhoto: p.vehiclePhoto || null,
    }
  } catch {
    // Never let a missing profile break the page the customer came for.
    return null
  }
}
