#!/usr/bin/env bash
# Usage: SSH_USER=root SSH_HOST=5.135.90.148 ./deploy.sh
# If you want to provide a password (not recommended), you can install sshpass and export SSH_PASS before running.

set -euo pipefail
SSH_USER=${SSH_USER:-root}
SSH_HOST=${SSH_HOST:-5.135.90.148}
SSH_PORT=${SSH_PORT:-22}
REMOTE_DIR=${REMOTE_DIR:-/root/epreuveWeb}

echo "Deploying to ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}"

# copy files using rsync (faster) if available
if command -v rsync >/dev/null 2>&1; then
  RSYNC_CMD=(rsync -avz --delete --exclude node_modules --exclude dist -e "ssh -p ${SSH_PORT}")
  if [ -n "${SSH_PASS:-}" ]; then
    if ! command -v sshpass >/dev/null 2>&1; then
      echo "sshpass not installed; cannot use SSH_PASS. Install sshpass or use SSH keys." >&2
      exit 1
    fi
    echo "Using sshpass for authentication"
    sshpass -p "${SSH_PASS}" "${RSYNC_CMD[@]}" ./ ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}
  else
    "${RSYNC_CMD[@]}" ./ ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}
  fi
else
  echo "rsync not available, using scp (slower)."
  if [ -n "${SSH_PASS:-}" ]; then
    if ! command -v sshpass >/dev/null 2>&1; then
      echo "sshpass not installed; cannot use SSH_PASS. Install sshpass or use SSH keys." >&2
      exit 1
    fi
    sshpass -p "${SSH_PASS}" scp -P ${SSH_PORT} -r . ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}
  else
    scp -P ${SSH_PORT} -r . ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}
  fi
fi

# Run remote setup + docker compose
SSH_CMD="ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST}"
$SSH_CMD <<EOF
set -euo pipefail
REMOTE_DIR="${REMOTE_DIR}"
mkdir -p "${REMOTE_DIR}"
# install docker if missing
if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi
# start docker
systemctl enable docker --now || true
# install docker-compose plugin if missing (on some systems)
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker compose plugin missing; attempting to install (may require additional steps)."
fi
cd "${REMOTE_DIR}"
# create .env if missing
if [ ! -f .env ]; then
  cat > .env <<EOT
DATABASE_URL=postgresql://postgres:postgres@db:5432/classifieds?schema=public
JWT_SECRET=replace_with_strong_secret
FRONTEND_URL=https://beboule-family.24h.umontp.fr
PORT=4000
EOT
  echo "Created placeholder .env at ${REMOTE_DIR}/.env — please edit JWT_SECRET before starting"
fi
# launch services
docker compose up -d --build
# wait a bit for db to be ready
sleep 6
# generate prisma client and push schema
if docker compose ps backend >/dev/null 2>&1; then
  echo "Running prisma generate and db push inside backend container..."
  docker compose run --rm backend npx prisma generate || true
  docker compose run --rm backend npx prisma db push || true
fi
EOF

echo "Deployment finished. Visit https://beboule-family.24h.umontp.fr/ once DNS/ports are configured."
