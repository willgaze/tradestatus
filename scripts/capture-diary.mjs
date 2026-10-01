/**
 * Capture this version's look into the diary.
 *
 *   node scripts/capture-diary.mjs            # against a running dev/prod server
 *   BASE=http://localhost:3000 node scripts/capture-diary.mjs
 *
 * Every build keeps its own folder under docs/diary/<version>/, so nothing is
 * overwritten and the whole history stays browsable — for checking a change
 * landed, and for marketing later.
 *
 * Saved as WebP at 2x on a phone viewport. A PNG of each screen every night
 * would put a gigabyte a year into git; WebP at quality 82 is a tenth of that
 * and still sharp enough to put in front of someone. If this ever does get
 * heavy, the fix is object storage with the diary holding links — not deleting
 * the history, which is the one thing it exists for.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { VERSION, BUILD_DATE, theme, CHANGELOG } from '../src/lib/version.js'

const BASE = process.env.BASE || 'http://localhost:3000'
const PASSWORD = process.env.OPERATOR_PASSWORD || 'smoketest'
const CODE = process.env.DEMO_CODE
const OUT = new URL(`../docs/diary/v${VERSION}/`, import.meta.url).pathname
const EXEC = process.env.CHROME_PATH || undefined

// Without a DEMO_CODE there is no real job to photograph, so the customer
// shots come from /preview — the same component, drawn from a fixture. That is
// the difference between a diary entry and no diary entry on a machine with no
// database, and it keeps a real customer's name out of the marketing folder.
const CUSTOMER = CODE ? `/t/${CODE}` : '/preview'

const SHOTS = [
  { name: 'customer-light', path: () => CUSTOMER, scheme: 'light', full: true, auth: false },
  { name: 'customer-dark',  path: () => CUSTOMER, scheme: 'dark',  full: true, auth: false },
  // The state the page spends most of its life in. Only the fixture can show
  // it on demand, so it is skipped when shooting a real job.
  ...(CODE ? [] : [{ name: 'customer-booked', path: () => '/preview?stage=BOOKED', scheme: 'light', full: true, auth: false }]),
  { name: 'dashboard',      path: () => '/dashboard', scheme: 'light', full: true, auth: true, db: true },
  { name: 'login',          path: () => '/login',     scheme: 'light', full: false, auth: false },
  { name: 'landing',        path: () => '/',          scheme: 'light', full: false, auth: false },
]

// Playwright only writes PNG or JPEG; sharp (already here as a Next.js dependency)
// turns the PNG buffer into the WebP the diary keeps.
const toWebp = (png, file) => sharp(png).webp({ quality: 82 }).toFile(file)

const run = async () => {
  await mkdir(OUT, { recursive: true })
  if (!CODE) console.log('No DEMO_CODE \u2014 customer shots from /preview, operator shots skipped.')

  const browser = await chromium.launch({ executablePath: EXEC })
  let cookie = null
  try {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: PASSWORD }),
    })
    const set = r.headers.get('set-cookie')
    if (set) cookie = set.split(';')[0].split('=').slice(1).join('=')
  } catch {
    // No database, no session. The shots that need one are skipped below.
  }

  const done = []
  const skipped = []

  // The wallet views are the marketing shots — the ones that show what this
  // is, without a paragraph of explanation. Captured separately because each
  // needs a tab clicked first.
  if (!cookie) {
    skipped.push('the wallet views and the dashboard (they need an operator session)')
  } else {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
    if (cookie) await ctx.addCookies([{ name: 'mts-session', value: cookie, url: BASE }])
    const page = await ctx.newPage()
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    const card = page.locator('section', { hasText: 'The wallet card' }).first()
    await card.scrollIntoViewIfNeeded()
    // The showcase is shut by default now — 911px of a feature that does not
    // exist yet does not belong open on a screen opened every morning.
    const opener = card.getByRole('button', { name: /The wallet card/ })
    if (await opener.count()) { await opener.first().click(); await page.waitForTimeout(400) }
    for (const [tab, name] of [['In the wallet', 'wallet-in-stack'],
                               ['Opened', 'wallet-opened'],
                               ['On its own', 'wallet-alone']]) {
      await page.getByRole('button', { name: tab, exact: true }).click()
      await page.waitForTimeout(500)
      await toWebp(await card.screenshot({ type: 'png' }), `${OUT}${name}.webp`)
      done.push(name)
      console.log('  captured', name)
    }
    await ctx.close()
  }

  for (const shot of SHOTS) {
    if (shot.db && !cookie) continue
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: shot.scheme,
    })
    if (shot.auth && cookie) {
      await ctx.addCookies([{ name: 'mts-session', value: cookie, url: BASE }])
    }
    const page = await ctx.newPage()
    await page.goto(BASE + shot.path(), { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    // The dev server draws its own badge over the page. v1.4.0's diary was
    // captured with it in every shot. Refuse rather than record it.
    if (await page.locator('nextjs-portal').count()) {
      throw new Error(`${BASE} is a dev server (Next's badge is on the page). Capture against \`next start\`.`)
    }
    const file = `${OUT}${shot.name}.webp`
    await toWebp(await page.screenshot({ fullPage: shot.full, type: 'png' }), file)
    done.push(shot.name)
    console.log('  captured', shot.name)
    await ctx.close()
  }
  await browser.close()

  const t = theme()
  const release = CHANGELOG.find((c) => c.version === VERSION)
  await writeFile(`${OUT}README.md`, `# v${VERSION} — ${t.name}

**${BUILD_DATE}** · background \`${t.bg}\` · accent \`${t.accent}\`

${(release?.notes || ['No notes recorded.']).map((n) => `- ${n}`).join('\n')}
${skipped.length ? `\nNot captured this time: ${skipped.join('; ')}.\n` : ''}

${done.map((n) => `### ${n}\n\n![${n}](./${n}.webp)`).join('\n\n')}
`)
  console.log(`\nDiary written to docs/diary/v${VERSION}/`)
}

run().catch((e) => { console.error(e.message); process.exit(1) })
