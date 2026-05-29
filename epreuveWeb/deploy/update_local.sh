#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -n, --no-pull     Skip `git pull` (don't update local git repository)
  -r, --rebuild     Rebuild Docker images with --no-cache
  -s, --seed        Run seed script after migrations
  -h, --help        Show this help

Examples:
  # quick update (git pull, build, start)
  ./deploy/$(basename "$0")

  # full rebuild and run seed
  ./deploy/$(basename "$0") --rebuild --seed

This script assumes you run it from a system with Docker and Docker Compose
installed and that you're at the repository created by the project.
EOF
}

# defaults
NOPULL=false
REBUILD=false
DO_SEED=false

# parse args
while [[ ${#} -gt 0 ]]; do
  case "$1" in
    -n|--no-pull) NOPULL=true; shift ;;
    -r|--rebuild) REBUILD=true; shift ;;
    -s|--seed) DO_SEED=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

echo "Project root: $ROOT_DIR"

# optional git pull
if [ -d .git ] && [ "$NOPULL" = false ]; then
  echo "==> Updating git repository..."
  git fetch --all --prune || true
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
  echo "Pulling branch: $BRANCH"
  git pull --ff-only origin "$BRANCH" || echo "git pull failed; continuing"
else
  echo "==> Skipping git pull"
fi

# detect docker compose command
if docker compose version >/dev/null 2>&1; then
  DC_CMD=(docker compose)
elif docker-compose version >/dev/null 2>&1; then
  DC_CMD=(docker-compose)
else
  echo "ERROR: docker compose (v2) or docker-compose not found in PATH." >&2
  exit 1
fi

# pull external images if any and build
echo "==> Pulling external images (if any)"
"${DC_CMD[@]}" pull --ignore-pull-failures || true

if [ "$REBUILD" = true ]; then
  echo "==> Rebuilding images (no-cache)"
  "${DC_CMD[@]}" build --no-cache
else
  echo "==> Building images"
  "${DC_CMD[@]}" build
fi

# start services
echo "==> Starting services"
"${DC_CMD[@]}" up -d

# generate prisma client and push schema (inside backend)
echo "==> Generating Prisma client and applying DB schema"
"${DC_CMD[@]}" run --rm backend npx prisma generate || true
"${DC_CMD[@]}" run --rm backend npx prisma db push || true

# seed (optional)
if [ "$DO_SEED" = true ]; then
  echo "==> Running seed script inside backend container"
  # try ts-node seed first, then compiled js seed
  if "${DC_CMD[@]}" run --rm backend npx ts-node prisma/seed.ts >/dev/null 2>&1; then
    "${DC_CMD[@]}" run --rm backend npx ts-node prisma/seed.ts || true
  else
    "${DC_CMD[@]}" run --rm backend node dist/prisma/seed.js || true
  fi
fi

echo "==> Update complete. To follow logs: \n  ${DC_CMD[*]} logs -f"

exit 0
