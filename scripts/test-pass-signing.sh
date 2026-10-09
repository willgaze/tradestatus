#!/usr/bin/env bash
#
# Proves a signed .pkpass comes out of the real route, without an Apple account.
#
#   bash scripts/local-db.sh && npm run build
#   bash scripts/test-pass-signing.sh
#
# It makes a stand-in chain (a fake "WWDR" CA and a pass certificate signed by
# it, with the same subject shape Apple uses), runs `apple-wallet.sh finish`
# against it, starts `next start` with those settings, downloads the pass for
# the seeded job, and verifies: HTTP 200 with the pkpass type, icons present,
# manifest hashes right, the CMS signature valid against the stand-in CA, and
# every top-level field (pass type, serial, colours, web service) in pass.json.
# The last one is the check that mattered: the first version of the signing
# code produced a pass with only its fields in it.
#
# Leaves the real apple/ folder alone: it works in a temp copy of the repo's
# apple/ directory and restores it.
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
F="$(mktemp -d)"
OUT="$(mktemp -d)"
PORT=${PORT:-3721}
trap 'pkill -f "next start -p $PORT" >/dev/null 2>&1 || true; [ -d "$R/apple.bak" ] && rm -rf "$R/apple" && mv "$R/apple.bak" "$R/apple"; rm -rf "$F" "$OUT"' EXIT

# stand-in chain
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$F/wwdr.key" -out "$F/wwdr.pem" -days 2 -subj "/CN=Stand-in WWDR G4/O=Stand-in/C=US" 2>/dev/null
PW=$(openssl rand -hex 8); printf '%s' "$PW" > "$F/key.password"
openssl genrsa -aes256 -passout "pass:$PW" -traditional -out "$F/pass.key" 2048 2>/dev/null
openssl req -new -key "$F/pass.key" -passin "pass:$PW" -out "$F/pass.csr" -subj "/UID=pass.com.getturnup.job/CN=Pass Type ID: pass.com.getturnup.job/OU=ABCDE12345/O=TurnUp/C=GB" 2>/dev/null
openssl x509 -req -in "$F/pass.csr" -CA "$F/wwdr.pem" -CAkey "$F/wwdr.key" -CAcreateserial -out "$F/pass.pem" -days 2 2>/dev/null
openssl x509 -in "$F/pass.pem" -outform DER -out "$F/pass.cer"

# run the real finish step against it
[ -d "$R/apple" ] && mv "$R/apple" "$R/apple.bak"
mkdir -p "$R/apple"; cp "$F/pass.key" "$F/key.password" "$R/apple/"
bash "$R/scripts/apple-wallet.sh" finish "$F/pass.cer" >/dev/null
set -a; source "$R/apple/turnup.env"; set +a
export PASSKIT_WWDR_PEM="$(base64 < "$F/wwdr.pem" | tr -d '\n')"   # the chain the stand-in cert was signed by, not Apple's
export DATABASE_URL="postgresql://postgres@localhost:5433/tradestatus"
export JWT_SECRET="${JWT_SECRET:-localtestsecret-localtestsecret-32}"
cd "$R"; (npx next start -p $PORT > "$OUT/next.log" 2>&1 &)
for i in $(seq 1 40); do curl -sf -o /dev/null http://localhost:$PORT/ && break; sleep 1; done
echo "--- preview"; curl -s "http://localhost:$PORT/api/passes/K7M4PQRT?preview=1" | python3 -c "import sys,json; d=json.load(sys.stdin); print('configured', d['configured'], 'missing', d['missing']); p=d['pass']; print(p['passTypeIdentifier'], p['teamIdentifier'], p.get('logoText'), p['generic']['primaryFields'])"
echo "--- pass"; code=$(curl -s -o "$OUT/card.pkpass" -w "%{http_code} %{content_type}" "http://localhost:$PORT/api/passes/K7M4PQRT"); echo "$code"; ls -la "$OUT/card.pkpass"
cd "$OUT" && unzip -o -q card.pkpass && ls && echo "--- manifest" && cat manifest.json && echo && \
echo "--- signature verify (against stand-in WWDR)" && openssl smime -verify -in signature -inform DER -content manifest.json -CAfile "$F/wwdr.pem" -purpose any -out /dev/null && \
echo "--- signer" && openssl pkcs7 -inform DER -in signature -print_certs -noout | grep subject && \
echo "--- manifest hashes match files" && python3 - <<'PY'
import json,hashlib,os
m=json.load(open('manifest.json')); bad=[f for f,h in m.items() if hashlib.sha1(open(f,'rb').read()).hexdigest()!=h]
print('ok' if not bad else bad, len(m), 'files')
d=json.load(open('pass.json')); print({k:v for k,v in d.items() if k!='generic'})
PY
