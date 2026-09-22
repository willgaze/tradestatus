# My Trade Status

Live job tracking for trades. The customer opens one link and sees where their
job actually is.

**Booked in → On my way → On site → Job done.** *Paused* sits off to one side
with a note saying why, because "waiting on the cylinder" is the thing a
customer most wants said out loud and the thing least often said.

## What it deliberately does not do

Promise a time. No countdown, no minute-level ETA. "On my way" is a fact and
"set off at 07:42" is a record. One tradesperson cannot keep a promise about
traffic, so the product does not make one.

## Routes

| Route | What it is |
|---|---|
| `/t/[code]` | The customer's page. No login, polls every 30s and on tab focus |
| `/dashboard` | The trade's side. Create a link, then one tap per stage |
| `/login` | Password sign-in for the dashboard |
| `/api/status/[code]` | Public by design — returns a whitelist, never the row |
| `/api/dashboard/trackers` | Operator-guarded, every handler |

## Setup

One command. It creates the Neon database, creates the Vercel project, sets
every environment variable, deploys, and creates the tables. You sign in to
Neon and Vercel in the browser when prompted — no API tokens to copy or
revoke afterwards.

```bash
bash scripts/setup.sh
```

It prints the dashboard URL and a generated password at the end. The secrets
are generated on your machine, so they never appear in git or in a chat log.

### By hand instead

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, OPERATOR_PASSWORD
npm run db:push             # creates the two tables
npm run dev
```

Use Neon's **pooled** connection string. A serverless function opens a
connection per invocation, and a direct string runs the database out of them.

`NEXT_PUBLIC_TRADE_NAME` and `NEXT_PUBLIC_TRADE_PHONE` decide whose name and
number the customer sees. Nothing about any one trade is hardcoded.

## Security

The code in the URL is the only credential a customer has, so it is 8
characters from a 31-character alphabet with no `0/O` or `1/I/L` to misread off
a text message. Revoking a link deactivates it rather than deleting the
history. The public route returns `publicShape()` only — internal ids, view
counts and who looked stay on the server. Every `/api/dashboard` handler calls
`requireOperator()` itself; the layout guard is a convenience on top, never the
only lock.

## History

Built inside the Rosebourne Plumbing website in Sep 2026 by mistake and
extracted here, which is where it should have started. Rosebourne is the first
trade using it, not the product.
