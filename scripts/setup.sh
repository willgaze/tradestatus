#!/usr/bin/env bash
#
# One-shot setup for My Trade Status.
#
# Creates the Neon database, creates the Vercel project, sets every
# environment variable, deploys, and creates the two tables. You log in to
# Neon and Vercel in the browser when prompted — no API tokens to copy,
# paste or revoke afterwards.
#
#   bash scripts/setup.sh
#
set -euo pipefail

PROJECT="tradestatus"
TRADE_NAME="${TRADE_NAME:-Rosebourne Plumbing}"
TRADE_PHONE="${TRADE_PHONE:-01264 502027}"
TRADE_PHONE_TEL="${TRADE_PHONE_TEL:-01264502027}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
die() { printf '\n\033[1;31mStopped:\033[0m %s\n' "$1" >&2; exit 1; }

command -v node >/dev/null || die "Node is not installed. Install it, then run this again."
[ -f package.json ] || die "Run this from the root of the tradestatus repo."

# --- secrets -----------------------------------------------------------------
# Generated here, on your machine, so they never sit in git or in a chat log.
say "Generating secrets"
JWT_SECRET="$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)"
OPERATOR_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=lIO01' | head -c 14)"
echo "    Your dashboard password will be shown at the end. Write it down then."

# --- neon --------------------------------------------------------------------
say "Neon — a browser window will open for you to sign in"
npx --yes neonctl@latest auth

# Reuse a project of this name if one exists. Without this, a second run
# after any later failure silently creates a second database and leaves the
# first one orphaned and paid for.
say "Looking for an existing Neon project called '$PROJECT'"
FIND_BY_NAME='let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  let j; try { j = JSON.parse(s) } catch { return }
  const found = [];
  (function walk(n){ if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.name === process.argv[1] && n.id) found.push(n.id);
    Object.values(n).forEach(walk) })(j);
  if (found[0]) console.log(found[0]) })'
NEON_PROJECT_ID="$(npx --yes neonctl@latest projects list --output json 2>/dev/null | node -e "$FIND_BY_NAME" "$PROJECT" || true)"

if [ -n "$NEON_PROJECT_ID" ]; then
  echo "    reusing $NEON_PROJECT_ID"
else
  say "Creating the Neon project '$PROJECT'"
  NEON_PROJECT_ID="$(npx --yes neonctl@latest projects create --name "$PROJECT" --output json \
    | node -e "$FIND_BY_NAME" "$PROJECT" || true)"
  [ -n "$NEON_PROJECT_ID" ] || die "Could not read the new Neon project id."
  echo "    project id: $NEON_PROJECT_ID"
fi

say "Fetching the pooled connection string"
# Pooled, because serverless functions open a connection per invocation and a
# direct string runs the database out of them.
#
# neonctl prints this one as a bare string even with --output json, which is
# why an earlier version of this script died on JSON.parse. Pull the URL out
# of whatever comes back rather than assuming a shape.
DATABASE_URL="$(npx --yes neonctl@latest connection-string \
  --project-id "$NEON_PROJECT_ID" --pooled 2>/dev/null \
  | tr -d '\r' | grep -oE 'postgres(ql)?://[^[:space:]"]+' | tail -n 1)"
case "$DATABASE_URL" in postgres*) ;; *) die "Did not get a Postgres connection string from Neon." ;; esac
echo "    got it (pooled)"

# --- tables ------------------------------------------------------------------
say "Creating the two tables"
npm install --no-audit --no-fund
DATABASE_URL="$DATABASE_URL" npx prisma db push

# --- vercel ------------------------------------------------------------------
say "Vercel — a browser window will open for you to sign in"
npx --yes vercel@latest login

say "Linking the Vercel project"
npx --yes vercel@latest link --yes --project "$PROJECT"

say "Setting environment variables"
set_env() {
  local key="$1" value="$2"
  for target in production preview development; do
    # --force overwrites on a re-run rather than erroring on a duplicate.
    printf '%s' "$value" | npx --yes vercel@latest env add "$key" "$target" --force >/dev/null 2>&1 \
      || printf '%s' "$value" | npx --yes vercel@latest env add "$key" "$target" >/dev/null
  done
  echo "    $key"
}
set_env DATABASE_URL                "$DATABASE_URL"
set_env JWT_SECRET                  "$JWT_SECRET"
set_env OPERATOR_PASSWORD           "$OPERATOR_PASSWORD"
set_env NEXT_PUBLIC_TRADE_NAME      "$TRADE_NAME"
set_env NEXT_PUBLIC_TRADE_PHONE     "$TRADE_PHONE"
set_env NEXT_PUBLIC_TRADE_PHONE_TEL "$TRADE_PHONE_TEL"

say "Deploying to production"
DEPLOY_URL="$(npx --yes vercel@latest deploy --prod --yes | tail -n 1)"

# --- done --------------------------------------------------------------------
cat <<DONE

────────────────────────────────────────────────────────────
  My Trade Status is live

  Dashboard   ${DEPLOY_URL}/dashboard
  Password    ${OPERATOR_PASSWORD}

  Write that password down now — it is not stored anywhere
  you can read it back. To change it later, edit
  OPERATOR_PASSWORD in the Vercel project settings.

  Create a job in the dashboard, copy its customer link,
  and open it on your phone.
────────────────────────────────────────────────────────────
DONE
