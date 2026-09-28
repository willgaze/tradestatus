/**
 * Turning a registration into "a white Ford Transit Custom".
 *
 * The DVLA's Vehicle Enquiry Service gives make, colour and year from a plate.
 * It is free, but it needs a key you apply for:
 *   https://developer-portal.driver-vehicle-licensing.api.gov.uk
 *
 * Without DVLA_API_KEY this returns null and the dashboard asks the trade to
 * type make and colour instead — which takes ten seconds, once, ever. The
 * lookup is a convenience, never a dependency.
 *
 * It is only ever called for the trade's OWN vehicle, from an operator-guarded
 * route. This is not a plate-lookup service and must not become one.
 */
export function dvlaConfigured() {
  return Boolean(process.env.DVLA_API_KEY)
}

const normalise = (reg) => String(reg || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

// "WHITE" from the DVLA reads as shouting on a customer's page.
const titleCase = (s) =>
  s ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : null

export async function lookupVehicle(reg) {
  const plate = normalise(reg)
  if (!plate || plate.length < 2 || plate.length > 8) return { error: 'bad_reg' }
  if (!dvlaConfigured()) return { error: 'not_configured', plate }

  try {
    const r = await fetch(
      'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.DVLA_API_KEY },
        body: JSON.stringify({ registrationNumber: plate }),
      },
    )
    if (r.status === 404) return { error: 'not_found', plate }
    if (!r.ok) return { error: 'lookup_failed', plate }

    const v = await r.json()
    return {
      plate,
      // The DVLA gives make and colour but not model — it is not in the
      // record. The trade types that themselves; it is the bit they know.
      make: titleCase(v.make),
      colour: titleCase(v.colour),
      year: v.yearOfManufacture || null,
    }
  } catch {
    return { error: 'lookup_failed', plate }
  }
}
