#!/bin/sh
set -e

echo "🚀 LeadKit Docker Entrypoint"
echo "─────────────────────────────"

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete"
echo "🌐 Starting Next.js server..."
echo "─────────────────────────────"

# Start the Next.js standalone server
exec node server.js
