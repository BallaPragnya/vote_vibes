# VoteVibes - Comprehensive QA Test Plan (Phases 2–7)

**Author:** Nithya (QA & Admin Lead)  
**Target Branch:** `develop`  
**Date:** August 12, 2026  
**Status:** Approved for QA Execution  

---

## 1. Overview & Objectives

This document serves as the master **QA Test Plan** for the VoteVibes College Election Management System covering all implemented features from **Phase 2 through Phase 7**.

### Objectives:
- Ensure end-to-end quality, functional correctness, security, and performance across Frontend, Backend, Database, and Blockchain components.
- Verify Role-Based Access Control (RBAC) boundaries for Students, Election Commission (EC), and Admin users.
- Confirm vote integrity, single-vote enforcement, cryptographic receipt generation, and blockchain immutability.
- Validate system resilience under stress and interactive tamper detection features.

---

## 2. Component Build & Build Verification Results

| Component | Status | Build Command / Output | Notes |
| :--- | :---: | :--- | :--- |
| **Frontend (React + Vite)** | **PASS** | `npm run build` | Built in 59.43s, produced `dist/` bundle (2553 modules transformed). |
| **Backend (Node + Express)** | **PASS** | `npm test` | All 141 pure unit tests across 36 test suites passed cleanly. |
| **Database (Prisma + PostgreSQL)**| **PASS** | `npx prisma generate` | Prisma Client (v6.19.3) generated successfully. |
| **Blockchain Module** | **PASS** | Unit & Stress Test Suites | SHA-256 block creation, receipt verification, and chain validation tests passed. |

---

## 3. Test Cases by Phase and Feature

---

### Phase 2: Authentication, User Roles (RBAC) & Identity Abstraction

#### TC-P2-001: Student User Registration
- **Feature:** User Registration (`POST /api/auth/register`)
- **Preconditions:** Server is running; user email does not exist in PostgreSQL.
- **Test Steps:**
  1. Open `/register` on the frontend.
  2. Enter valid Name, Student Email (`student@college.edu`), Password (min 8 chars), and Select Role `STUDENT`.
  3. Click **Register**.
- **Expected Result:** Account created (HTTP 201). User receives JWT token and is redirected to the Student Dashboard.
- **Priority:** High

#### TC-P2-002: Duplicate Email Registration Prevention
- **Feature:** Input Validation & Conflict Handling
- **Preconditions:** Account with `student@college.edu` already exists.
- **Test Steps:**
  1. Submit registration form with existing email `student@college.edu`.
- **Expected Result:** System returns HTTP 409 Conflict with message `"Email already registered"`. Form displays user-friendly error notification.
- **Priority:** High

#### TC-P2-003: User Login & JWT Token Issuance
- **Feature:** User Authentication (`POST /api/auth/login`)
- **Preconditions:** Registered user account exists with hashed password.
- **Test Steps:**
  1. Open `/login`.
  2. Enter valid email and password. Click **Login**.
- **Expected Result:** HTTP 200 OK. Server returns `accessToken` and `refreshToken`. AuthContext updates state, storing token securely.
- **Priority:** High

#### TC-P2-004: Role-Based Access Control (RBAC) - Unauthorized Route Protection
- **Feature:** RBAC Middleware (`authorize('ADMIN', 'ELECTION_COMMISSION')`)
- **Preconditions:** Logged in as a user with `STUDENT` role.
- **Test Steps:**
  1. Navigate directly to `/admin/candidates` or send `POST /api/elections`.
- **Expected Result:** Access denied. Backend returns HTTP 403 Forbidden. Frontend redirects to `/unauthorized` page.
- **Priority:** High

#### TC-P2-005: Password Hashing Verification
- **Feature:** Security Hardening (`bcryptjs`)
- **Preconditions:** Direct access to database records.
- **Test Steps:**
  1. Query `User` table in PostgreSQL via Prisma.
  2. Check `password` column for newly registered user.
- **Expected Result:** Password string is a 60-character bcrypt hash (`$2a$` or `$2b$`). Plaintext password is nowhere stored.
- **Priority:** High

#### TC-P2-006: Voter Identity Abstraction & Anonymization
- **Feature:** Voter Identity Abstraction Layer (`voterHash`)
- **Preconditions:** Registered user submits a vote request.
- **Test Steps:**
  1. Inspect vote block payload sent to the blockchain ledger.
- **Expected Result:** Real user ID / Student ID is replaced with a one-way cryptographic `voterHash`. Individual identity cannot be reversed from vote records.
- **Priority:** High

---

### Phase 3: Election Management

#### TC-P3-001: Election Creation by Election Commission / Admin
- **Feature:** Election Management (`POST /api/elections`)
- **Preconditions:** Authenticated user with `ELECTION_COMMISSION` or `ADMIN` role.
- **Test Steps:**
  1. Open `/elections` dashboard and click **Create Election**.
  2. Fill Title ("Student Council 2026"), Start Date (Future/Now), End Date (Future), and Description.
  3. Submit form.
- **Expected Result:** HTTP 201 Created. Election created with status `DRAFT` or `UPCOMING`. Appears in Election List.
- **Priority:** High

#### TC-P3-002: Election Date Range Validation
- **Feature:** Input Validation (`validateCreateElection`)
- **Preconditions:** Admin/EC logged in.
- **Test Steps:**
  1. Attempt to create election with End Date set before Start Date.
- **Expected Result:** Form submission fails with error `"End date must be after start date"`. API returns HTTP 400 Bad Request.
- **Priority:** Medium

#### TC-P3-003: Election Immutability & Blockchain Genesis Snapshot
- **Feature:** Blockchain Immutability Engine
- **Preconditions:** Election created and transitioned to `ACTIVE` state.
- **Test Steps:**
  1. Start election.
  2. Check blockchain engine state for this election ID.
- **Expected Result:** Blockchain initializes genesis block linking election parameters, ensuring election rules cannot be altered mid-vote.
- **Priority:** High

#### TC-P3-004: Public Election List & Status Filtering
- **Feature:** Election Discovery (`GET /api/elections`)
- **Preconditions:** Multiple elections exist in `ACTIVE`, `UPCOMING`, and `COMPLETED` states.
- **Test Steps:**
  1. Open `/elections` as a Student.
  2. Filter by status tags.
- **Expected Result:** Elections accurately filtered and rendered with status badges and countdown timers.
- **Priority:** Medium

---

### Phase 4: Candidate Management & Nominations

#### TC-P4-001: Student Candidate Nomination Submission
- **Feature:** Nomination Form (`POST /api/candidates`)
- **Preconditions:** Student authenticated; active election allowing nominations.
- **Test Steps:**
  1. Navigate to `/elections/:id/nominate`.
  2. Enter Position, Manifesto text, and upload profile photo.
  3. Submit nomination.
- **Expected Result:** HTTP 201 Created. Candidate entry created with status `PENDING_APPROVAL`.
- **Priority:** High

#### TC-P4-002: Admin Candidate Approval Panel
- **Feature:** Candidate Approval Workflow (`PATCH /api/candidates/:id/status`)
- **Preconditions:** Pending candidate nomination exists; logged in as `ADMIN`.
- **Test Steps:**
  1. Open Admin Candidate Approval panel.
  2. Select candidate nomination and click **Approve**.
- **Expected Result:** Status updates to `APPROVED`. Candidate is now visible on the public voting ballot for that election.
- **Priority:** High

#### TC-P4-003: Candidate Manifesto Viewer Modal
- **Feature:** UI Component (`ManifestoModal`)
- **Preconditions:** Approved candidates exist on election ballot.
- **Test Steps:**
  1. On Candidate Grid View, click **Read Manifesto** on a candidate card.
- **Expected Result:** Modal opens smoothly displaying full manifesto, candidate bio, and position without page reload.
- **Priority:** Medium

#### TC-P4-004: Candidate Security Validation & ID Hashing
- **Feature:** Candidate Integrity Engine
- **Preconditions:** Candidate approved for election.
- **Test Steps:**
  1. Verify candidate hash in backend candidate registry.
- **Expected Result:** `candidateHash` generated via SHA-256 matching candidate details and election ID.
- **Priority:** High

---

### Phase 5: Digital Voting Booth, Ballot & Vote Verification Engine

#### TC-P5-001: Access Digital Voting Booth
- **Feature:** Voting Booth (`/elections/:id/vote`)
- **Preconditions:** Student logged in; election status is `ACTIVE`; student has not voted yet.
- **Test Steps:**
  1. Click **Vote Now** on active election card.
- **Expected Result:** Voting booth opens displaying approved candidate cards with radio/selection controls.
- **Priority:** High

#### TC-P5-002: Candidate Selection & Confirmation Modal
- **Feature:** Vote Submission Workflow
- **Preconditions:** Inside active voting booth.
- **Test Steps:**
  1. Select a candidate.
  2. Click **Submit Vote**.
- **Expected Result:** Confirmation modal appears displaying selected candidate name and warning that submission is final.
- **Priority:** High

#### TC-P5-003: One-Voter-One-Vote Enforcement (Duplicate Vote Prevention)
- **Feature:** Duplicate Vote Guard (`POST /api/votes/cast`)
- **Preconditions:** Student has successfully cast a vote in Election X.
- **Test Steps:**
  1. Attempt to cast a second vote in Election X via UI or direct API request.
- **Expected Result:** Request rejected with HTTP 400 / 409 Conflict. Message: `"Voter has already cast a vote in this election"`. Second vote is NOT recorded.
- **Priority:** High (Critical)

#### TC-P5-004: Cryptographic Receipt Generation & Receipt Download
- **Feature:** Receipt Generator & PDF/TXT Export
- **Preconditions:** Vote successfully cast.
- **Test Steps:**
  1. Complete vote submission.
  2. On success modal, click **Download Receipt**.
- **Expected Result:** Receipt generated containing Receipt ID, Election ID, Timestamp, and Block Hash. File downloads successfully.
- **Priority:** High

#### TC-P5-005: Voter Status Badge Update
- **Feature:** Real-time Voter Status (`GET /api/votes/status/:electionId`)
- **Preconditions:** Student has cast a vote.
- **Test Steps:**
  1. Return to Election List or Dashboard.
- **Expected Result:** Election card badge updates from `"Eligible to Vote"` to `"Voted"` (disabled action button).
- **Priority:** Medium

#### TC-P5-006: Blockchain Block Creation & Previous Hash Linkage
- **Feature:** Blockchain Voting Engine
- **Preconditions:** Vote cast.
- **Test Steps:**
  1. Query blockchain ledger state for latest block.
- **Expected Result:** New block appended with index `N`. `previousHash` equals block `N-1` hash. `currentHash` matches calculated SHA-256 hash.
- **Priority:** High (Critical)

---

### Phase 6: Election Results, Analytics & Blockchain Explorer

#### TC-P6-001: Live/Final Results Tally & Winner Determination
- **Feature:** Results Calculator Engine (`GET /api/results/:electionId`)
- **Preconditions:** Election voting ended or active with live results enabled.
- **Test Steps:**
  1. Open `/elections/:id/results`.
- **Expected Result:** Displays accurate vote counts per candidate, candidate percentage progress bars, and highlights winner/leading candidate.
- **Priority:** High

#### TC-P6-002: Demographic & Turnout Analytics Summary
- **Feature:** Turnout Analytics Widget
- **Preconditions:** Votes recorded across student departments.
- **Test Steps:**
  1. View Turnout Analytics section on Results page.
- **Expected Result:** Renders total eligible voters, votes cast count, turnout percentage, and demographic charts (Recharts) without console errors.
- **Priority:** Medium

#### TC-P6-003: Certified PDF Summary Report Download
- **Feature:** PDF Report Generator (`GET /api/results/:electionId/pdf`)
- **Preconditions:** Results available.
- **Test Steps:**
  1. Click **Download Certified PDF Report**.
- **Expected Result:** PDF generates cleanly on client/server with election header, candidate standings, turnout stats, and official watermark.
- **Priority:** Medium

#### TC-P6-004: Public Blockchain Explorer Listing
- **Feature:** Blockchain Explorer UI (`/blockchain`)
- **Preconditions:** Server running with populated blockchain ledger.
- **Test Steps:**
  1. Navigate to `/blockchain`.
- **Expected Result:** Paginated block list renders displaying Block #, Timestamp, Previous Hash, Current Hash, and Transaction summary.
- **Priority:** High

#### TC-P6-005: Dynamic Chain Integrity Status Meter
- **Feature:** Integrity Meter (`DynamicIntegrityMeter`)
- **Preconditions:** Unmodified, valid blockchain ledger.
- **Test Steps:**
  1. View top summary banner on Blockchain Explorer.
- **Expected Result:** Displays status badge `"Ledger Status: VALID (100% Intact)"` with green indicator.
- **Priority:** High

#### TC-P6-006: Public Receipt Verification Search
- **Feature:** Vote Verifier Form
- **Preconditions:** Valid vote receipt hash from TC-P5-004.
- **Test Steps:**
  1. On Blockchain Explorer, paste vote receipt hash into search input. Click **Verify**.
- **Expected Result:** Verifier confirms `"Vote Verified on Blockchain!"` displaying matching block index and timestamp.
- **Priority:** High

---

### Phase 7: Stress Testing, Tamper-Detection Demo, UI Polish & Hardening

#### TC-P7-001: High-Volume Blockchain Stress Test
- **Feature:** Stress Testing Engine (`backend/src/blockchain/stressTest.js`)
- **Preconditions:** Node environment ready.
- **Test Steps:**
  1. Run stress test suite generating 100+ block transactions rapidly.
- **Expected Result:** System generates and verifies 100+ blocks under 1 second without memory leaks or chain corruption.
- **Priority:** Medium

#### TC-P7-002: Interactive Tamper Detection Demonstration
- **Feature:** Tamper Detection Tool (`/blockchain` tamper demo toggle)
- **Preconditions:** Blockchain ledger loaded.
- **Test Steps:**
  1. On Tamper Demo panel, select Block #2 and alter vote payload string.
  2. Click **Simulate Tampering / Revalidate Chain**.
- **Expected Result:** Integrity meter instantly turns RED (`"TAMPER DETECTED at Block #2"`). Subsequent hashes break, proving immutable chain security.
- **Priority:** High

#### TC-P7-003: Blockchain Ledger Export (JSON / CSV)
- **Feature:** Ledger Exporter
- **Preconditions:** Blocks exist in ledger.
- **Test Steps:**
  1. On Explorer toolbar, click **Export Ledger (JSON)** and **Export Ledger (CSV)**.
- **Expected Result:** Downloads complete raw ledger data file formatted correctly.
- **Priority:** Low

#### TC-P7-004: Dedicated 500 Error Page & 404 Routing
- **Feature:** Error Boundary Pages (`/500`, `/404`)
- **Preconditions:** React router active.
- **Test Steps:**
  1. Navigate to undefined route `/random-invalid-url`.
  2. Navigate directly to `/500`.
- **Expected Result:** `/404` renders sleek Page Not Found layout with "Back to Home" button. `/500` renders Server Error page without leaking stack traces.
- **Priority:** Medium

#### TC-P7-005: UI Text Standardization ("Login" Uniformity)
- **Feature:** Phase 7 UI Polish
- **Preconditions:** Frontend loaded.
- **Test Steps:**
  1. Inspect Navbar, Login Page, Register Link, and Buttons.
- **Expected Result:** All occurrences consistently use the standard spelling **Login** (not "Log In").
- **Priority:** Low

#### TC-P7-006: Backend Rate Limiter Security Verification
- **Feature:** Rate Limiter Middleware (`express-rate-limit`)
- **Preconditions:** Backend server active.
- **Test Steps:**
  1. Send 100+ rapid HTTP requests within 1 minute to `/api/auth/login`.
- **Expected Result:** Server throttles requests, returning HTTP 429 Too Many Requests.
- **Priority:** High

---

## 4. Acceptance Criteria

The release for Phases 2–7 is considered **PASSED** when:
1. All **High** priority test cases achieve **PASS** status.
2. At least 95% of **Medium** and **Low** priority test cases pass.
3. No critical security vulnerabilities or vote record discrepancies are detected.
4. Frontend build completes with zero errors.
5. Codebase adheres strictly to `AGENTS.md` rules.
