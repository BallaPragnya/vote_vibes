# VoteVibes — GitHub Label Taxonomy

This file replaces the "Bug Tracking Taxonomy" section that previously sat inside the requirements documentation. Per the project roadmap, the bug tracking taxonomy is configured **in GitHub Issues**, not maintained as a document.

Every issue should carry, at minimum, **one type label**, **one area label**, and **one workflow label**. Bug reports additionally carry **one severity label** and **one priority label**.

---

## Repository placement

```
.github/
└── ISSUE_TEMPLATE/
    ├── bug_report.md
    ├── feature_request.md
    └── documentation.md
```

The three template files must sit in `.github/ISSUE_TEMPLATE/` for GitHub to offer them on the "New issue" screen. This `labels.md` file is reference documentation and can live anywhere in the repository (`.github/labels.md` is a reasonable home) — labels themselves are created through the GitHub UI or the CLI commands at the end of this file.

---

## 1. Recommended Labels — Type

Identifies what kind of work the issue represents. Exactly one per issue.

| Label | Colour | Description |
|---|---|---|
| `type: bug` | `d73a4a` | Defective behaviour in the delivered system |
| `type: feature` | `0e8a16` | New capability or enhancement |
| `type: docs` | `0075ca` | Gap, error, or inconsistency in project documentation |
| `type: test` | `5319e7` | Test case authoring, test data, or test tooling work |
| `type: security` | `b60205` | Authentication, authorisation, cryptography, or secrets handling |
| `type: chore` | `cfd3d7` | Repository configuration, dependencies, or housekeeping |

## 2. Recommended Labels — Area

Identifies the module the issue belongs to, and therefore which lead reviews it. Exactly one per issue.

| Label | Colour | Description |
|---|---|---|
| `area: backend-api` | `c5def5` | Express APIs, Prisma schema, PostgreSQL, middleware |
| `area: auth-rbac` | `c5def5` | JWT, bcrypt, RBAC middleware, protected routes |
| `area: frontend-ui` | `c5def5` | React views, components, Tailwind design system |
| `area: blockchain` | `c5def5` | Block, blockchain and hash modules, chain validation |
| `area: voting-engine` | `c5def5` | Vote casting, integrity checks, receipt generation |
| `area: results-analytics` | `c5def5` | Tallies, dashboards, explorer, verification tool |
| `area: admin-portal` | `c5def5` | Administrative dashboard and controls |
| `area: qa-testing` | `c5def5` | Test plans, test execution, regression suite |
| `area: ci-cd` | `c5def5` | Repository setup, branch protection, integration workflow |

## 3. Recommended Labels — Phase

Ties the issue to the roadmap phase in which the affected capability is delivered. Optional but useful for milestone reporting.

| Label | Colour | Description |
|---|---|---|
| `phase: 0` | `e4e669` | Architecture & project planning |
| `phase: 1` | `e4e669` | Project foundation & environment setup |
| `phase: 2` | `e4e669` | Authentication & user management |
| `phase: 3` | `e4e669` | Election management |
| `phase: 4` | `e4e669` | Candidate management |
| `phase: 5` | `e4e669` | Voting engine & blockchain integration |
| `phase: 6` | `e4e669` | Results, analytics & verification |
| `phase: 7` | `e4e669` | Optimisation, security & final release |

---

## 4. Severity Labels

Severity describes **the consequence of the defect**, independent of when it will be fixed. Applied to bug reports. Exactly one.

| Label | Colour | Definition |
|---|---|---|
| `severity: critical` | `b60205` | Vote integrity, ledger integrity, authentication bypass, or data loss. The milestone cannot be signed off while this is open. |
| `severity: high` | `d93f0b` | A core journey cannot be completed and there is no workaround. |
| `severity: medium` | `fbca04` | A feature misbehaves but a usable workaround exists. |
| `severity: low` | `c2e0c6` | Cosmetic, wording, or minor interface inconsistency. No functional impact. |

**Note.** Anything that would allow a voter to cast more than one ballot, allow a ballot outside an open election, expose voter identity in the ledger, or break chain validation is `severity: critical` by definition — regardless of how easy it is to trigger.

---

## 5. Priority Labels

Priority describes **when the fix must land**. It is set at triage and is independent of severity: a low-severity defect on the demonstration path can still be P1.

| Label | Colour | Definition |
|---|---|---|
| `priority: P0` | `8b0000` | Drop everything. The current milestone cannot close until this is resolved. |
| `priority: P1` | `d93f0b` | Fix within the current phase. |
| `priority: P2` | `fbca04` | Fix before final release. |
| `priority: P3` | `c5def5` | Fix if capacity allows; may be deferred with a recorded decision. |

---

## 6. Workflow Labels

Workflow labels track where an issue sits in its lifecycle. Exactly one at any time — replace, do not accumulate.

| Label | Colour | Meaning |
|---|---|---|
| `status: triage` | `ededed` | Newly raised; severity, priority, and owner not yet assigned |
| `status: needs-info` | `d4c5f9` | Cannot proceed until the reporter supplies reproduction detail |
| `status: ready` | `bfd4f2` | Triaged, scoped, and ready to be picked up |
| `status: in-progress` | `1d76db` | Actively being worked on a feature branch |
| `status: in-review` | `006b75` | Pull request open, awaiting review from the owning module lead |
| `status: ready-for-qa` | `fef2c0` | Merged; awaiting re-test against the original reproduction steps |
| `status: verified` | `0e8a16` | Re-tested and confirmed fixed; safe to close |
| `status: blocked` | `b60205` | Cannot proceed; blocking dependency named in the issue |
| `status: deferred` | `6a737d` | Consciously deferred with a recorded decision |
| `status: duplicate` | `cfd3d7` | Already tracked by another issue, which is linked |

### Intended lifecycle

```
triage → ready → in-progress → in-review → ready-for-qa → verified → closed
   │                                              │
   ├── needs-info ────────────────────────────────┘
   ├── blocked
   ├── deferred
   └── duplicate
```

An issue is closed only from `status: verified`, `status: deferred`, or `status: duplicate`. A defect is never closed by the role that fixed it — it is closed after the reporting role has re-executed the original steps and confirmed the outcome.

---
