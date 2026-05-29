#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Usage: SSH_USER=root SSH_HOST=1.2.3.4 SSH_PORT=22 ./deploy/update_remote.sh [--rebuild] [--seed]
# This script rsyncs the repository to the remote server and executes compose update there.

SSH_USER=${SSH_USER:-root}
SSH_HOST=${SSH_HOST:-}
SSH_PORT=${SSH_PORT:-22}
REMOTE_DIR=${REMOTE_DIR:-/root/epreuveWeb}
REBUILD=false
DO_SEED=false

usage(){
  cat <<EOF
Usage: SSH_USER=root SSH_HOST=1.2.3.4 SSH_PORT=22 $0 [options]

Options:
  -r, --rebuild   Rebuild Docker images on the remote with --no-cache
  -s, --seed      Run seed on the remote after migrations
  -h, --help      Show this message

Requires: rsync + ssh access to the remote host.
Example:
  SSH_USER=root SSH_HOST=5.135.90.148 ./deploy/$(basename "$0") --rebuild --seed
EOF
}

# parse args
while [[ ${#} -gt 0 ]]; do
  case "$1" in
    -r|--rebuild) REBUILD=true; shift ;;
    -s|--seed) DO_SEED=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

if [ -z "$SSH_HOST" ]; then
  echo "ERROR: SSH_HOST environment variable must be set. Example: SSH_HOST=5.135.90.148" >&2
  exit 1
fi

# prepare rsync exclude
EXCLUDES=( --exclude .git --exclude node_modules --exclude dist --exclude .env --exclude .DS_Store )

# perform rsync
echo "==> Syncing files to ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR} (this may ask for password)"
rsync -avz --delete "${EXCLUDES[@]}" -e "ssh -p ${SSH_PORT}" ./ ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}

# remote commands
SSH_CMD=(ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}")

echo "==> Running remote update commands"
${SSH_CMD[@]} bash -lc "'
set -euo pipefail
cd ${REMOTE_DIR}
# ensure docker exists
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker not found on remote; please install docker first.' >&2
  exit 1
fi
# detect docker compose
if docker compose version >/dev/null 2>&1; then
  dc='docker compose'
else
  dc='docker-compose'
fi
# pull external images
$dc pull --ignore-pull-failures || true
if [ \"${REBUILD}\" = \"true\" ]; then
  $dc build --no-cache || true
else
  $dc build || true
fi
$dc up -d || true
# prisma
$dc run --rm backend npx prisma generate || true
$dc run --rm backend npx prisma db push || true
if [ \"${DO_SEED}\" = \"true\" ]; then
  if $dc run --rm backend npx ts-node prisma/seed.ts >/dev/null 2>&1; then
    $dc run --rm backend npx ts-node prisma/seed.ts || true
  else
    $dc run --rm backend node dist/prisma/seed.js || true
  fi
fi
'"

echo "==> Remote update finished. Tail logs on remote with: ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} 'docker compose logs -f'"

exit 0
