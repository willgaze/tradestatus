/**
 * Is everything that describes the app as new as the app?
 *
 *   node scripts/check-current.mjs
 *
 * The app is being built fast, by several sessions a day. The words that
 * describe it — the plan page, the homepage, the ServiceM8 guide, the
 * roadmap, the diary, CLAUDE.md — fall behind within a night unless something
 * checks. This does, without a database or a browser, and it fails loudly
 * with the file named. Every nightly build and every session runs it before
 * pushing. Will, 12 Oct 2026: "all plans, homepages, guides and instructions
 * need to be part of the routine updates done every night".
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { VERSION, BUILD_DATE, CHANGELOG } from '../src/lib/version.js'

const read = (p) => readFileSync(p, 'utf8')
const fails = []
const warn = []
const ok = (cond, msg) => { if (!cond) fails.push(msg) }

// 1. The changelog's top entry is this version, dated this build.
const top = CHANGELOG[0]
ok(top && top.version === VERSION, `version.js: VERSION is ${VERSION} but the top changelog entry is ${top?.version}`)
ok(top && top.date === BUILD_DATE, `version.js: BUILD_DATE ${BUILD_DATE} but the top changelog entry is dated ${top?.date}`)

// 2. The diary has a folder and a table row for this version (patch builds may share the minor's folder).
const minor = VERSION.replace(/\.\d+$/, '.0')
const hasFolder = existsSync(`docs/diary/v${VERSION}`) || existsSync(`docs/diary/v${minor}`)
ok(hasFolder, `docs/diary: no folder for v${VERSION} (or v${minor})`)
const diaryTable = read('docs/diary/README.md')
ok(diaryTable.includes(`[v${VERSION}]`) || diaryTable.includes(`[v${minor}]`), `docs/diary/README.md: no table row for v${VERSION}`)
if (hasFolder) {
  const folder = existsSync(`docs/diary/v${VERSION}`) ? `docs/diary/v${VERSION}` : `docs/diary/v${minor}`
  const readme = existsSync(`${folder}/README.md`) ? read(`${folder}/README.md`) : ''
  ok(readme.length > 0, `${folder}/README.md is missing`)
  const shots = readdirSync(folder).filter((f) => f.endsWith('.webp'))
  if (shots.length === 0 && !/not captured/i.test(readme)) fails.push(`${folder}: no screenshots and the README does not say "Not captured"`)
}

// 3. The plan page's "updated" date is not older than the build.
const plan = read('src/lib/plan.js')
const updated = plan.match(/updated:\s*'(\d{1,2}) (\w{3}) (\d{4})'/)
if (updated) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const d = new Date(Date.UTC(+updated[3], months.indexOf(updated[2]), +updated[1]))
  const b = new Date(BUILD_DATE + 'T00:00:00Z')
  const daysBehind = Math.round((b - d) / 86400000)
  ok(daysBehind <= 3, `src/lib/plan.js: PLAN_META.updated is ${updated[0].slice(10)} (${daysBehind} days behind BUILD_DATE). Re-read the plan against the app and set it.`)
} else fails.push('src/lib/plan.js: no PLAN_META.updated found')

// 4. The roadmap and the changelog agree on what is live: a changelog entry
//    that announces a feature by its roadmap key must not leave that key 'idea'.
const roadmap = read('src/lib/roadmap.js')
const ideaKeys = [...roadmap.matchAll(/key:\s*'([^']+)'[^}]*?state:\s*'idea'/gs)].map((m) => m[1])
const liveText = CHANGELOG.slice(0, 6).map((c) => c.notes.join(' ')).join(' ').toLowerCase()
for (const k of ideaKeys) {
  const words = k.replace(/-/g, ' ')
  if (liveText.includes(`${words} is live`) || liveText.includes(`${words}: live`)) fails.push(`roadmap.js: '${k}' is still idea but the changelog says it is live`)
}

// 5. Every guide and instruction file names nothing the app no longer has, by
//    the simplest test: the files the words point at still exist.
const guides = ['src/app/page.js', 'src/app/with-servicem8/page.js', 'CLAUDE.md', 'docs/apple-wallet.md']
for (const g of guides) {
  if (!existsSync(g)) continue
  const s = read(g)
  for (const m of s.matchAll(/`(src\/[\w./-]+\.(?:js|jsx|mjs))`/g)) {
    if (!existsSync(m[1])) fails.push(`${g} names ${m[1]}, which does not exist`)
  }
  for (const m of s.matchAll(/`(scripts\/[\w.-]+\.(?:mjs|sh))`/g)) {
    if (!existsSync(m[1])) fails.push(`${g} names ${m[1]}, which does not exist`)
  }
}

// 6. CLAUDE.md mentions this version's headline somewhere, or at least is not
//    weeks stale: its newest "(vX.Y.Z)" marker should be within 5 minors.
const claude = read('CLAUDE.md')
const marks = [...claude.matchAll(/v1\.(\d+)\.\d+/g)].map((m) => +m[1])
const newest = marks.length ? Math.max(...marks) : 0
const cur = +VERSION.split('.')[1]
if (cur - newest > 5) warn.push(`CLAUDE.md: newest version it mentions is 1.${newest}; the app is ${VERSION}. Read it against the app.`)

for (const w of warn) console.log(`  warn  ${w}`)
for (const f of fails) console.log(`  FAIL  ${f}`)
console.log(fails.length ? `\n${fails.length} thing(s) describe an app that is not this one.` : '\nEverything that describes the app is as new as the app.')
process.exit(fails.length ? 1 : 0)
