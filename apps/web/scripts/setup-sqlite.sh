#!/usr/bin/env bash
# CAIMS - SQLite local development setup script
# Run this script once to initialise a local SQLite database (no Docker required).
#
# Usage:
#   cd apps/web
#   bash scripts/setup-sqlite.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$WEB_DIR"

echo "==> CAIMS SQLite setup"

# ── 1. Write / update the .env file ────────────────────────────────────────
ENV_FILE="$WEB_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$WEB_DIR/../../.env.example" ]; then
    cp "$WEB_DIR/../../.env.example" "$ENV_FILE"
    echo "    Created .env from .env.example"
  else
    touch "$ENV_FILE"
    echo "    Created empty .env"
  fi
fi

# Set CAIMS_DB_PROVIDER=sqlite (add if missing, update if present)
if grep -q "^CAIMS_DB_PROVIDER=" "$ENV_FILE"; then
  sed -i.bak 's|^CAIMS_DB_PROVIDER=.*|CAIMS_DB_PROVIDER=sqlite|' "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
  echo "" >> "$ENV_FILE"
  echo "CAIMS_DB_PROVIDER=sqlite" >> "$ENV_FILE"
fi

# Set DATABASE_URL to a local SQLite file (add if missing, update if present)
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
  sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL=file:./prisma/dev.db|' "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
  echo "DATABASE_URL=file:./prisma/dev.db" >> "$ENV_FILE"
fi

echo "    .env updated: CAIMS_DB_PROVIDER=sqlite, DATABASE_URL=file:./prisma/dev.db"

# ── 2. Install dependencies (if node_modules is missing) ───────────────────
if [ ! -d "$WEB_DIR/node_modules" ]; then
  echo "==> Installing npm dependencies …"
  npm install
fi

# ── 3. Generate Prisma client from the SQLite schema ───────────────────────
echo "==> Generating Prisma client (SQLite schema) …"
CAIMS_DB_PROVIDER=sqlite npx prisma generate

# ── 4. Push the schema to the SQLite database (creates the file if absent) ─
echo "==> Applying schema to SQLite database …"
CAIMS_DB_PROVIDER=sqlite DATABASE_URL="file:./prisma/dev.db" npx prisma db push --skip-generate

echo ""
echo "✅  SQLite database ready at apps/web/prisma/dev.db"
echo ""
echo "Start the development server with:"
echo "  cd apps/web && npm run dev"
