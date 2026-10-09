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
| [v1.17.0](./v1.17.0/) | 2026-10-09 | Clay — the plan grew up: pricing, the wallet card, a share link |
| [v1.16.0](./v1.16.0/) | 2026-10-09 | Slate — the business plan lives at /plan |
| [v1.9.0](./v1.9.0/) | 2026-09-30 | Teal — a window is something you agree, not announce |
| [v1.8.0](./v1.8.0/) | 2026-09-30 | Indigo — drop a pin with one tap, from either end |
| [v1.7.0](./v1.7.0/) | 2026-09-30 | Clay — the customer's own answers came off the public page |
| [v1.6.0](./v1.6.0/) | 2026-09-30 | Slate — your phone buzzes when they set off |
| [v1.5.0](./v1.5.0/) | 2026-09-29 | Moss — find the door: Maps, ///what3words and pin links, house and door photos, logo on the pass, dashboard onto the glass |
| [v1.4.0](./v1.4.0/) | 2026-09-29 | Moss — redrawn to the iOS look, every emoji replaced with a drawn icon |
| [v1.3.3](./v1.3.3/) | 2026-09-29 | Harbour — customer page pruned to a glance and rows |
| [v1.3.1](./v1.3.1/) | 2026-09-29 | Harbour — dark-mode background fixed |
| [v1.3.0](./v1.3.0/) | 2026-09-29 | Harbour |
