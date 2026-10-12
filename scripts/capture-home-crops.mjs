/**
 * The small pictures on the homepage: a part of a screen, not a whole phone.
 *
 *   NEXT_PUBLIC_TRADE_NAME="Sam Hale Plumbing" npm run build && npx next start -p 3100 &
 *   BASE=http://localhost:3100 node scripts/capture-home-crops.mjs
 *
 * Writes public/home/crops/<name>.webp and src/lib/home-crops.json (the
 * pixel size of each, which next/image needs). Rebuild afterwards: Next
 * serves only what was in public/ at build time.
 *
 * Two sources, deliberately:
 *
 *   - The customer's page is photographed live from /preview, the same
 *     fixture the diary uses, one element at a time: the status card at each
 *     of the five stages, and each row opened. Recapture; never retouch.
 *   - The trade's screens need a database and an operator session, so those
 *     are cut from the full-screen captures already in public/home/ (the
 *     780-wide ones the diary made). The boxes below are in those pixels.
 *
 * Playwright is not a dependency: `npm install --no-save playwright`.
 * `ONLY=sm8 node scripts/capture-home-crops.mjs` cuts only the /with-servicem8
 * parts, `ONLY=house` only the household card (no browser either way), and
 * leaves every other crop untouched.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, writeFile, readFile } from 'node:fs/promises'

const BASE = process.env.BASE || 'http://localhost:3000'
const ROOT = new URL('../', import.meta.url).pathname
const OUT = `${ROOT}public/home/crops/`
const EXEC = process.env.CHROME_PATH || undefined

const sizes = {}
const save = async (png, name) => {
  const file = `${OUT}${name}.webp`
  const img = sharp(png)
  const { width, height } = await img.metadata()
  await img.webp({ quality: 84 }).toFile(file)
  sizes[name] = { w: width, h: height }
  console.log('  ', name, `${width}x${height}`)
}

// The rows on the customer page, by the title on the button that opens them.
const ROWS = [
  ['who',      'Who to expect'],
  ['presence', 'Will someone be in?'],
  ['window',   'When suits you?'],
  ['job',      'The job'],
  ['door',     'Help them find you'],
  ['history',  'What has happened'],
  ['terms',    'Before the visit'],
  ['notify',   'Tell me when they set off'],
]

// Parts of the trade's screens, cut from the existing full captures.
// [source file, left, top, width, height] in that file's pixels (780 wide).
// Rows that open long. A thumbnail wants the top of them, where the question is.
const TRIM = { 'row-door': 640, 'row-terms': 500, 'row-job': 560 }

// Push rows render only when NEXT_PUBLIC_VAPID_PUBLIC_KEY was set at build
// time, so that one is cut from the full capture the diary already made.
const CUSTOMER = {
  'row-notify': ['customer-notify.webp', 34, 156, 712, 498],
}

const TRADE = {
  'trade-stage-buttons': ['dashboard.webp',      34, 612, 712, 190],
  'trade-navigate-note': ['dashboard.webp',      34, 780, 712, 430],
  'trade-send':          ['trade-job-open.webp', 50, 1112, 680, 424],
  'trade-fields':        ['trade-new-job.webp',  34, 724, 712, 760],
  'trade-faceid':        ['trade-login.webp',    34, 800, 712, 310],
  'trade-plate':         ['trade-profile.webp',  34, 962, 712, 420],
}

// /with-servicem8: parts of the captures scripts/capture-with-servicem8.mjs
// made (they need the seeded database and a fake ServiceM8, so they are not
// re-photographed here). Same output folder, sm8- prefix, so Shot.jsx reads them.
const SM8 = {
  'sm8-customer-booked': ['customer-booked.webp', 34, 364, 712, 442],
  'sm8-customer-onway':  ['customer-onway.webp',  34, 364, 712, 500],
  'sm8-customer-onsite': ['customer-onsite.webp', 34, 364, 712, 672],
  'sm8-customer-paused': ['customer-paused.webp', 34, 364, 712, 672],
  'sm8-customer-done':   ['customer-done.webp',   34, 364, 712, 512],
  'sm8-claim':           ['claim.webp',           34, 230, 712, 1280],
  'sm8-dashboard-card':  ['dashboard-card.webp',  34, 150, 712, 790],
  'sm8-dashboard-stage': ['dashboard-stage.webp', 34, 455, 712, 190],
  'sm8-panel-head':      ['dashboard-sm8.webp',    0,   0, 716, 150],
  'sm8-lately':          ['dashboard-lately.webp', 0,   0, 716, 504],
}

// The household card, cut from public/home/household.webp: a 390x844 shot at 2x
// of /h/<seeded code> (scripts/local-db.sh seeds HOME24XK). The dashboard's
// Household cards panel shows it.
const HOUSE = {
  'house-card': ['household.webp', 24, 80, 732, 1180],
}

// ONLY=sm8 or ONLY=house cuts just that group from its existing capture, no
// browser, and leaves every other crop as it is.
const GROUPS = { sm8: ['with-servicem8', SM8], house: ['home', HOUSE] }

const run = async () => {
  await mkdir(OUT, { recursive: true })
  const existing = JSON.parse(await readFile(`${ROOT}src/lib/home-crops.json`, 'utf8').catch(() => '{}'))
  const only = process.env.ONLY
  if (only && !GROUPS[only]) throw new Error(`ONLY=${only}: not one of ${Object.keys(GROUPS).join(', ')}`)
  if (!only) {
  const browser = await chromium.launch({ executablePath: EXEC })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' })
  const page = await ctx.newPage()

  const open = async (path) => {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1100) // the rows rise in; wait for them to land
    if (await page.locator('nextjs-portal').count()) {
      throw new Error(`${BASE} is a dev server. Capture against \`next start\`.`)
    }
  }

  // The status card, one per stage.
  for (const stage of ['BOOKED', 'ON_MY_WAY', 'ON_SITE', 'PAUSED', 'DONE']) {
    await open(`/preview?stage=${stage}`)
    const card = page.locator('section[aria-live="polite"]').first()
    await save(await card.screenshot({ type: 'png' }), `stage-${stage.toLowerCase().replace('_', '-').replace('_', '-')}`)
  }

  // Each row, opened, on the busiest page.
  await open('/preview')
  for (const [name, title] of ROWS) {
    const btn = page.locator('button', { hasText: title }).first()
    if (!(await btn.count())) { console.log('   (no row)', title); continue }
    const section = page.locator('section', { has: btn }).first()
    await btn.click()
    await page.waitForTimeout(350)
    await section.scrollIntoViewIfNeeded()
    let png = await section.screenshot({ type: 'png' })
    if (TRIM[`row-${name}`]) {
      const { width } = await sharp(png).metadata()
      png = await sharp(png).extract({ left: 0, top: 0, width, height: TRIM[`row-${name}`] }).png().toBuffer()
    }
    await save(png, `row-${name}`)
    await btn.click() // shut it again so the next one is photographed alone
    await page.waitForTimeout(250)
  }

  await browser.close()

  for (const [name, [src, left, top, width, height]] of [...Object.entries(CUSTOMER), ...Object.entries(TRADE)]) {
    const png = await sharp(`${ROOT}public/home/${src}`).extract({ left, top, width, height }).png().toBuffer()
    await save(png, name)
  }
  }

  for (const [group, [dir, map]] of Object.entries(GROUPS)) {
    if (only && only !== group) continue
    for (const [name, [src, left, top, width, height]] of Object.entries(map)) {
      const png = await sharp(`${ROOT}public/${dir}/${src}`).extract({ left, top, width, height }).png().toBuffer()
      await save(png, name)
    }
  }

  await writeFile(`${ROOT}src/lib/home-crops.json`, JSON.stringify({ ...existing, ...sizes }, null, 2) + '\n')
  console.log('wrote', Object.keys(sizes).length, 'crops')
}

run().catch((e) => { console.error(e); process.exit(1) })
