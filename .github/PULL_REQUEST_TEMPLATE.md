<!--
  Repository placement: .github/PULL_REQUEST_TEMPLATE.md
  GitHub loads this automatically into the description of every new pull request.
  Fill in every section. Delete the guidance comments before submitting.
-->

## Summary

<!-- One or two sentences: what does this PR do, and why? -->

## Linked Issue

<!-- Every PR must close an issue. Replace NN with the issue number. -->

Closes #NN

## Type of Change

<!-- Tick one. It should match the `type:` label on the linked issue. -->

- [ ] `type: feature` — new capability
- [ ] `type: bug` — defect fix
- [ ] `type: docs` — documentation only
- [ ] `type: test` — tests or test tooling
- [ ] `type: security` — auth, cryptography, or secrets handling
- [ ] `type: chore` — config, dependencies, housekeeping

## Area

<!-- Tick the module this PR changes. It sets who reviews it (see CONTRIBUTING). -->

- [ ] `area: backend-api`
- [ ] `area: auth-rbac`
- [ ] `area: frontend-ui`
- [ ] `area: blockchain`
- [ ] `area: voting-engine`
- [ ] `area: results-analytics`
- [ ] `area: admin-portal`
- [ ] `area: qa-testing`
- [ ] `area: ci-cd`

**Roadmap phase:** <!-- e.g. Phase 1 -->

## What Changed

<!-- The specific changes. Bullet points are fine. -->

-
-

## How This Was Tested

<!-- Tick every level you ran, and say what you actually did. Ties to VV-MTP-01. -->

- [ ] Unit — module tested in isolation
- [ ] Integration — tested across a boundary (API↔DB, frontend↔API, voting↔ledger)
- [ ] System / end-to-end — full journey through the running app
- [ ] Security — auth / RBAC / anonymity checks
- [ ] Manual — steps below

**What I ran:**

## Traceability

<!-- Fill in whichever apply so the change ties back to the frozen design. -->

| Reference | ID |
|---|---|
| Requirement (VV-SRS-01) | e.g. FR-VOTE-07 |
| User story (VV-US-01) | e.g. US-VOTE-05 |
| Acceptance criterion (VV-AC-01) | e.g. AC-VOTE-05.1 |

## Evidence

<!-- UI changes: screenshots or a short clip. Backend: sample request/response or log excerpt. Blockchain: chain-validation output. -->

## Author Checklist

- [ ] The code builds and runs from a clean state
- [ ] I self-reviewed my own diff before requesting review
- [ ] Tests for this change are included and pass
- [ ] No secret, key, or credential is committed (checked `.env` is ignored)
- [ ] No stray `console.log` / debug output left behind
- [ ] Frontend only: verified on a mobile viewport, no console errors
- [ ] Blockchain only: chain validation still passes after this change
- [ ] Documentation updated where this change alters specified behaviour
- [ ] The linked issue's acceptance criteria are satisfied

## Notes for the Reviewer

<!-- Anything worth flagging: a decision you made, a trade-off, an area you want a close look at. -->
