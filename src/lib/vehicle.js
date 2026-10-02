/**
 * Turning a registration into "a white Ford Transit Custom".
 *
 * Two sources, tried in order:
 *
 *   1. DVSA MOT history API — make, MODEL and colour. Free, but you register
 *      (name, email, postal address) and wait up to five working days:
 *      https://documentation.history.mot.api.gov.uk/mot-history-api/register
 *      It issues a client id, client secret and API key; the token comes from
 *      Microsoft Entra with client-credentials. The key must be used within
 *      90 days of issue or it is restricted.
 *
 *   2. DVLA Vehicle Enquiry Service — make and colour, no model. Kept as the
 *      fallback. New registrations were CLOSED on 2 Oct 2026 "while we make
 *      some system upgrades"; existing keys still work.
 *
 * With neither configured this returns { error: 'not_configured' } and the
 * dashboard asks the trade to type make, model and colour — ten seconds, once.
 * The lookup is a convenience, never a dependency.
 *
 * Only ever called for the trade's OWN vehicle, from an operator-guarded
 * route. This is not a plate-lookup service and must not become one.
 */
import { lookupVehicle as dvlaLookup, dvlaConfigured } from './dvla'

const MOT_SCOPE = 'https://tapi.dvsa.gov.uk/.default'
// The tenant DVSA issues keys under. The welcome email gives the same URL;
// MOT_TOKEN_URL overrides it if theirs ever differs.
const MOT_TOKEN_URL_DEFAULT =
  'https://login.microsoftonline.com/a455b827-244f-4c97-b5b4-ce5d13b4d00c/oauth2/v2.0/token'
const MOT_BASE = 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration/'

export function motConfigured() {
  return Boolean(process.env.MOT_CLIENT_ID && process.env.MOT_CLIENT_SECRET && process.env.MOT_API_KEY)
}

export function vehicleLookupConfigured() {
  return motConfigured() || dvlaConfigured()
}

/** Which sources are live, for the dashboard to say so honestly. */
export function vehicleLookupSources() {
  return { mot: motConfigured(), dvla: dvlaConfigured() }
}

const normalise = (reg) => String(reg || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

// "WHITE" and "FORD" read as shouting on a customer's page.
const titleCase = (s) =>
  s ? String(s).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : null

// One token per server instance, reused until a minute before it expires.
// Entra tokens last about an hour; a lookup happens once per van, ever, so
// this is politeness to their token endpoint rather than performance.
let token = null
let tokenExpires = 0

async function motToken() {
  if (token && Date.now() < tokenExpires - 60_000) return token
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.MOT_CLIENT_ID,
    client_secret: process.env.MOT_CLIENT_SECRET,
    scope: MOT_SCOPE,
  })
  const r = await fetch(process.env.MOT_TOKEN_URL || MOT_TOKEN_URL_DEFAULT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`mot token ${r.status}`)
  const j = await r.json()
  token = j.access_token
  tokenExpires = Date.now() + (Number(j.expires_in) || 3600) * 1000
  return token
}

async function motLookup(plate) {
  const bearer = await motToken()
  const r = await fetch(MOT_BASE + encodeURIComponent(plate), {
    headers: { Authorization: `Bearer ${bearer}`, 'X-API-Key': process.env.MOT_API_KEY, Accept: 'application/json' },
  })
  if (r.status === 404) return { error: 'not_found', plate }
  if (!r.ok) return { error: 'lookup_failed', plate }
  const v = await r.json()
  const dated = v.manufactureDate || v.registrationDate || v.firstUsedDate || null
  return {
    plate,
    make: titleCase(v.make),
    model: titleCase(v.model),
    colour: titleCase(v.primaryColour),
    fuel: titleCase(v.fuelType),
    year: dated ? Number(String(dated).slice(0, 4)) || null : null,
    source: 'mot',
  }
}

export async function lookupVehicle(reg) {
  const plate = normalise(reg)
  if (!plate || plate.length < 2 || plate.length > 8) return { error: 'bad_reg' }
  if (!vehicleLookupConfigured()) return { error: 'not_configured', plate }

  if (motConfigured()) {
    try {
      const hit = await motLookup(plate)
      // A plate with no MOT record yet (a new van) is a real 404 here; let the
      // DVLA have a go at it before giving up.
      if (!hit.error || !dvlaConfigured()) return hit
    } catch {
      if (!dvlaConfigured()) return { error: 'lookup_failed', plate }
    }
  }
  const d = await dvlaLookup(plate)
  return d.error ? d : { ...d, source: 'dvla' }
}
