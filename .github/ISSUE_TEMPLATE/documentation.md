---
name: Documentation Issue
about: Report a gap, error, or inconsistency in the VoteVibes project documentation
title: "[DOCS] <short description of the documentation issue>"
labels: ["type: docs", "status: triage"]
assignees: ''
---

## Document Affected

- [ ] `VV-SRS-01` — System Requirements Specification
- [ ] `VV-MTP-01` — Master Testing Plan
- [ ] `VV-US-01` — User Stories
- [ ] `VV-AC-01` — Acceptance Criteria
- [ ] Repository documentation (README, setup instructions, API notes)
- [ ] User Manual / demonstration material

## Location

<!-- Be specific: section number, requirement ID, story ID, or criterion ID. -->

| Field | Value |
|---|---|
| Section | e.g. 3.4 Voting Engine & Blockchain Ledger |
| Identifier | e.g. FR-VOTE-07 / US-VOTE-05 / AC-VOTE-05.1 |
| Document version | e.g. 1.0 |

## Nature of the Issue

- [ ] Missing — something required is not documented at all
- [ ] Incorrect — the documented behaviour does not match the built system
- [ ] Outdated — the documentation reflects a superseded decision
- [ ] Ambiguous — the wording admits more than one reading and is not testable as written
- [ ] Inconsistent — two documents disagree with each other

## Current Text

<!-- Quote the passage as it currently stands, or state that nothing is written. -->

## Proposed Change

<!-- The replacement wording, or a description of what should be added. -->

## Reason

<!-- Why the change is needed. If the built system diverged from the specification, say which is correct. -->

## Knock-On Effects

Documentation is traceable, so a change in one place often requires a change in another. Tick anything this affects:

- [ ] A requirement in VV-SRS-01 must change
- [ ] A user story in VV-US-01 must change
- [ ] One or more acceptance criteria in VV-AC-01 must change
- [ ] A test case or phase entry in VV-MTP-01 must change
- [ ] No knock-on effect

<!-- List the affected identifiers here. -->

## Impact

- [ ] `severity: high` — the documentation is wrong in a way that could cause the system to be built or tested incorrectly
- [ ] `severity: medium` — the documentation is unclear and needs interpretation
- [ ] `severity: low` — typographical, formatting, or wording improvement
