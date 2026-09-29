# Version diary

One folder per build. Nothing here is ever overwritten or tidied away: it is
the record of what the app looked like on a given day, for checking a change
landed and for marketing later.

Each folder holds the wallet card in its three views, the customer page in
light and dark, the dashboard, the login and the landing page — plus the notes
for that version and the exact colours it wore.

Captured by `scripts/capture-diary.mjs`, which runs against a live server:

```bash
DEMO_CODE=<a tracking code that exists> node scripts/capture-diary.mjs
```

Roughly 700 KB a build, so about 200 MB a year. If it ever gets heavy the
answer is object storage with links from here — not deleting history, which is
the one thing this exists for.

| Version | Date | Theme |
|---|---|---|
| [v1.3.3](./v1.3.3/) | 2026-09-29 | Harbour — customer page pruned to a glance and rows |
| [v1.3.1](./v1.3.1/) | 2026-09-29 | Harbour — dark-mode background fixed |
| [v1.3.0](./v1.3.0/) | 2026-09-29 | Harbour |
