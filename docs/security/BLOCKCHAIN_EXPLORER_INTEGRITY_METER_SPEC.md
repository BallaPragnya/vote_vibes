# Blockchain Explorer, Dynamic Integrity Meter & Public Receipt Verification Specification

**Project:** VoteVibes  
**Author:** Sadhvika (Blockchain & Security Lead)  
**Roadmap Phase:** Phase 6 — Blockchain Explorer, Dynamic Chain Integrity Meter & Public Verification Tool  
**Frontend Components:** `ChainIntegrityMeter.jsx`, `BlockchainExplorer.jsx`, `PublicReceiptVerifier.jsx`, `BlockchainAuditExplorerPage.jsx`  
**Backend Endpoints:** `/api/blockchain`, `/api/blockchain/integrity`, `/api/blockchain/blocks/:identifier`, `/api/blockchain/verify-receipt`

---

## 1. Architectural Overview & Purpose

Phase 6 provides public transparency and real-time cryptographic auditability for the VoteVibes platform. It consists of three integrated tools:

1. **Dynamic Chain Integrity Meter (`ChainIntegrityMeter.jsx`):**
   - Continuously audits block hashes and `previousHash` linkage across the ledger.
   - Renders a live visual integrity meter (Green 100% score when chain is intact, Red pulse alert if tampered).
   - Displays real-time metrics: Total Blocks, Votes Recorded, Elections Registered, Candidates Verified.

2. **Interactive Blockchain Explorer (`BlockchainExplorer.jsx`):**
   - Allows students, election auditors, and admins to inspect chained block data.
   - Filter & search by block sequence number, block hash, previous hash, or action type (`VOTE_CAST`, `ELECTION_CREATED`, `CANDIDATE_REGISTERED`).
   - Expandable view displays raw SHA-256 block hashes, previous hash linkage, and anonymized JSON payloads.

3. **Public Vote Receipt Verification Tool (`PublicReceiptVerifier.jsx`):**
   - Allows individual voters to enter their receipt parameters (`receiptId`, `voterHash`, `electionId`, `blockHash`, `blockIndex`, `signature`) or paste their receipt JSON.
   - Verifies digital HMAC-SHA256 signature and validates vote inclusion on the immutable blockchain ledger.

---

## 2. Component Workflow Architecture

```
                       STUDENT / AUDITOR
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
  Chain Integrity Meter   Block Explorer   Public Receipt Verifier
 (Real-time Health Check) (Ledger Search)   (Verify Vote Receipt)
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                    Backend API (/api/blockchain)
                               │
              BlockchainExplorerService
                               │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
   isChainValid() Check                 verifyVoteReceipt()
   Full Chain Audit Scan                Signature & Block Hash Check
           │                                     │
           ▼                                     ▼
   Integrity Score %                  Verified / Tampered Result
```

---

## 3. API Reference

### `GET /api/blockchain`
Returns overview of ledger metrics, overall integrity status, and block list. Optional query filters: `?action=VOTE_CAST`, `?electionId=elec_1`, `?search=query`.

### `GET /api/blockchain/integrity`
Triggers real-time full chain audit scan. Returns `{ isChainValid, integrityScore, totalBlocks, verifiedBlocksCount, tamperedBlocksCount, tamperedBlocks }`.

### `GET /api/blockchain/blocks/:identifier`
Retrieves single block details by block index number or 64-character SHA-256 block hash string.

### `POST /api/blockchain/verify-receipt`
Validates cryptographic vote receipt payload. Returns `{ isValid: true, message, verifiedBlock, blockIndex, timestamp }` or `{ isValid: false, reason }`.

---

## 4. Test Verification Summary

Automated tests in `backend/tests/blockchain/blockchainExplorer.test.js` & `backend/tests/blockchain/*.test.js` verify:
- ✅ Real-time chain audit scanning & 100% integrity score calculation
- ✅ Block filtering by action type (`VOTE_CAST`, `ELECTION_CREATED`, `CANDIDATE_REGISTERED`)
- ✅ Tampering detection when block data or chain linkage is modified
- ✅ Public receipt verification endpoint handling
- ✅ All 41+ blockchain unit tests passing cleanly.
