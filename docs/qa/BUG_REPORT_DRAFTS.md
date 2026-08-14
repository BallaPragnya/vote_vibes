# VoteVibes - QA Bug Report Drafts

**Author:** Nithya (QA & Admin Lead)  
**Target Branch:** `develop`  
**Date:** August 12, 2026  
**Status:** Drafts for Team Review  

---

> [!NOTE]
> Per QA guidelines, no source code changes have been made for these findings. These bug report drafts are submitted for team triage.

---

### BUG-DRAFT-001: Backend Environment Setup Error in Fresh Workspace Test Runs

- **Component:** Backend Test Harness / DX
- **Severity:** Low
- **Priority:** Low
- **Found In:** Phase 7 Build & Test Verification

#### Description
When running `npm test` in the `backend/` directory on a fresh checkout, the test runner immediately terminates with a `[FATAL ERROR] ENVIRONMENT CONFIGURATION FAILURE` due to missing `PORT`, `NODE_ENV`, `DATABASE_URL`, and `CLIENT_URL` environment variables if `backend/.env` does not exist.

#### Steps to Reproduce
1. Clone repository fresh.
2. Run `cd backend && npm install`.
3. Run `npm test` without creating `backend/.env`.

#### Expected Behavior
The test suite should either fall back to default test environment values or automatically generate a template `.env` for running local tests.

#### Recommended Fix
Update `backend/tests/setup.js` or `package.json` test scripts to check for `process.env` and auto-load sensible test defaults if `.env` is absent.

---

### BUG-DRAFT-002: Frontend Production Build Bundle Chunk Size Warning (>500 kB)

- **Component:** Frontend Build / Performance
- **Severity:** Low
- **Priority:** Medium
- **Found In:** Phase 7 Frontend Build Verification

#### Description
Running `npm run build` in `frontend/` succeeds cleanly, but outputs a Vite bundle size warning:
`dist/assets/index-CDEIzzNp.js 1,275.19 kB │ gzip: 368.39 kB` exceeding the default 500 kB chunk threshold.

#### Steps to Reproduce
1. In `frontend/`, run `npm run build`.
2. Observe output warning from Vite/Rollup.

#### Expected Behavior
Large libraries (`recharts`, `jspdf`, `html2canvas`) should be code-split into vendor chunks to improve initial page load performance.

#### Recommended Fix
In `frontend/vite.config.js`, configure `manualChunks` or use lazy dynamic imports (`React.lazy()`) for `ResultsPage` and `BlockchainExplorerPage`.

---

### BUG-DRAFT-003: Integration Test Failures in Offline / No-Database Environments

- **Component:** Backend Integration Tests (`voteIntegrity.validator.test.js`, `vote.test.js`)
- **Severity:** Medium
- **Priority:** Medium
- **Found In:** Phase 7 Backend Test Suite Execution

#### Description
While all 141 pure logic unit tests (hashing, RBAC token verification, result calculation) pass 100%, tests requiring Prisma DB queries (`voteIntegrity.validator.test.js` and `vote.test.js`) fail if a local PostgreSQL service is not actively running at `DATABASE_URL`.

#### Steps to Reproduce
1. In `backend/`, configure `.env` with a dummy database URL.
2. Run `npm test`.
3. Database connection hooks fail with `Authentication failed against database server`.

#### Expected Behavior
Database-dependent integration tests should gracefully skip or mock database operations when running in unit test mode.

#### Recommended Fix
Implement Prisma client mocking (e.g. `prisma-mock` or mock repository injection) for unit tests, reserving real database connections for dedicated `npm run test:e2e` runs.
