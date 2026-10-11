# v1.31.0 — Plum

**2026-10-11** · background `#f9f4f8` · accent `#7a2f5e`

- The day before the job, the customer is asked whether anyone will be in. Once, at four in the afternoon, trade's own time
- A notification if they have one on; the page asks either way; the trade is nudged to text the link if nothing of theirs can be reached
- The first build for the pilot on the owner's own jobs

Not captured: the customer, wallet and dashboard shots. This build was made on a machine with no Postgres, so neither the dashboard nor a job the afternoon before could be seeded. The decision is checked by `scripts/check-day-before.mjs` (16 cases, the clock change included); the sending path is read, not run.
