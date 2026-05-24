#!/usr/bin/env bash
# Smart deploy: pull latest from GitHub and rebuild ONLY when there are changes.
# Designed for a 国内 server — uses a GitHub mirror for reliable fetches and is
# safe to run from cron every few minutes (no-ops when already up to date).
#
# Usage:
#   bash scripts/deploy.sh            # check & deploy if changed
#   bash scripts/deploy.sh --force    # rebuild regardless
#
# Cron (every 5 min), logs to deploy.log:
#   */5 * * * * cd /home/ubuntu/Projects/DailySelfUpdate && bash scripts/deploy.sh >> deploy.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_DIR="$(pwd)"
BRANCH="main"
COMPOSE="docker-compose.prod.yml"
# GitHub mirror for fetch (国内直连 github 不稳)。Set MIRROR= to disable.
MIRROR="${MIRROR:-https://ghfast.top/}"
FORCE="${1:-}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# Resolve docker compose command (plugin vs standalone)
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  log "ERROR: docker compose not found"; exit 1
fi

# Fetch latest refs via mirror (fall back to origin if mirror fails).
ORIGIN_URL="$(git remote get-url origin)"
# Strip any existing mirror prefix to get the canonical github url.
CANON_URL="$(printf '%s' "$ORIGIN_URL" | sed -E 's#^https://[^/]*/(https://github.com/)#\1#')"
FETCH_URL="${MIRROR}${CANON_URL}"

log "Fetching $BRANCH ..."
if ! git fetch -q "$FETCH_URL" "$BRANCH" 2>/dev/null; then
  log "Mirror fetch failed, trying origin directly ..."
  git fetch -q origin "$BRANCH" || { log "ERROR: fetch failed"; exit 1; }
  REMOTE_REF="origin/$BRANCH"
else
  REMOTE_REF="FETCH_HEAD"
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "$REMOTE_REF")

if [ "$LOCAL" = "$REMOTE" ] && [ "$FORCE" != "--force" ]; then
  log "Already up to date ($(git rev-parse --short HEAD)). Nothing to do."
  exit 0
fi

log "Update found: $(git rev-parse --short HEAD) -> $(git rev-parse --short "$REMOTE_REF")"
git reset --hard "$REMOTE_REF"
log "Code updated to $(git rev-parse --short HEAD)"

log "Rebuilding & restarting containers ..."
$DC -f "$COMPOSE" --env-file .env up -d --build

log "Deploy complete. Container status:"
$DC -f "$COMPOSE" ps
log "Done."
