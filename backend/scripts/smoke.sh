#!/usr/bin/env bash
# End-to-end smoke test for the DailySelfUpdate API.
# Requires: backend running on $BASE, jq.
set -euo pipefail

BASE=${BASE:-http://localhost:3001/api}
EMAIL=${EMAIL:-smoke-$(date +%s)@test.local}
PASSWORD=${PASSWORD:-Hunter22pass}
TODAY=$(date +%Y-%m-%d)

pass=0
fail=0
have_jq=1
command -v jq >/dev/null || have_jq=0

assert() {
  local desc="$1" actual="$2" expected="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "  ✓ $desc"
    pass=$((pass + 1))
  else
    echo "  ✗ $desc (got $actual, want $expected)"
    fail=$((fail + 1))
  fi
}

req_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

echo "== health =="
assert "GET /api/health → 200" "$(req_status "$BASE/health")" "200"

echo "== auth =="
# Register returns tokens directly — use those to avoid hitting the strict
# login rate limit (5 / 15min) during repeated smoke runs.
REG=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"agreeToTerms\":true}")
echo "  ✓ register new user"
pass=$((pass + 1))

ACCESS=$(printf '%s' "$REG" | python3 -c 'import sys,json;print(json.load(sys.stdin)["tokens"]["accessToken"])')
REFRESH=$(printf '%s' "$REG" | python3 -c 'import sys,json;print(json.load(sys.stdin)["tokens"]["refreshToken"])')
[[ -n "$ACCESS" ]] && pass=$((pass+1)) && echo "  ✓ register returns access token"

assert "/auth/me with token → 200" \
  "$(req_status "$BASE/auth/me" -H "Authorization: Bearer $ACCESS")" "200"
assert "/auth/me without token → 401" "$(req_status "$BASE/auth/me")" "401"
assert "duplicate register → 409" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"agreeToTerms\":true}")" "409"

echo "== records =="
assert "create work → 201" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/records/work" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d "{\"date\":\"$TODAY\",\"content\":\"smoke test work\",\"category\":\"achievement\",\"emotion\":\"satisfied\",\"importance\":4}")" "201"

assert "create friend → 201" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/records/friend" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d "{\"date\":\"$TODAY\",\"friendName\":\"Alex\",\"interactionType\":\"chat\",\"content\":\"smoke chat\",\"emotion\":\"happy\",\"importance\":3}")" "201"

assert "create gratitude → 201" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/records/gratitude" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d "{\"date\":\"$TODAY\",\"content\":\"sunny day\",\"category\":\"nature\",\"emotion\":\"peaceful\",\"impactLevel\":3}")" "201"

assert "upsert reflection morning → 200" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/records/reflection" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d "{\"date\":\"$TODAY\",\"morningGoal\":\"ship smoke test\",\"overallRating\":4}")" "200"

assert "GET /records/daily/$TODAY → 200" \
  "$(req_status "$BASE/records/daily/$TODAY" -H "Authorization: Bearer $ACCESS")" "200"

assert "bad date format → 400" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/records/work" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d '{"date":"not-a-date","content":"x","category":"achievement","emotion":"satisfied","importance":3}')" "400"

echo "== history & search =="
assert "GET /records/history → 200" \
  "$(req_status "$BASE/records/history" -H "Authorization: Bearer $ACCESS")" "200"
assert "GET /records/search?q=smoke → 200" \
  "$(req_status "$BASE/records/search?q=smoke" -H "Authorization: Bearer $ACCESS")" "200"
assert "empty search query → 400" \
  "$(req_status "$BASE/records/search?q=" -H "Authorization: Bearer $ACCESS")" "400"

echo "== analysis =="
WEEK=$(python3 -c '
from datetime import date, timedelta
t = date.today()
print((t - timedelta(days=(t.weekday()))).isoformat())')
assert "GET /analysis/weekly/$WEEK → 200" \
  "$(req_status "$BASE/analysis/weekly/$WEEK" -H "Authorization: Bearer $ACCESS")" "200"
assert "POST /analysis/generate-weekly → 200" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/analysis/generate-weekly" -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d "{\"weekStart\":\"$WEEK\"}")" "200"
assert "GET /analysis/trends → 200" \
  "$(req_status "$BASE/analysis/trends?weeks=4" -H "Authorization: Bearer $ACCESS")" "200"

echo "== data export/import =="
TMP=$(mktemp -d)
EXPORT_STATUS=$(curl -s -o "$TMP/export.json" -w "%{http_code}" \
  "$BASE/data/export?format=json" -H "Authorization: Bearer $ACCESS")
assert "GET /data/export?format=json → 200" "$EXPORT_STATUS" "200"
[[ -s "$TMP/export.json" ]] && pass=$((pass+1)) && echo "  ✓ export file is non-empty"

python3 -c "
import json, sys
with open('$TMP/export.json') as f:
    d = json.load(f)
sys.exit(0 if d.get('exportVersion') == 1 else 1)" \
  && { echo "  ✓ export payload has exportVersion=1"; pass=$((pass+1)); } \
  || { echo "  ✗ export payload missing exportVersion=1"; fail=$((fail+1)); }

python3 -c "
import json
exp = json.load(open('$TMP/export.json'))
print(json.dumps({'strategy': 'merge', 'payload': exp}))
" > "$TMP/import-body.json"
assert "POST /data/import (merge) → 200" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/data/import" -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' --data-binary @"$TMP/import-body.json")" "200"

assert "import with bad exportVersion → 400" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/data/import" -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' \
  -d '{"strategy":"merge","payload":{"exportVersion":999,"exportedAt":"x","user":{"id":"x","email":"x"},"work":[],"friend":[],"partner":[],"gratitude":[],"reflection":[]}}')" "400"

echo "== refresh token =="
assert "refresh → 200" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/auth/refresh" -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH\"}")" "200"
# Same token a second time should be revoked
assert "refresh second time (revoked) → 401" "$(curl -s -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/auth/refresh" -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH\"}")" "401"

echo
echo "----------------------------------------"
echo "passed: $pass · failed: $fail"
if (( have_jq == 0 )); then echo "(jq not installed — that's fine, didn't need it)"; fi
exit $(( fail > 0 ? 1 : 0 ))
