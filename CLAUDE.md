# CLAUDE.md — My Trade Status

## This is not Rosebourne Plumbing

**Read this first, because the mistake has been made twice.**

My Trade Status is its own product, in its own repository, with its own
database and its own Vercel project. Rosebourne Plumbing is a *customer* of it
— the first one, and currently the only one. The two share nothing but an
owner.

If you find yourself editing `rosebourneplumbing`, you are in the wrong repo.
If you are about to write "Rosebourne", "Andover", "Marlborough", "01264" or
"WaterSafe" into this codebase, stop: none of those words belong here, and
`grep -rn "Rosebourne" src/` must stay empty.

The trade's identity comes from environment variables and nowhere else:

```
NEXT_PUBLIC_TRADE_NAME       "Rosebourne Plumbing"
NEXT_PUBLIC_TRADE_PHONE      "01264 502027"
NEXT_PUBLIC_TRADE_PHONE_TEL  "01264502027"
```

Fitting this to a second trade must stay a configuration change, never a code
change. `src/lib/trade.js` is the only place those are read.

## What it is

The status bar the trades never got. A customer gets one link, opens it with no
account, and sees where their job actually is:

**Booked in → On my way → On site → Job done.** *Paused* sits off to one side
with a note saying why, because "waiting on the cylinder" is the thing a
customer most wants said out loud and the thing least often said.

The reference point is the Apple Wallet card you get for a flight, or Shopify's
Shop app for a parcel. Same idea, for physical work at someone's house.

## What it deliberately does not do

**It never promises a time.** No countdown, no ETA, no "with you in 20
minutes". "On my way" is a fact. "Set off at 07:42" is a record. One
tradesperson cannot keep a promise about traffic, so the product does not make
one — and no future feature may introduce one.

This is the same discipline as the customer's own site: say what is true and
checkable, never what sounds reassuring.

## How it looks is part of what it says

The customer's page is drawn to the current iOS look: translucent layered cards
over a stage-tinted wash, the system font, inset grouped lists, dark mode. That
is not decoration. This is a page a sole trader sends to someone's mother, and
one that looks like a form from 2011 says the firm behind it is careless before
a word is read.

**Two colour systems, each with exactly one job.** Mixing them up is how the
page stops meaning anything:

| | Owns | Rotates? |
|---|---|---|
| `THEMES` in `src/lib/version.js` | the page background, and the accent on the landing page, sign-in and dashboard furniture | **yes**, nightly |
| stage tints in `src/app/globals.css` | the five stages, and nothing else | **never** |

A stage colour means something — a customer who has used this twice knows amber
before they have read a word — and a meaning that changes colour every night is
not a meaning. Both lists are curated and contrast-checked; neither is ever
generated at runtime.

A stage sets `--tint` once, via `tone-<tone>` on a wrapper, and the card, the
icon well, the rail and the buttons beneath it all read it. Adding a stage means
adding a tint, not editing five components.

**No emoji anywhere under `src/`.** They render in whatever style the phone
ships, at a weight and colour nobody chose. `src/components/icons.jsx` holds the
drawings; `src/lib/trade-status.js` and `src/lib/presence.js` carry only a name,
because both are imported by API routes and hold no JSX. This check must stay
silent:

```bash
python3 -c "
import re, glob
pat = re.compile('[\U0001F000-\U0001FAFF\u2300-\u27BF\u2B00-\u2BFF\uFE0F]')
for f in glob.glob('src/**/*.js*', recursive=True):
    for i, line in enumerate(open(f, encoding='utf-8'), 1):
        if pat.search(line): print(f'{f}:{i}')
"
```

**Nothing counts down.** The live dot on the rail breathes so the page reads as
current. It measures nothing, and no future animation may imply an arrival time.

## The link is the credential

A customer has no login and never will. The code in the URL is the only thing
standing between a stranger and someone's name and home address, so:

- Codes come from `generateCode()` — 8 characters of
  `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. No 0/O, no 1/I/L, because it gets read
  off a text message.
- Codes are **revocable**. `isActive: false` and the link 404s.
- `/api/status/[code]` returns `publicShape(row)` and never the row. Adding a
  field to the schema does not expose it; you must add it to `publicShape`
  deliberately. Never widen it to include `id`, `externalId`, `viewCount` or
  `lastViewedAt`.
- Every page carries `robots: { index: false }`. A leaked link must never end
  up in a search index.

## Every operator route guards itself

`requireOperator()` from `src/lib/operator-auth.js` is the first statement of
every handler under `/api/dashboard`, and `isOperator()` guards the dashboard
layout. There is no middleware and there should not be one — a route protects
itself or it is not protected. Both fail closed: no `JWT_SECRET` means nobody
is an operator, never the reverse.

```bash
python3 - <<'PY'
import re, glob
H = re.compile(r"export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(")
for f in sorted(glob.glob('src/app/api/dashboard/**/route.js', recursive=True)):
    s = open(f).read()
    h, g = len(H.findall(s)), s.count('await requireOperator()')
    if h != g: print(f"{h} handlers, {g} guards  {f}")
PY
```

Silence means every handler is guarded.

## Free text is never trusted

A JSON body can hand you a number where a string belongs. `body.x?.trim()`
then throws a TypeError, the catch block hands it to `dbReason()`, and the
answer is a 503 about the database — sending you to the Neon console over a
malformed request. Everything user-supplied goes through `cleanText()` in
`src/lib/clean-text.js`, which coerces rather than assumes and caps at 500
characters.

## Things that have already gone wrong here

Each of these was live. Do not reintroduce them.

- **`arrivingAt` wiped on arrival.** The stage handler read
  `data.arrivingAt = stage === 'ON_MY_WAY' ? new Date() : null`, so moving to
  On site reset it and "Set off at 14:20" vanished from the customer's page at
  exactly the moment it mattered. Only stamp entering `ON_MY_WAY`; only clear
  going back to `BOOKED`.
- **`viewCount` counted polls.** `StatusTracker` polls every 30 seconds; the
  status route incremented on every response, so a tab left open logged 120
  "views" an hour. Counting belongs on the page, which runs once per visit.
- **A code collision returned a database error.** `code` is unique and
  generated randomly. Retry, do not report a database fault.
- **The login route had no throttle.** One shared password on a public URL.
  Ten attempts per IP per ten minutes. Note honestly in any change here that
  it is per-instance memory, so it is a speed bump, not a lock.
- **Dates tore the page in half.** `toLocaleString()` with no zone runs in UTC
  in a serverless function and in the customer's zone on their phone, so "Set
  off at 07:42" rendered an hour out on one of them. Naming the zone was not
  enough: Node and mobile Safari ship different Unicode locale data, and en-GB
  genuinely disagrees with itself — `Tue 29 Sept` against `Tue, 29 Sept`, `Sep`
  against `Sept`. React saw the mismatch and threw the whole tree away
  mid-hydration. **Every date on a page that renders on both sides goes through
  `src/lib/when.js`**, which uses `Intl` only for the numbers and owns the names
  and separators itself. Never `toLocaleString()` in a component.
- **An input bound to `undefined`.** The create form had a `customerPhone` field
  but `EMPTY` did not, so React treated it as uncontrolled and then complained
  the moment it was typed in. Every key the form renders belongs in `EMPTY`.
- **Deployment protection.** `tradestatus.vercel.app` is open; the generated
  per-deployment URLs are behind Vercel's login. Never put a
  `tradestatus-<hash>-…` URL in front of a customer.

## Stack and commands

Next.js 15 App Router (JavaScript only), React 19, Tailwind, Prisma + Neon.
Two models, `TradeStatus` and `TradeStatusEvent`, in their own database.

```bash
npm run dev
npm run build
npx prisma db push            # needs DATABASE_URL in the environment, not .env.local
bash scripts/setup.sh         # idempotent: reuses both projects, re-reads Neon's
                              # connection string — also how a rotated password
                              # reaches Vercel
```

`main` is connected to Vercel: a push deploys to production, any other branch
gets a preview.

## Not built yet

**The wallet pass.** This is the premise of the product and it does not exist.
Today the customer gets a web page; the idea is a card that sits in Apple
Wallet and Google Wallet and updates itself. Both need credentials the
repository does not have:

- **Apple Wallet (PassKit)** — an Apple Developer Program membership and a Pass
  Type ID certificate. Passes update over APNs.
- **Google Wallet** — a Google Cloud project, a Wallet API issuer account, and
  a service account key.

Until those exist, the honest position is that this is a link, not a card. Do
not describe it as a wallet pass anywhere customer-facing.

## The nightly build

A Routine fires overnight and builds the next version. The rules it works to —
break these and the app gets worse every night, slowly, in ways nobody notices
until it is bad.

**Bump the version and advance the theme.** `src/lib/version.js` holds
`VERSION`, `BUILD_DATE`, `THEME_INDEX` and `CHANGELOG`. Move the index on by
one so the app visibly changes colour, add a changelog entry naming what
actually changed, and set the build date.

**Never invent a colour.** `THEMES` is a curated list of background/accent
pairs. Add one if the list is running short, checking white text on the accent
and dark text on the background for contrast. Generating one at runtime to be
"a colour not used before" produces mud and unreadable text within a week.

**Capture the diary before finishing — against `next start`, never `next dev`.** The dev server paints its own badge over the page and v1.4.0's diary has it in every shot. The script now refuses a dev server; build, then start, then capture.

**Capture the diary before finishing.** `scripts/capture-diary.mjs` writes
`docs/diary/v<version>/`. Nothing in there is ever overwritten, tidied or
deleted: it is the record of what the app looked like on a given day, and it is
wanted for marketing.

**Improve one real thing, not five speculative ones.** A nightly build that
churns the interface is worse than one that fixes a defect. Look at what is
actually wrong — read `docs/diary/` against the current build, run the app,
check the roadmap votes in `FeatureInterest` — then do one thing properly and
say what it was.

**Never claim something works when it does not.** The roadmap in
`src/lib/roadmap.js` marks each item `live`, `ready` or `idea`. Moving an item
to `live` means it is live.

**The rules in the rest of this file still apply at 3am.** No promised arrival
times. Nothing hard-coded that belongs in an env var. Every operator route
guards itself. Build and verify before pushing; `main` deploys on push, so a
broken push is a broken product until someone notices.
