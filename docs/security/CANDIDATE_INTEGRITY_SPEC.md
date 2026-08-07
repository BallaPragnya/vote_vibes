# Candidate Validation & Candidate ID Hashing Specification

**Project:** VoteVibes  
**Author:** Sadhvika (Blockchain & Security Lead)  
**Roadmap Phase:** Phase 4 — Candidate Validation Logic & Candidate ID Hashing  
**Module Location:** `backend/src/blockchain/candidateValidation.js`

---

## 1. Executive Summary & Purpose

Candidate registration and profile management require strict security controls to prevent candidate duplication, identity spoofing, malicious script injection, and unauthorized profile alteration in the database.

The **Candidate Validation & Candidate ID Hashing Engine** provides:
1. **Candidate ID Hashing (`hashCandidateId`):** Converts raw candidate UUIDs into election-scoped SHA-256 HMAC Secure Candidate Identifiers (`secureCandidateId`).
2. **Duplicate Registration Prevention (`validateCandidateSecurity`):** Validates candidate payloads to ensure unique candidate IDs and prevent duplicate user registrations in the same election.
3. **Manifesto / Payload Security Checks:** Sanitizes candidate data to block XSS and malicious script content.
4. **Candidate Profile Integrity (`computeCandidateIntegrityHash` & `verifyCandidateIntegrity`):** Locks candidate profiles onto the blockchain ledger to detect any unauthorized database tampering.

---

## 2. Architecture & Flow

```
Candidate Registration Request (Frontend)
                  │
                  ▼
   Security & Duplicate Validation
  validateCandidateSecurity(payload, existing)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    Valid Payload       Invalid / Duplicate
        │             [❌ Reject 400/409]
        ▼
Candidate ID Hashing Engine
hashCandidateId(candidateId, electionId)
        │
        ▼
Canonical Integrity Fingerprint
computeCandidateIntegrityHash(candidate)
        │
        ▼
   Blockchain Ledger Registration
createCandidateRegistrationBlockData(candidate)
```

---

## 3. Core API Functions Reference

### `hashCandidateId(candidateId, electionId, salt)`
Generates an election-scoped SHA-256 HMAC secure candidate identifier.

### `validateCandidateSecurity(candidateData, existingCandidates)`
Performs multi-point security checks:
- Candidate ID & Election ID presence validation
- Duplicate user/candidate registration check within the same election
- Script injection / XSS payload detection

### `computeCandidateIntegrityHash(candidate)`
Computes a SHA-256 fingerprint hash of candidate metadata (ID, election ID, user ID, name, position, manifesto, status).

### `verifyCandidateIntegrity(currentCandidateData, recordedIntegrityHash)`
Recomputes candidate hash fingerprint from database state and compares it against `recordedIntegrityHash` on the blockchain ledger. Detects database tampering.

---

## 4. Test Verification Summary

Automated tests in `backend/tests/blockchain/candidateValidation.test.js` verify:
- ✅ SHA-256 HMAC candidate ID hashing (64 hex chars)
- ✅ Cross-election hash isolation (unlinkability across elections)
- ✅ Security validation & duplicate candidate rejection
- ✅ Script injection / XSS payload blocking
- ✅ Candidate profile fingerprinting & database tamper detection
- ✅ Blockchain registration block integration (`isChainValid() === true`)
