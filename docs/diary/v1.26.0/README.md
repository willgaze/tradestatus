# v1.26.0 — Clay

**2026-10-10** · background `#faf6f2` · accent `#9a4a24`

- The attendance record: every set-off, arrival and finish, one row per visit, as a CSV from the dashboard
- A second visit after a pause is a second row. A job nobody went to is a row that says so
- Built for the first enterprise wedge, social housing, decided the same day

### attendance-sample.csv

What the file looks like, from the fixtures in `scripts/check-attendance.mjs` rather than a database. Four jobs: one paused for a part and finished on a second visit, one nobody went to, one still on site, one closed from the office.

[attendance-sample.csv](./attendance-sample.csv)

The customer, wallet and dashboard shots are not in this folder: this build was made on a machine with no Postgres, so the dashboard could not be seeded, and the next capture fills them in. The export itself was checked against a running `next start`: unauthenticated is 401, a bad range is 400, and with no database it is 503 and never a blank file.
