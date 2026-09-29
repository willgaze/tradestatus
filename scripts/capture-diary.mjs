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
import { mkdir, writeFile } from 'node:fs/promises'
import { VERSION, BUILD_DATE, theme, CHANGELOG } from '../src/lib/version.js'

const BASE = process.env.BASE || 'http://localhost:3000'
const PASSWORD = process.env.OPERATOR_PASSWORD || 'smoketest'
const CODE = process.env.DEMO_CODE
const OUT = new URL(`../docs/diary/v${VERSION}/`, import.meta.url).pathname
const EXEC = process.env.CHROME_PATH || undefined

const SHOTS = [
  { name: 'customer-light', path: () => `/t/${CODE}`, scheme: 'light', full: true, auth: false },
  { name: 'customer-dark',  path: () => `/t/${CODE}`, scheme: 'dark',  full: true, auth: false },
  { name: 'dashboard',      path: () => '/dashboard', scheme: 'light', full: true, auth: true },
  { name: 'login',          path: () => '/login',     scheme: 'light', full: false, auth: false },
  { name: 'landing',        path: () => '/',          scheme: 'light', full: false, auth: false },
]

const run = async () => {
  if (!CODE) throw new Error('Set DEMO_CODE to a tracking code that exists on this server.')
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch({ executablePath: EXEC })
  let cookie = null
  {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: PASSWORD }),
    })
    const set = r.headers.get('set-cookie')
    if (set) cookie = set.split(';')[0].split('=').slice(1).join('=')
  }

  const done = []

  // The wallet views are the marketing shots — the ones that show what this
  // is, without a paragraph of explanation. Captured separately because each
  // needs a tab clicked first.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
    if (cookie) await ctx.addCookies([{ name: 'mts-session', value: cookie, url: BASE }])
    const page = await ctx.newPage()
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    const card = page.locator('section', { hasText: 'The wallet card' }).first()
    await card.scrollIntoViewIfNeeded()
    for (const [tab, name] of [['In the wallet', 'wallet-in-stack'],
                               ['Opened', 'wallet-opened'],
                               ['On its own', 'wallet-alone']]) {
      await page.getByRole('button', { name: tab, exact: true }).click()
      await page.waitForTimeout(500)
      await card.screenshot({ path: `${OUT}${name}.webp`, type: 'webp', quality: 82 })
      done.push(name)
      console.log('  captured', name)
    }
    await ctx.close()
  }

  for (const shot of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: shot.scheme,
    })
    if (shot.auth && cookie) {
      await ctx.addCookies([{ name: 'mts-session', value: cookie, url: BASE }])
    }
    const page = await ctx.newPage()
    await page.goto(BASE + shot.path(), { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    const file = `${OUT}${shot.name}.webp`
    await page.screenshot({ path: file, fullPage: shot.full, type: 'webp', quality: 82 })
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

${done.map((n) => `### ${n}\n\n![${n}](./${n}.webp)`).join('\n\n')}
`)
  console.log(`\nDiary written to docs/diary/v${VERSION}/`)
}

run().catch((e) => { console.error(e.message); process.exit(1) })
