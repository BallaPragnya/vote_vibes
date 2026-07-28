# VoteVibes Backend API

Backend foundation for VoteVibes - Secure College Election Management Platform.

## Requirements

- Node.js (v18+)
- PostgreSQL (v14+)

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and configure your PostgreSQL database URL:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/votevibes?schema=public"
   ```

3. **Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Endpoints

- `GET /` - Root status endpoint
- `GET /api/health` - Health check & database connection status
