# Voting Engine Blockchain Integration & Vote Verification Specification

**Project:** VoteVibes  
**Author:** Sadhvika (Blockchain & Security Lead)  
**Roadmap Phase:** Phase 5 — Voting Engine Blockchain Integration, Cryptographic Receipts & Verification  
**Module Location:** `backend/src/blockchain/votingIntegration.js` & `backend/src/blockchain/voteVerification.js`

---

## 1. Architectural Overview

Phase 5 connects Sadhvika's custom blockchain infrastructure with the vote-casting workflow. It guarantees:
1. **Blockchain Vote Recording:** Every cast vote is anonymized using Phase 2 voter identity hashes (`voterHash`) and Phase 4 candidate hashes (`secureCandidateId`), then appended to the immutable blockchain ledger.
2. **Cryptographic Vote Receipt Generation:** Students receive an unforgeable, HMAC-signed vote receipt (`receiptId`, `blockHash`, `signature`) upon voting.
3. **Vote Verification Engine:** Anyone holding a vote receipt can verify its presence, block index, and cryptographic signature on the blockchain ledger without compromising voter privacy.

---

## 2. End-to-End Voting & Verification Architecture

```
                 STUDENT
                    │
                Casts Vote
                    │
            Voting Backend API
                    │
     YOUR BLOCKCHAIN INTEGRATION LAYER
        recordVoteOnBlockchain(...)
                    │
   ┌────────────────┴────────────────┐
   ▼                                 ▼
Phase 2 Voter Anonymity Hash    Phase 4 Secure Candidate Hash
generateVoterHash(userId)       hashCandidateId(candidateId)
   │                                 │
   └────────────────┬────────────────┘
                    │
                    ▼
          Block Created & Appended
    Block(N, VOTE_CAST, voterHash, candidateHash)
                    │
                    ▼
     Cryptographic Receipt Generated
    generateCryptographicVoteReceipt(...)
                    │
                    ▼
                 Student
                    │
         Vote Verification Engine
        verifyVoteReceipt(receipt, chain)
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
Valid Ledger Record          Tampered / Invalid
 [✅ Verified]               [❌ Tamper Failure]
```

---

## 3. Cryptographic Receipt Specification

A vote receipt adheres to the following structure:
```json
{
  "receiptId": "VR-8F3A-2026-X9B1",
  "voterHash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
  "electionId": "elec_presidential_2026",
  "blockIndex": 1,
  "blockHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp": "2026-08-07T22:00:00.000Z",
  "signature": "c9a4b87e2f1d5e3c..."
}
```

*Privacy Guarantee: Contains ZERO raw student PII (no name, no student ID, no email).*

---

## 4. Test Verification Summary

Automated tests in `backend/tests/blockchain/votingIntegration.test.js` & `backend/tests/blockchain/voteVerification.test.js` verify:
- ✅ Format of human-readable cryptographic receipt IDs (`VR-xxxx-2026-xxxx`)
- ✅ Anonymized vote recording on blockchain ledger (`isChainValid() === true`)
- ✅ Digital signature calculation (`HMAC-SHA256`)
- ✅ Receipt verification against blockchain ledger (`verifyVoteReceipt() === true`)
- ✅ Tampering detection for modified signatures, tampered block payloads, or broken chain links
- ✅ Voter participation verification (`verifyVoterParticipation() === true`)
