# Election Integrity Hooks & Immutability Specification

**Project:** VoteVibes  
**Author:** Sadhvika (Blockchain & Security Lead)  
**Roadmap Phase:** Phase 3 — Election Management & Integrity Hooks  
**Module Location:** `backend/src/blockchain/electionIntegrity.js`

---

## 1. Overview & Architectural Purpose

In a digital election management platform, PostgreSQL databases store election configurations (titles, dates, candidate lists, department restrictions, and statuses). However, database records alone are vulnerable to insider tampering, direct SQL injection, or unauthorized admin edits.

The **Election Integrity Hooks & Immutability Engine** bridges Pragnya's Election CRUD Services with Sadhvika's Custom Blockchain verification layer to guarantee:
1. **Election Fingerprint Immutability:** Every election's canonical parameters are hashed using SHA-256 upon creation.
2. **State Transition Auditability:** Status transitions (`DRAFT` ➔ `UPCOMING` ➔ `ACTIVE` ➔ `COMPLETED` ➔ `ARCHIVED`) generate chained immutable blockchain blocks.
3. **Tamper Detection:** Any unauthorized database modification (changing title, extending end date, inserting/removing candidates, or altering status) is immediately detected when verified against the recorded blockchain fingerprint.

---

## 2. Integrity Architecture Flow

```
Admin Creates / Updates Election (Pragnya's Service)
                       │
                       ▼
        Canonical Hash Computation
    computeElectionIntegrityHash(election)
                       │
                       ▼
          Blockchain Hook Invocation
   onElectionCreatedHook / StateChangedHook
                       │
                       ▼
            Immutable Block Created
   [Block N: Action, ElectionID, Hash, Link]
                       │
                       ▼
      Tamper Verification Audit Check
    verifyElectionIntegrity(dbData, block)
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
  Hash Matches                  Hash Mismatch
  [✅ Intact]                [❌ Tampering Detected]
```

---

## 3. Core Component Reference

### `computeElectionIntegrityHash(election)`
Computes a deterministic SHA-256 hash of the canonical election payload:
- Title & Description
- Normalized Start & End Timestamps
- Canonical Status
- Department Restrictions (Sorted)
- Candidate Identifiers (Sorted)

*Note: Sorting nested arrays ensures determinism regardless of JSON insertion order.*

### `onElectionCreatedHook(election, blockchain)`
Appends an `ELECTION_CREATED` genesis block to the election's blockchain ledger containing the initial integrity hash.

### `onElectionStateChangedHook(election, previousState, newState, blockchain)`
Appends an `ELECTION_STATE_CHANGED` block to the blockchain ledger whenever the election transitions state.

### `verifyElectionIntegrity(currentDbElection, recordedBlock)`
Recomputes the current hash from database entity and compares against `recordedBlock.data.integrityHash`.
Returns:
```json
{
  "isIntact": false,
  "currentHash": "a1b2c3...",
  "recordedHash": "x9y8z7...",
  "tamperedFields": ["title", "endTime"]
}
```

---

## 4. Test Verification Summary

Automated tests in `backend/tests/blockchain/electionIntegrity.test.js` verify:
- ✅ SHA-256 determinism & array key sorting
- ✅ Creation genesis block registration
- ✅ State change block chaining & chain validation (`isChainValid() === true`)
- ✅ Tamper detection for altered title, start/end dates, candidate list, or election status.
