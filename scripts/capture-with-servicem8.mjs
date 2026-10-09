/**
 * The captures on /with-servicem8, from the seeded local database.
 *
 *   bash scripts/local-db.sh
 *   node scratchpad-or-wherever/fake-sm8.mjs &        (SM8_API_BASE below)
 *   NEXT_PUBLIC_TRADE_NAME="Sam Hale Plumbing" npm run build
 *   SM8_API_KEY=test-key SM8_API_BASE=http://localhost:3598 npx next start -p 3741 &
 *   BASE=http://localhost:3741 node scripts/capture-with-servicem8.mjs
 *
 * Writes public/with-servicem8/*.webp. Rebuild afterwards: Next serves only
 * the public/ files that existed at build time.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const BASE = process.env.BASE || 'http://localhost:3741'
const OUT = 'public/with-servicem8/'
const EXEC = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const PASSWORD = process.env.OPERATOR_PASSWORD || 'smoketest'
const PSQL = `psql -h localhost -p ${process.env.LOCAL_DB_PORT || 5433} -U postgres tradestatus -At`
const sql = (q) => execSync(PSQL, { input: q, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim()
const webp = (png, name) => sharp(png).webp({ quality: 84 }).toFile(`${OUT}${name}.webp`).then(() => console.log('  captured', name))

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

// the customer's page in each stage — the seeded job K7M4PQRT, moved by hand
const CODE = 'K7M4PQRT'
const page = await phone.newPage()
const states = {
  booked: `update "TradeStatus" set stage='BOOKED', "stageNote"=null, "arrivingAt"=null where code='${CODE}'`,
  onway:  `update "TradeStatus" set stage='ON_MY_WAY', "stageNote"=null, "arrivingAt"=now() - interval '6 minutes' where code='${CODE}'`,
  onsite: `update "TradeStatus" set stage='ON_SITE', "stageNote"='Old cylinder is out. Starting on the new one now.' where code='${CODE}'`,
  paused: `update "TradeStatus" set stage='PAUSED', "stageNote"='Away from site for now — back to finish.' where code='${CODE}'`,
  done:   `update "TradeStatus" set stage='DONE', "stageNote"='All done. Thank you for having me.' where code='${CODE}'`,
}
for (const [name, q] of Object.entries(states)) {
  sql(q)
  await page.goto(`${BASE}/t/${CODE}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(600)
  await webp(await page.screenshot({ type: 'png' }), `customer-${name}`)
}
sql(states.onsite)

// the claim page for the fake ServiceM8 job
await page.goto(`${BASE}/j/2715`, { waitUntil: 'networkidle' }); await page.waitForTimeout(400)
await webp(await page.screenshot({ type: 'png' }), 'claim')
// and make the linked tracker exist, the way a customer would
await page.goto(`${BASE}/j/2715/07979350201`, { waitUntil: 'networkidle' })

// operator session for the dashboard
const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) })
const set = r.headers.get('set-cookie'); const cookie = set ? set.split(';')[0].split('=').slice(1).join('=') : null
if (!cookie) { console.error('no operator session'); process.exit(1) }
await phone.addCookies([{ name: 'mts-session', value: cookie, url: BASE }])
// start listening against the fake, so the panel reads Listening
await fetch(`${BASE}/api/dashboard/servicem8`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: `mts-session=${cookie}` }, body: JSON.stringify({ action: 'subscribe' }) })

// a day's worth of events in the Lately log, so the panel shows what a real
// job leaves behind rather than one line. Invented, like every name in the seed.
sql(`delete from "Sm8Event";
insert into "Sm8Event" (id, event, "jobUuid", "tradeStatusId", outcome, "receivedAt") values
 ('cap1','sync.link','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'unchanged', now() - interval '3 hours 40 minutes'),
 ('cap2','job.checked_in','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'moved:ON_SITE', now() - interval '2 hours 55 minutes'),
 ('cap3','job.updated','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'unchanged', now() - interval '2 hours 10 minutes'),
 ('cap4','job.checked_out','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'moved:PAUSED', now() - interval '95 minutes'),
 ('cap5','job.checked_in','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'moved:ON_SITE', now() - interval '50 minutes'),
 ('cap6','job.completed','01a05be8-c133-7bdc-9097-55b7304e9ccd',null,'moved:DONE', now() - interval '4 minutes');`)

const dash = await phone.newPage()
await dash.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' }); await dash.waitForTimeout(1200)
// the linked card, framed as a phone: scroll it to the top and take the viewport
const card = dash.locator('li', { hasText: 'Diana Whitefield' }).first()
await card.evaluate((el) => el.scrollIntoView({ block: 'start' })); await dash.waitForTimeout(300)
await dash.evaluate(() => window.scrollBy(0, -72))
await webp(await dash.screenshot({ type: 'png' }), 'dashboard-card')
// the stage buttons on a card: open the seeded On site job and show its buttons
const onsite = dash.locator('li', { hasText: 'Sarah Whitfield' }).first()
await onsite.evaluate((el) => el.scrollIntoView({ block: 'start' })); await dash.waitForTimeout(300)
await dash.evaluate(() => window.scrollBy(0, -72))
await webp(await dash.screenshot({ type: 'png' }), 'dashboard-stage')
// the ServiceM8 panel and its Lately log — the panel is shut by default, so open it
const opener = dash.getByRole('button', { name: /^ServiceM8/ }).first()
await opener.scrollIntoViewIfNeeded()
if ((await opener.getAttribute('aria-expanded')) !== 'true') { await opener.click(); await dash.waitForTimeout(900) }
const panel = dash.locator('section', { has: opener }).first()
await panel.scrollIntoViewIfNeeded(); await dash.waitForTimeout(300)
await webp(await panel.screenshot({ type: 'png' }), 'dashboard-sm8')
const lately = dash.getByText('Lately', { exact: true }).first()
const box = await lately.boundingBox()
const pbox = await panel.boundingBox()
if (box && pbox) await webp(await dash.screenshot({ type: 'png', clip: { x: pbox.x, y: box.y - 8, width: pbox.width, height: Math.min(pbox.y + pbox.height - box.y + 8, 420) } }), 'dashboard-lately')
await browser.close()
console.log('done')
