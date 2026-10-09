#!/usr/bin/env bash
# Connect TurnUp to ServiceM8, end to end, from a Mac with the Vercel CLI.
#
#   SM8_API_KEY=<the key from ServiceM8 → Settings → API Keys> bash scripts/connect-servicem8.sh
#
# What it does, in order, and says so as it goes:
#   1. stores SM8_API_KEY in Vercel (production)
#   2. redeploys production (the build creates any new tables)
#   3. tells you to press "Start listening" on the dashboard
#
# Or skip the script: add SM8_API_KEY by hand in Vercel → Environment Variables,
# Redeploy, press Start listening. Same result.
set -euo pipefail
PROJECT="turnup"
SCOPE="willgazes-projects"
die() { echo "  ✗ $*" >&2; exit 1; }
[ -f package.json ] || die "Run this from the root of the tradestatus repo."
command -v vercel >/dev/null || die "Install the Vercel CLI first: npm i -g vercel"
[ -n "${SM8_API_KEY:-}" ] || die "Set SM8_API_KEY=<key> in front of the command. ServiceM8 → Settings → API Keys."

echo "→ checking the key against ServiceM8"
code=$(curl -s -o /dev/null -w '%{http_code}' -H "X-API-Key: $SM8_API_KEY" "https://api.servicem8.com/api_1.0/job.json?%24top=1")
[ "$code" = "200" ] || die "ServiceM8 answered $code to that key. Check it and try again."

echo "→ storing SM8_API_KEY in Vercel (production)"
vercel env rm SM8_API_KEY production --yes --scope "$SCOPE" >/dev/null 2>&1 || true
printf '%s' "$SM8_API_KEY" | vercel env add SM8_API_KEY production --scope "$SCOPE" \
  || die "Vercel refused to store the key. Easier: add SM8_API_KEY by hand at https://vercel.com/willgazes-projects/turnup/settings/environment-variables then Redeploy."

# Tables are created by the build itself now (package.json "build"), so there
# is nothing to migrate here.

echo "→ redeploying production"
vercel --prod --scope "$SCOPE" >/dev/null
echo
echo "  ✓ Connected. Open https://www.getturnup.com/dashboard → ServiceM8 → Start listening."
echo "    Then add a job by its ServiceM8 number and watch it follow the job."
