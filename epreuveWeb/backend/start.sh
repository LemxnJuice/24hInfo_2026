#!/bin/sh
set -euo pipefail

# generate prisma client (no-op if already generated)
npx prisma generate || true

# push schema to database (retry until available)
# We'll attempt multiple times to allow db container to be ready
for i in 1 2 3 4 5; do
  echo "Attempt $i to push prisma schema"
  if npx prisma db push; then
    echo "Prisma db push succeeded"
    break
  fi
  echo "Prisma db push failed, sleeping 3s"
  sleep 3
done

# start the server using ts-node to avoid relying on a compiled dist/
echo "Starting server with ts-node"
npx ts-node src/index.ts
