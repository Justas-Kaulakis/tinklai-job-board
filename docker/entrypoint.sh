#!/bin/sh
set -euo pipefail

export PRISMA_CONFIG_PATH="${PRISMA_CONFIG_PATH:-./prisma.config.ts}"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy

  if [ "${AUTO_DB_SEED:-true}" = "true" ]; then
    echo "Seeding database..."
    npx prisma db seed
  else
    echo "AUTO_DB_SEED disabled, skipping seeding."
  fi
else
  echo "Warning: DATABASE_URL is not set. Skipping migrations and seed."
fi

mkdir -p "${UPLOAD_ROOT:-data/uploads}"

echo "Starting Next.js in production mode..."
exec "$@"
