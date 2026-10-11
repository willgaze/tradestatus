# v1.30.0 — Teal

**2026-10-11** · background `#f2f9f9` · accent `#1f6f72`

- The attendance record: every set-off, arrival and finish, one row per visit, as a CSV from Setup and settings
- A second visit after a pause is a second row. A job nobody went to is a row that says so
- Pay to book and escrow on the roadmap as ideas, in that order, after the pilot

### attendance-sample.csv

What the file looks like, from the fixtures in `scripts/check-attendance.mjs` rather than a database. Four jobs: one paused for a part and finished on a second visit, one nobody went to, one still on site, one closed from the office.

[attendance-sample.csv](./attendance-sample.csv)

Not captured: the customer, wallet and dashboard shots. This build was made on a machine with no Postgres, so the dashboard could not be seeded, and the next capture fills them in. The export itself was checked against a running `next start`: unauthenticated is 401, a bad range is 400, and with no database it is 503 and never a blank file.
