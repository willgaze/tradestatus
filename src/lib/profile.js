import { prisma } from '@/lib/prisma'
import { termsFrom, DEFAULT_TERMS } from '@/lib/terms'
import { TRADE_NAME } from '@/lib/trade'

/** The name the customer's page uses for the person coming. */
export const firstName = (engineerName) => String(engineerName || TRADE_NAME).trim().split(/\s+/)[0] || 'us'

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
      brandLogo: p.brandLogo || null,
    }
  } catch {
    // Never let a missing profile break the page the customer came for.
    return null
  }
}

/**
 * The trade's mark, for the top of the customer's page. Unlike the profile
 * this is not gated on the stage: a logo is a name, and the name is already
 * on the page from the moment the link opens.
 */
export async function publicBrand() {
  try {
    const p = await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } })
    return p?.brandLogo ? { logo: p.brandLogo } : null
  } catch {
    return null
  }
}

/**
 * The booking terms as currently set: the notice period and the short-notice
 * charge, if any. Numbers only; the words live in src/lib/terms.js. Falls
 * back to the defaults rather than failing, because the customer's page must
 * render whether or not the profile row exists yet.
 */
export async function publicTerms() {
  try {
    const p = await prisma.tradeProfile.findUnique({ where: { id: 'singleton' } })
    // The first name the words use: "Tell Will", not "Tell Rosebourne". The
    // engineer's name is already public once they set off; here it is the
    // trade's own choice of how the terms read, nothing about the customer.
    return { ...termsFrom(p), first: firstName(p?.engineerName) }
  } catch {
    return { ...DEFAULT_TERMS, first: firstName(null) }
  }
}
