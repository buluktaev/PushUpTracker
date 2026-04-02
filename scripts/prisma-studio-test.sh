#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PORT="${PRISMA_STUDIO_PORT:-5555}"

cd "${REPO_ROOT}"

if [[ ! -f .env.test ]]; then
  echo "Missing .env.test in ${REPO_ROOT}" >&2
  exit 1
fi

set -a
source .env.test
set +a

export NODE_TLS_REJECT_UNAUTHORIZED=0

exec npx prisma studio --port "${PORT}"
