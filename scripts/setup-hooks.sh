#!/usr/bin/env bash
# Enable the repo's git hooks (secret guard). Run once after cloning:
#   bash scripts/setup-hooks.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true
echo "✓ git hooks 已启用 (core.hooksPath = .githooks)"
echo "  pre-commit 会在每次提交前拦截 .env 和疑似密钥。"
