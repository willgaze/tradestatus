#!/usr/bin/env bash
#
# Turn on push notifications. One command, and it touches nothing else.
#
#   bash scripts/enable-push.sh
#
# Generates the VAPID pair that signs push notifications, puts it in Vercel,
# and redeploys. The public half ships to the browser; the private half goes
# straight from this machine to Vercel and is never printed, so it cannot end
# up in a terminal log, a screenshot or a chat transcript. That is the whole
# reason this is a script you run rather than something an assistant does for
# you — and the reason it is a script rather than six steps in a web UI.
#
# RE-RUNNING IS SAFE. An existing pair is kept. Generating a new one would
# silently invalidate every subscription already out there: every customer who
# had tapped "tell me" would stop being told, with nothing anywhere saying why.
# Pass --rotate only if you actually mean that.
#
set -euo pipefail

PROJECT="turnup"   # renamed on Vercel 2 Oct 2026; live at www.getturnup.com since 8 Oct
VERCEL_SCOPE="${VERCEL_SCOPE:-willgazes-projects}"
SCOPE_ARGS=(--scope "$VERCEL_SCOPE")
SUBJECT="mailto:${TRADE_EMAIL:-hello@mytradestatus.app}"
ROTATE=""
[ "${1:-}" = "--rotate" ] && ROTATE=1

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
die() { printf '\n\033[1;31mStopped:\033[0m %s\n' "$1" >&2; exit 1; }

command -v node >/dev/null || die "Node is not installed. Install it, then run this again."
[ -f package.json ] || die "Run this from the root of the tradestatus repo."

say "Vercel — a browser window will open if you are not already signed in"
npx --yes vercel@latest whoami "${SCOPE_ARGS[@]}" >/dev/null 2>&1 || npx --yes vercel@latest login
npx --yes vercel@latest link --yes --project "$PROJECT" "${SCOPE_ARGS[@]}" >/dev/null

# --- is there already a pair? ------------------------------------------------
say "Checking whether push is already set up"
EXISTING="$(npx --yes vercel@latest env pull /dev/stdout --environment=production "${SCOPE_ARGS[@]}" 2>/dev/null \
  | grep -c '^VAPID_PRIVATE_KEY=' || true)"

if [ "${EXISTING:-0}" != "0" ] && [ -z "$ROTATE" ]; then
  cat <<'ALREADY'

    Push is already configured. Nothing to do.

    To replace the keys, run:  bash scripts/enable-push.sh --rotate
    Be aware that rotating silently stops every existing subscription.

ALREADY
  exit 0
fi

[ -n "$ROTATE" ] && echo "    --rotate given: replacing the pair, existing subscriptions will stop working."

# --- generate ----------------------------------------------------------------
say "Generating the VAPID pair"
VAPID_JSON="$(npx --yes web-push@3 generate-vapid-keys --json)"
PUBLIC_KEY="$(node -e "process.stdout.write(JSON.parse(process.argv[1]).publicKey)" "$VAPID_JSON")"
PRIVATE_KEY="$(node -e "process.stdout.write(JSON.parse(process.argv[1]).privateKey)" "$VAPID_JSON")"
[ -n "$PUBLIC_KEY" ] && [ -n "$PRIVATE_KEY" ] || die "web-push did not return a key pair."
echo "    done (the private key is not printed, by design)"

# --- set ---------------------------------------------------------------------
say "Setting the environment variables"
set_env() {
  local key="$1" value="$2"
  for target in production preview development; do
    printf '%s' "$value" | npx --yes vercel@latest env add "$key" "$target" "${SCOPE_ARGS[@]}" --force >/dev/null 2>&1 \
      || printf '%s' "$value" | npx --yes vercel@latest env add "$key" "$target" "${SCOPE_ARGS[@]}" >/dev/null
  done
  echo "    $key"
}
set_env NEXT_PUBLIC_VAPID_PUBLIC_KEY "$PUBLIC_KEY"
set_env VAPID_PRIVATE_KEY            "$PRIVATE_KEY"
set_env VAPID_SUBJECT                "$SUBJECT"

# --- the table ---------------------------------------------------------------
# PushSubscription is a NEW TABLE, which is the migration case that fails soft:
# without it the feature stays dark and nothing else notices. It should already
# be there, but "should" is not a check.
say "Making sure the PushSubscription table exists"
DB="$(npx --yes vercel@latest env pull /dev/stdout --environment=production "${SCOPE_ARGS[@]}" 2>/dev/null \
  | grep '^DATABASE_URL=' | head -n 1 | cut -d= -f2- | tr -d '"')"
if [ -n "$DB" ]; then
  DATABASE_URL="$DB" npx prisma db push --skip-generate
else
  echo "    Could not read DATABASE_URL — skipping. If push stays quiet, run:"
  echo "      DATABASE_URL='<the Neon pooled string>' npx prisma db push"
fi

# --- deploy ------------------------------------------------------------------
# NEXT_PUBLIC_* is inlined at build time, so the key only reaches the browser
# on the next build. Setting the variable alone changes nothing.
say "Redeploying so the public key reaches the browser"
npx --yes vercel@latest deploy --prod --yes "${SCOPE_ARGS[@]}" | tail -n 1

cat <<'DONE'

────────────────────────────────────────────────────────────
  Push is on.

  "Tell me when they set off" is back on the customer's page.

  TO TEST IT ON AN IPHONE, in this order — it will not work
  in a Safari tab, and that is Apple's rule, not a bug:

    1. Open a tracking link in Safari
    2. Share -> Add to Home Screen
    3. Open it from the HOME SCREEN icon
    4. Tap "Tell me when they set off", then Allow
    5. Move the job on in the dashboard

  Android works from an ordinary tab.
────────────────────────────────────────────────────────────
DONE
