#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAIL_TARGETS=(
  app
  components
  lib
  scripts
  middleware.ts
  render.yaml
  render.staging.yaml
  next.config.mjs
  Dockerfile
  package.json
  .env.example
)

fail_patterns=(
  'tunnelmole\.net'
  'pushup-tracker-auth-staging\.onrender\.com'
)

warn_patterns=(
  'LEGACY_PATH_ICONS'
  'TODO'
  'FIXME'
)

echo "== forbidden runtime markers =="
for pattern in "${fail_patterns[@]}"; do
  if rg -n "$pattern" "${FAIL_TARGETS[@]}"; then
    echo
    echo "Legacy audit failed: forbidden marker '$pattern' leaked into runtime/config files."
    exit 1
  fi
done
echo "none"

echo
echo "== warnings =="
warning_found=0
for pattern in "${warn_patterns[@]}"; do
  if rg -n "$pattern" "${FAIL_TARGETS[@]}"; then
    warning_found=1
  fi
done

if [[ "$warning_found" -eq 0 ]]; then
  echo "none"
fi
