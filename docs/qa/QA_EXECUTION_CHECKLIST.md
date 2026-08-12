# VoteVibes - Manual QA Execution Checklist (Phases 2–7)

**Tester Name:** Nithya (QA Lead)  
**Environment:** Staging / Local (`develop` branch)  
**Execution Date:** ____________________  

---

## Instructions
1. Execute each test case according to the steps defined in [`QA_TEST_PLAN_PHASES_2_TO_7.md`](file:///C:/Users/kolan/OneDrive/Desktop/vote_vibes/vote_vibes/docs/qa/QA_TEST_PLAN_PHASES_2_TO_7.md).
2. Mark `[x]` under **PASS** or **FAIL**.
3. If **FAIL**, record the issue ID in the **Bug Draft Ref** column.

---

## Checklist

### Phase 2: Authentication, User Roles & Identity

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P2-001` | Student User Registration (`/register`) | High | [ ] | [ ] | |
| `TC-P2-002` | Duplicate Email Registration Check (409) | High | [ ] | [ ] | |
| `TC-P2-003` | User Login & JWT Token Issuance (`/login`) | High | [ ] | [ ] | |
| `TC-P2-004` | RBAC Protected Routes & Unauthorized Page (`/unauthorized`) | High | [ ] | [ ] | |
| `TC-P2-005` | Password Hashing Verification (`bcrypt`) | High | [ ] | [ ] | |
| `TC-P2-006` | Voter Identity Abstraction & Hash Anonymizer | High | [ ] | [ ] | |

---

### Phase 3: Election Management

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P3-001` | Election Creation by Admin/EC | High | [ ] | [ ] | |
| `TC-P3-002` | Start/End Date Validation Rules | Medium | [ ] | [ ] | |
| `TC-P3-003` | Election Immutability & Blockchain Genesis Link | High | [ ] | [ ] | |
| `TC-P3-004` | Election Discovery List & Status Filtering | Medium | [ ] | [ ] | |

---

### Phase 4: Candidate Management & Nominations

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P4-001` | Candidate Nomination Form Submission | High | [ ] | [ ] | |
| `TC-P4-002` | Admin Candidate Approval Workflow Panel | High | [ ] | [ ] | |
| `TC-P4-003` | Candidate Manifesto Viewer Modal | Medium | [ ] | [ ] | |
| `TC-P4-004` | Candidate Security Validation & ID Hashing | High | [ ] | [ ] | |

---

### Phase 5: Digital Voting Booth, Ballot & Verification Engine

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P5-001` | Digital Voting Booth Access (`/elections/:id/vote`) | High | [ ] | [ ] | |
| `TC-P5-002` | Candidate Selection & Submission Confirmation Modal | High | [ ] | [ ] | |
| `TC-P5-003` | One-Voter-One-Vote Enforcement (Duplicate Prevention) | High | [ ] | [ ] | |
| `TC-P5-004` | Cryptographic Receipt Generator & PDF/TXT Download | High | [ ] | [ ] | |
| `TC-P5-005` | Real-time Voter Status Badge (`Voted` status) | Medium | [ ] | [ ] | |
| `TC-P5-006` | SHA-256 Blockchain Block Creation & Previous Hash Link | High | [ ] | [ ] | |

---

### Phase 6: Election Results, Analytics & Blockchain Explorer

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P6-001` | Live/Final Results Tally & Winner Determination | High | [ ] | [ ] | |
| `TC-P6-002` | Turnout Analytics & Demographic Charts | Medium | [ ] | [ ] | |
| `TC-P6-003` | Downloadable Certified PDF Summary Report | Medium | [ ] | [ ] | |
| `TC-P6-004` | Public Blockchain Explorer UI (`/blockchain`) | High | [ ] | [ ] | |
| `TC-P6-005` | Dynamic Chain Integrity Status Meter (`VALID`) | High | [ ] | [ ] | |
| `TC-P6-006` | Public Vote Receipt Verifier Search | High | [ ] | [ ] | |

---

### Phase 7: Stress Testing, Tamper-Detection, UI Polish & Hardening

| Test ID | Feature Description | Priority | PASS | FAIL | Bug Draft Ref / Remarks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-P7-001` | High-Volume Blockchain Stress Test (100+ Blocks) | Medium | [ ] | [ ] | |
| `TC-P7-002` | Interactive Tamper Detection Simulation Demo | High | [ ] | [ ] | |
| `TC-P7-003` | Blockchain Ledger Export (JSON / CSV) | Low | [ ] | [ ] | |
| `TC-P7-004` | Dedicated 500 Error Page (`/500`) & 404 Page (`/404`) | Medium | [ ] | [ ] | |
| `TC-P7-005` | UI Text Standardization ("Login" Uniformity) | Low | [ ] | [ ] | |
| `TC-P7-006` | Backend Rate Limiter Security Throttling (429) | High | [ ] | [ ] | |

---

## Final QA Execution Sign-off

- **Total Test Cases Executed:** ______ / 31
- **Passed:** ______
- **Failed:** ______
- **Blocker / High Priority Open Bugs:** ______

**QA Lead Approval Signature:** ____________________________  
**Date:** ____________________
