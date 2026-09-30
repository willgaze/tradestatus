# CLAUDE.md — Turnup

**The product is called Turnup.** It was My Trade Status until v1.9.0; the
repository, the Vercel project, the database and the Prisma models keep that
working title because renaming plumbing buys nothing. Everything a person
reads takes the name from `src/lib/product.js`, and nowhere else — so
`grep -rn "My Trade Status" src/` should only ever find comments explaining
the history. The mark is applied for, not registered: ™ only, never ®, until
the IPO says otherwise.

## This is not Rosebourne Plumbing

**Read this first, because the mistake has been made twice.**

Turnup is its own product, in its own repository, with its own
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

## What may go on a lock screen

Push notifications are the least private surface this product touches: they are
read by whoever picks the phone up off the kitchen table, not by whoever holds
the link. So a notification carries **the trade's name and the stage, and
nothing else** — never the address, never the job reference, never the
customer's name, and never `stageNote`, which is free text and could say
anything. Detail lives behind the link, where the code is the credential.
`LINES` in `src/lib/push.js` is the whole vocabulary; adding a field to it is a
privacy decision, not a copy one.

The no-promised-time rule applies here hardest. "Has set off" is a fact. A push
notification is the very worst place to promise an arrival.

**Push never blocks a stage change.** `notifyStage()` is called un-awaited from
the tracker PATCH handler and swallows everything: the trade tapped a button on
a driveway and is waiting on that response, and a push service having a bad
afternoon must not turn it into an error. A 404 or 410 from a push service means
the browser discarded the subscription — delete the row, do not retry it.

**The iPhone catch.** iOS delivers web push only to a page added to the home
screen; Safari in a tab has no `Notification` API at all, so subscribing does
not fail, it is absent. `src/app/t/Notify.jsx` detects that and shows the
two-tap how-to instead of a button that does nothing. Never replace that with a
button.

**It is invisible until configured.** No `NEXT_PUBLIC_VAPID_PUBLIC_KEY` means
the row does not render and nothing sends. That is the gate that lets this ship
before the keys and the migration exist.

## The assistant proposes, never acts

The box at the top of the dashboard takes words — typed, dictated, or a pasted
booking email — and hands back a card. `src/lib/assistant.js` is the whole of
it, and three rules hold there that hold everywhere else in this file:

- **It never writes.** `propose()` returns JSON to the browser; the trade taps
  Confirm; `/api/dashboard/trackers` does the work exactly as if the form had
  been filled in. Do not give the model a tool that touches the database. A
  wrong reading costs one tap, and that is the whole safety model.
- **It never promises a time.** The prompt forbids it and `stripTimePromise()`
  is the second lock: a note like "with you by 2" is dropped, with a warning
  the card shows, and the time goes into the arrival window where it belongs.
- **Its output is untrusted.** `sanitiseProposal()` treats the model's JSON
  as a body from a stranger: `cleanText()`, the stage whitelist, the date and
  time checks, and a job id that must be one it was shown. Adding a field to
  the proposal means adding it there, deliberately.

It is trade-side only. The customer's page is a status bar; a chat on that side
is how the product started asking the customer things last time, and the
answers ended up on a forwardable link. It is invisible until
`ANTHROPIC_API_KEY` is set — the same gate as push — and the key never reaches
the browser, only the fact that there is one.

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

**One rule decides what `publicShape()` may return:**

> It carries what the **trade** told the **customer**.
> It never carries what the **customer** told the **trade**.

A tracking link gets forwarded — to a partner, into a family group chat, onward
from there. Everything `publicShape()` returns is readable by everyone that link
reaches, for as long as it is live.

That rule was broken once, and nobody noticed because each step was reasonable.
The product grew from *reporting* ("on my way") into *asking* ("will someone be
in?"), the credential never changed to match, and the answers went back onto the
page. Together they were the address, a photo of the house, a photo of the front
door, which door to use, "the gate sticks, park on the verge", whether there is
a dog, "No, I'm out", and "between 09:00 and 11:00" — a door, a time and a way
in, on a link anyone could forward.

So: **customer-supplied answers live on the device that supplied them**
(`src/app/t/own-answers.js`, browser storage) and on the dashboard, which is
behind a password. The customer's own phone prefills their form; a forwarded
link gets a blank one and learns nothing. `presenceAt` is public and `presence`
is not — the page may say *when* someone answered, never *what* they said.

House and door photos are not on the customer page at all. They are wayfinding
for the trade, the customer already knows their own front door, and a photo of
it beside "nobody is in" is the single most valuable thing on that page to
somebody who should not have it.

This check must pass, and it fails loudly with the field named:

```bash
node scripts/check-public-shape.mjs
```
- **`public/sw.js` caches nothing, deliberately.** A service worker's scope is
  the whole origin, and the origin includes `/dashboard` — every customer's name
  and address, behind a password. A caching worker there puts that list in a
  browser store. Offline support is worth having and should come back, but
  scoped and on purpose, never as a side effect of wanting notifications.

## A pin is a coordinate, and coordinates are the sharpest thing here

`mapPin` holds a Google Maps URL, and a pin dropped from a phone's GPS is
written into that same column as `…/maps/search/?api=1&query=LAT,LNG` — see
`coordsPinUrl()` in `src/lib/places.js`. That is deliberate: no new columns, no
migration, and `normaliseMapPin()` checks a dropped pin on the way in exactly
as it checks a pasted one. `pinCoords()` reads it back, which is what lets
**Navigate** give turn-by-turn to the exact spot rather than a map centred near
it.

Two rules for anything that touches location:

- **Never ask for it automatically.** `DropPin` fires on a tap and only on a
  tap. Requesting a location on page load is hostile, and iOS refuses a prompt
  with no gesture behind it — so "automatic" means a dialog nobody asked for,
  followed by a denial that needs a trip to Settings to undo.
- **Never take a fix on trust.** A phone indoors can be a hundred metres out,
  which in a terrace is four doors down. The reading carries an accuracy radius;
  anything vaguer than 60m is accepted with a warning that says so. A pin that
  is confidently wrong is worse than no pin, because it sends a van somewhere
  with certainty.

A precise location is the sharpest field this product holds, so it obeys the
rule above it: the trade sees it on the dashboard, the tapping device remembers
it, and it is not in `publicShape()`.

**what3words from a GPS fix needs their API and a key**, so it is not built.
Once there is a pin it is also not needed — three words exist to be said down a
phone, and a pin is better for everything else.

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
- **A forwarded link became a burglary kit.** Covered in full under *The link is
  the credential*. The shape of the mistake is the part worth remembering: no
  single commit did it. The product grew from reporting into asking, each new
  field was reasonable on its own, and the security model was never revisited to
  match. **When this product starts asking the customer something new, stop and
  ask who else can read the answer.**
- **A save wiped what it did not send.** `/api/status/[code]/notes` overwrote
  every access field on every call, so the presence buttons had to re-send the
  door, the dog and the notes just to preserve them — which is why those fields
  were on the page in the first place. It now patches: a field absent from the
  body is a field the caller is not changing.
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

## Shipping a schema change without taking the product down

**There are two kinds of migration and only one of them is safe to ship ahead
of the migration itself.**

| | If `prisma db push` has not run |
|---|---|
| A **new table** | Fails soft. Every read of it sits in a try/catch, the feature stays dark, nothing else notices. `PushSubscription` works this way. |
| **New columns on an existing table** | Fails **hard, everywhere**. Prisma selects every scalar field on a model, so the new columns are in every query for that table whether or not the new feature is touched. The whole product goes down, and the blast radius is every customer rather than the feature. |

This has happened. v1.9.0 added four columns to `TradeStatus`, the live database
did not have them, and from the moment it deployed every tracking link read
"Status unavailable right now" and the dashboard could not load a job. It had to
be reverted.

So: **columns on an existing table are not shippable until the migration has
run.** Either run it first, or hold the commit. Do not reason from "the push
table shipped fine" — that was a new table, which is the other case.

### The check after any deploy that touches the schema

One curl, and it is not optional:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://tradestatus.vercel.app/api/status/ZZZZZZZZ
```

**404 is healthy** — the row was looked for and not found. **503 means the code
and the database disagree**, and every customer link is down right now. A page
that still returns 200 proves nothing: it renders the "unavailable" state with a
perfectly good status code.

Checking the theme colour changed is not this check. The theme comes from a
constant in the bundle and is green while the database is on fire.

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
