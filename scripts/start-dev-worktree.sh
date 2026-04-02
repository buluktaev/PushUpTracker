#!/usr/bin/env bash

set -euo pipefail

CWD="$(pwd)"
COMMON_GIT_DIR="$(git rev-parse --git-common-dir)"
REPO_ROOT="$(dirname "${COMMON_GIT_DIR}")"
PORT="${PORT:-3000}"

if [[ ! -f "${CWD}/.env" && -f "${REPO_ROOT}/.env.test" ]]; then
  cp "${REPO_ROOT}/.env.test" "${CWD}/.env"
  echo "[dev] copied ${REPO_ROOT}/.env.test -> ${CWD}/.env"
fi

if [[ ! -f "${CWD}/.env.test" && -f "${REPO_ROOT}/.env.test" ]]; then
  cp "${REPO_ROOT}/.env.test" "${CWD}/.env.test"
  echo "[dev] copied ${REPO_ROOT}/.env.test -> ${CWD}/.env.test"
fi

WORKTREE_PIDS="$(ps aux | grep "${CWD}" | grep -E "next dev|next-server" | grep -v grep | awk '{print $2}' || true)"
if [[ -n "${WORKTREE_PIDS}" ]]; then
  echo "[dev] stopping stale worktree next processes: ${WORKTREE_PIDS}"
  kill ${WORKTREE_PIDS} || true
  sleep 1
fi

PORT_PID="$(lsof -tiTCP:${PORT} -sTCP:LISTEN || true)"
if [[ -n "${PORT_PID}" ]]; then
  PORT_CMD="$(ps -p "${PORT_PID}" -o command= || true)"
  if [[ "${PORT_CMD}" == *"${CWD}"* || "${PORT_CMD}" == *"next-server"* || "${PORT_CMD}" == *"next dev"* ]]; then
    echo "[dev] freeing port ${PORT} from stale next process ${PORT_PID}"
    kill "${PORT_PID}" || true
    sleep 1
  else
    echo "[dev] port ${PORT} is busy with unrelated process: ${PORT_CMD}" >&2
    exit 1
  fi
fi

rm -rf "${CWD}/.next"
echo "[dev] cleared ${CWD}/.next"
echo "[dev] starting foreground Next dev on port ${PORT}"

exec npm run dev:next -- --port "${PORT}"
