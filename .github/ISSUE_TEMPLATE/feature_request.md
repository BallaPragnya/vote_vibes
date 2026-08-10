---
name: Feature Request
about: Propose a capability or enhancement for the VoteVibes E-Voting System
title: "[FEAT] <short description of the capability>"
labels: ["type: feature", "status: triage"]
assignees: ''
---

## Summary

<!-- One or two sentences describing the proposed capability. -->

## User Story

> As a **\<role\>**, I want **\<capability\>** so that **\<outcome\>**.

<!-- Roles in use: Voter, Candidate, Administrator, Public Verifier, Maintainer. -->

## Business Value

<!-- Why this is worth building. What is lost if it is not built. -->

## Scope Check

The project scope is bounded by the phases of the VoteVibes roadmap. Confirm which applies:

- [ ] This refines a capability already named in the roadmap
- [ ] This is new scope beyond the roadmap and requires an explicit scope decision

## Affected Module

- [ ] `area: backend-api`
- [ ] `area: auth-rbac`
- [ ] `area: frontend-ui`
- [ ] `area: blockchain`
- [ ] `area: voting-engine`
- [ ] `area: results-analytics`
- [ ] `area: admin-portal`
- [ ] `area: ci-cd`

## Target Phase

<!-- The roadmap phase in which this should land, e.g. Phase 6. -->

Phase:

## Proposed Acceptance Criteria

<!-- Express each condition of satisfaction in Given-When-Then form. Accepted criteria are transferred into VV-AC-01. -->

**Criterion 1**
- **Given** …
- **When** …
- **Then** …

**Criterion 2**
- **Given** …
- **When** …
- **Then** …

## Traceability

| Reference | ID |
|---|---|
| Related requirement (VV-SRS-01) | |
| Related user story (VV-US-01) | |

## Dependencies

<!-- Work that must land first, e.g. an API this depends on, or a ledger capability not yet built. -->

## Impact on Existing Behaviour

<!-- Does this change anything already accepted? If so, which acceptance criteria need revisiting? -->

## Out of Scope

<!-- What this request explicitly does not cover, to keep the boundary clear. -->

## Definition of Done

- [ ] Implemented behind the owning module's review
- [ ] Unit and integration tests written and passing
- [ ] Acceptance criteria added to VV-AC-01 and passing against the running system
- [ ] Requirements documentation updated where the behaviour changes the specification
- [ ] Regression set re-executed with no new failures
