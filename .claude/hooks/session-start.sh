#!/bin/bash
set -euo pipefail

# Only run in remote/cloud environments (Claude Code on the web)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$PROJECT_DIR"

echo "==> Installing workspace dependencies..."
pnpm install

echo "==> Environment ready."
