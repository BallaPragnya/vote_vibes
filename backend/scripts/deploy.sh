#!/usr/bin/env bash

# VoteVibes Server Deployment Script
# Automates environment setup, dependency installation, Prisma migrations, and PM2 process management.

set -e

echo "==================================================="
echo " VoteVibes Backend Server Deployment Started"
echo "==================================================="

# 1. Pull latest changes if running in git repo
if [ -d ".git" ]; then
  echo "--> Pulling latest changes from git repository..."
  git pull origin develop
fi

# 2. Install production dependencies
echo "--> Installing production dependencies..."
npm ci --only=production

# 3. Generate Prisma client
echo "--> Generating Prisma Client..."
npx prisma generate

# 4. Deploy database migrations
echo "--> Running Prisma database migrations..."
npx prisma migrate deploy

# 5. Seed initial data (roles, departments) if database is fresh
echo "--> Seeding essential database records if needed..."
npx prisma db seed || true

# 6. Restart or start server via PM2
if command -v pm2 &> /dev/null; then
  echo "--> Reloading application with PM2 cluster mode..."
  pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
  pm2 save
else
  echo "--> PM2 not detected. Starting server directly with Node.js..."
  NODE_ENV=production node src/server.js
fi

echo "==================================================="
echo " VoteVibes Backend Deployment Completed Successfully!"
echo "==================================================="
