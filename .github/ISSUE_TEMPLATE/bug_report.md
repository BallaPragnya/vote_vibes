---
name: Bug Report
about: Report defective behaviour observed in the VoteVibes E-Voting System
title: "[BUG] <short description of the defect>"
labels: ["type: bug", "status: triage"]
assignees: ''
---

## Summary

<!-- One or two sentences describing what is wrong. -->

## Affected Module

<!-- Tick the module in which the defect was observed. -->

- [ ] `area: backend-api` — Express APIs, Prisma / PostgreSQL schema
- [ ] `area: auth-rbac` — JWT, bcrypt, RBAC middleware, protected routes
- [ ] `area: frontend-ui` — React views, components, design system
- [ ] `area: blockchain` — block / blockchain / hash modules, chain validation
- [ ] `area: voting-engine` — vote casting API, receipts, integrity checks
- [ ] `area: results-analytics` — tallies, dashboards, explorer, verification tool
- [ ] `area: admin-portal` — administrative dashboard and controls
- [ ] `area: ci-cd` — repository configuration, branch protection, workflow

## Roadmap Phase

<!-- The phase in which the affected feature is delivered, e.g. Phase 5. -->

Phase:

## Environment

| Field | Value |
|---|---|
| Branch / commit | |
| Backend | Node / Express, Prisma, PostgreSQL |
| Frontend | React + Vite, browser and version |
| Device / viewport | Desktop / mobile, screen width |
| Database state | e.g. freshly seeded, mid-election, post-election |

## Steps to Reproduce

1.
2.
3.

## Expected Result

<!-- What should have happened. Reference the requirement or acceptance criterion if one exists. -->

## Actual Result

<!-- What actually happened. -->

## Traceability

<!-- Fill in whichever apply, so the defect can be tied back to the frozen requirements. -->

| Reference | ID |
|---|---|
| Requirement (VV-SRS-01) | e.g. FR-VOTE-02 |
| User story (VV-US-01) | e.g. US-VOTE-02 |
| Acceptance criterion (VV-AC-01) | e.g. AC-VOTE-02.2 |
| Test case | |

## Severity

<!-- Tick exactly one. Apply the matching severity label. -->

- [ ] `severity: critical` — vote integrity, ledger integrity, authentication bypass, or data loss. Blocks the milestone.
- [ ] `severity: high` — a core journey cannot be completed and no workaround exists.
- [ ] `severity: medium` — a feature misbehaves but a workaround exists.
- [ ] `severity: low` — cosmetic, wording, or minor interface inconsistency.

## Priority

- [ ] `priority: P0` — fix before anything else; the milestone cannot close.
- [ ] `priority: P1` — fix within the current phase.
- [ ] `priority: P2` — fix before final release.
- [ ] `priority: P3` — fix if capacity allows.

## Evidence

<!-- Screenshots, API responses, Winston log excerpts, failing chain validation output. -->

## Regression Check

- [ ] This behaviour previously worked and has since broken (regression)
- [ ] This behaviour has never worked
- [ ] Not known

## Reporter Verification

- [ ] I have confirmed this is reproducible and is not a stale build or local environment issue
- [ ] I have searched existing issues and this is not a duplicate
