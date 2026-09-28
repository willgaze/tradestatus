import { PKPass } from 'passkit-generator'
import { STAGES, STAGE_ORDER, stageOf } from '@/lib/trade-status'
import { TRADE_NAME, TRADE_PHONE } from '@/lib/trade'

/**
 * Apple Wallet passes.
 *
 * Everything here works today except the signature, which needs three things
 * only an Apple Developer Program member can produce. They are read from the
 * environment so the certificate never enters the repository:
 *
 *   PASSKIT_CERT_P12        the Pass Type ID certificate, base64 of the .p12
 *   PASSKIT_CERT_PASSWORD   the password set when exporting that .p12
 *   PASSKIT_WWDR_PEM        Apple's WWDR intermediate certificate, PEM
 *   PASSKIT_PASS_TYPE_ID    e.g. pass.co.uk.rosebourneplumbing.job
 *   PASSKIT_TEAM_ID         the 10-character Apple team identifier
 *
 * Until they exist, passkitConfigured() is false and the routes say so plainly
 * rather than returning a file iOS will silently refuse to open.
 */

export function passkitConfigured() {
  return Boolean(
    process.env.PASSKIT_CERT_P12 &&
      process.env.PASSKIT_CERT_PASSWORD &&
      process.env.PASSKIT_WWDR_PEM &&
      process.env.PASSKIT_PASS_TYPE_ID &&
      process.env.PASSKIT_TEAM_ID,
  )
}

// What is missing, named, so setting this up is not guesswork.
export function passkitMissing() {
  return [
    ['PASSKIT_CERT_P12', 'the Pass Type ID certificate (.p12), base64 encoded'],
    ['PASSKIT_CERT_PASSWORD', 'the password used when exporting that .p12'],
    ['PASSKIT_WWDR_PEM', "Apple's WWDR intermediate certificate, in PEM form"],
    ['PASSKIT_PASS_TYPE_ID', 'e.g. pass.co.uk.rosebourneplumbing.job'],
    ['PASSKIT_TEAM_ID', 'the 10-character Apple team identifier'],
  ].filter(([key]) => !process.env[key]).map(([key, what]) => ({ key, what }))
}

// Wallet wants #rrggbb or rgb(). Keep them here so the pass and the web page
// cannot drift apart.
const NAVY = 'rgb(31, 59, 87)'
const AMBER = 'rgb(240, 162, 2)'
const WHITE = 'rgb(255, 255, 255)'

/**
 * The pass body. Separated from signing so it can be rendered, diffed and
 * tested without a certificate — which is most of what there is to get wrong.
 */
export function buildPassJson(status, { origin, authToken }) {
  const stage = stageOf(status.stage)
  const step = STAGE_ORDER.indexOf(stage.key)
  const position = step >= 0 ? `${step + 1} of ${STAGE_ORDER.length}` : '—'

  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.PASSKIT_PASS_TYPE_ID,
    teamIdentifier: process.env.PASSKIT_TEAM_ID,
    organizationName: TRADE_NAME,
    // Shown in Notification Centre when the pass changes, so it reads as a
    // sentence a customer would want on their lock screen.
    description: `${TRADE_NAME} — job status`,
    serialNumber: status.code,

    foregroundColor: WHITE,
    backgroundColor: NAVY,
    labelColor: 'rgb(157, 182, 205)',

    // How the pass keeps itself up to date. Wallet calls this service, and a
    // push tells it when to bother.
    webServiceURL: `${origin}/api/passes/v1`,
    authenticationToken: authToken,

    // Tapping the barcode area opens the full page. The pass is the glance;
    // the page is the detail.
    associatedStoreIdentifiers: undefined,
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: `${origin}/t/${status.code}`,
        messageEncoding: 'iso-8859-1',
        altText: status.code,
      },
    ],

    generic: {
      headerFields: [
        ...(status.jobRef ? [{ key: 'job', label: 'JOB', value: `#${status.jobRef}` }] : []),
      ],
      primaryFields: [
        { key: 'stage', label: 'STATUS', value: stage.label },
      ],
      secondaryFields: [
        ...(status.customerName
          ? [{ key: 'customer', label: 'CUSTOMER', value: status.customerName }]
          : []),
        { key: 'step', label: 'STEP', value: position },
      ],
      auxiliaryFields: [
        ...(status.jobAddress
          ? [{ key: 'where', label: 'WHERE', value: status.jobAddress }]
          : []),
      ],
      backFields: [
        { key: 'what', label: 'Job', value: status.jobSummary || 'Plumbing work' },
        ...(status.stageNote ? [{ key: 'note', label: 'Latest', value: status.stageNote }] : []),
        ...(status.arrivingAt
          ? [{
              key: 'setoff', label: 'Set off',
              value: status.arrivingAt,
              dateStyle: 'PKDateStyleNone', timeStyle: 'PKDateStyleShort',
            }]
          : []),
        ...(TRADE_PHONE ? [{ key: 'phone', label: 'Call', value: TRADE_PHONE }] : []),
        { key: 'page', label: 'Full status', value: `${origin}/t/${status.code}` },
        // No promised arrival time anywhere on this pass, front or back. The
        // product does not make that promise on the page and must not make it
        // here either, where it would sit on a lock screen looking official.
        {
          key: 'about', label: 'About',
          value: `${TRADE_NAME} updates this card as the job moves. It shows what has happened, not what time anyone will arrive.`,
        },
      ],
    },
  }
}

/**
 * A signed .pkpass, as a Buffer. Throws if the certificate is not configured —
 * callers check passkitConfigured() first and say something useful.
 */
export async function buildSignedPass(status, { origin, authToken, images }) {
  if (!passkitConfigured()) throw new Error('passkit_not_configured')

  const pass = new PKPass(images || {}, {
    wwdr: process.env.PASSKIT_WWDR_PEM,
    signerCert: Buffer.from(process.env.PASSKIT_CERT_P12, 'base64'),
    signerKey: Buffer.from(process.env.PASSKIT_CERT_P12, 'base64'),
    signerKeyPassphrase: process.env.PASSKIT_CERT_PASSWORD,
  })

  const json = buildPassJson(status, { origin, authToken })
  pass.type = 'generic'
  for (const [k, v] of Object.entries(json)) {
    if (k === 'generic' || v === undefined) continue
    pass.props[k] = v
  }
  for (const [group, fields] of Object.entries(json.generic)) {
    for (const f of fields) pass[group].push(f)
  }

  return pass.getAsBuffer()
}

export { STAGES, STAGE_ORDER }
