<!-- Repository placement: CONTRIBUTING.md at the repository root. -->

# Contributing & Code Review Standards — VoteVibes

This document defines how work moves through the VoteVibes repository: how branches and commits are named, how pull requests are opened and reviewed, and the conditions a change must meet before it can be merged. It applies to every contributor on every phase of the roadmap.

The goal is that no change reaches a shared branch without passing through the same, predictable process — so that `develop` always builds and `main` always holds a stable, demonstrable milestone.

---

## 1. The Workflow at a Glance

```
Issue  →  Branch  →  Commits  →  Pull Request  →  Review  →  Merge  →  Issue closed
```

Every change starts as a GitHub Issue and ends with that issue closed by a merged pull request. Work is never pushed directly to a shared branch.

---

## 2. Branch Model

The repository uses a two-tier integration model:

```
feature/*  →  develop  →  main
```

- **`main`** — always stable. It holds released, demonstrable milestones only. Day-to-day feature work never targets `main` directly.
- **`develop`** — the shared integration branch. Every change is merged here first, and `develop` must always build.
- **`feature/*`** — short-lived working branches, one per issue, created from `develop` and merged back into `develop` through a pull request.

`main` is updated **only when a stable milestone is ready**, by merging `develop` into `main`. That promotion is a deliberate, agreed step — not part of the routine per-issue flow (see Section 7).

### Working branches

- `develop` and `main` are both protected; neither is committed to directly.
- All work happens on a short-lived branch created from the latest `develop`.
- One branch addresses one issue. Keep branches small and focused.
- Delete the branch after it is merged.

**Branch naming:** `feature/<area>-<short-description>`

Examples:

```
feature/voting-engine-cast-ballot-api
feature/auth-rbac-expired-token-handling
feature/srs-update-fr-vote-07
```

---

## 3. Commit Messages

Commits follow the **Conventional Commits** pattern:

```
type(scope): short imperative subject
```

- **type** — one of `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`, `ci`.
- **scope** — the affected area, e.g. `auth`, `voting`, `blockchain`, `results`.
- **subject** — imperative mood, lower case, no full stop: "add", not "added" or "adds".

Examples:

```
feat(voting): reject ballots against non-active elections
fix(blockchain): recompute previous-hash on chain validation
test(auth): cover expired-token rejection on protected routes
docs(ac): add AC-VOTE-07.2 for simultaneous ballot submission
```

Keep each commit to one logical change. A reviewer should be able to read the history and follow the reasoning.

---

## 4. Opening a Pull Request

- Open the PR against **`develop`** and fill in **every section** of the PR template.
- Link the issue it resolves with `Closes #NN` so the issue closes automatically on merge.
- Apply the matching `type:` and `area:` labels, and set the workflow label to `status: in-review`.
- Request review from the owner of the affected module (Section 5).
- A PR should be reviewable in one sitting. If it is growing large, split it.

Mark the PR as a draft while it is still in progress; request review only when it is ready.

---

## 5. Who Reviews What

Review responsibility follows module ownership. Each PR needs an approving review from the owner of the area it touches. Reviewers are referred to by role, not by name.

| Area label | Reviewed by |
|---|---|
| `area: backend-api`, `area: auth-rbac` | Backend owner |
| `area: frontend-ui`, `area: admin-portal` | Frontend owner |
| `area: blockchain`, `area: voting-engine` | Blockchain owner |
| `area: qa-testing`, `area: ci-cd`, `area: docs` | QA & Admin owner |

A change that spans two areas needs a review from each affected owner. No one approves their own pull request.

---

## 6. What a Reviewer Checks

A review is not a rubber stamp. Before approving, the reviewer confirms:

- **Correctness** — the change does what the linked issue and its acceptance criteria require.
- **Tests** — appropriate unit / integration tests are present and actually exercise the change, not just pass trivially.
- **No secrets** — no key, token, password, or `.env` content is committed.
- **Error handling** — backend changes route errors through the centralized handler and log through Winston.
- **Frontend quality** — no console errors, responsive on a mobile viewport, consistent with the Tailwind design system.
- **Ledger integrity** — blockchain changes leave chain validation passing; hashing and previous-hash linkage are intact.
- **Scope** — the PR does only what it says; unrelated changes are pushed back.
- **Clarity** — naming and structure are readable by the rest of the team.

Reviewers leave specific, actionable comments. Authors resolve each conversation before merge — either by making the change or by replying with the reasoning.

**Turnaround:** aim to review within one working day so no one is blocked waiting.

---

## 7. Conditions for Merge

A `feature/*` pull request may be merged into `develop` only when **all** of the following hold:

- [ ] At least one approving review from the owning module's reviewer
- [ ] All required CI checks are green
- [ ] No unresolved review conversations
- [ ] The branch is up to date with `develop`
- [ ] The PR closes a linked issue
- [ ] The author checklist in the PR template is complete

**Merge method:** squash and merge into `develop`, so `develop` keeps a clean, linear history of one commit per change. Delete the branch on merge.

### Promoting `develop` to `main`

The conditions above govern routine `feature/*` → `develop` pull requests. `develop` is promoted to `main` **only at a stable milestone** — when the phase's exit criteria in the Master Testing Plan (VV-MTP-01, Section 7) are met and the milestone deliverable is demonstrable. That promotion is done as a reviewed `develop` → `main` pull request and agreed by the team.

---

## 8. Definition of Done

A change is done — not merely written — when:

- The behaviour is implemented and passes the owning module's review.
- Unit and, where a boundary is crossed, integration tests are written and passing.
- The acceptance criteria on the linked issue pass against the running system.
- Documentation is updated wherever the change alters specified behaviour (SRS, User Stories, or Acceptance Criteria).
- The accumulated regression set has been re-run for the phase with no new failures.

---

## 9. Issue Hygiene

- Every issue uses one of the three templates; blank issues are disabled.
- Every issue carries one `type:`, one `area:`, and one `status:` label. Bug reports also carry one `severity:` and one `priority:` label.
- The `status:` label is replaced as the issue moves through its lifecycle — never accumulated.
- A defect is closed only after the **reporter** has re-tested the fix and confirmed the original steps now pass. The person who wrote the fix does not close the bug.

The full label taxonomy and the lifecycle diagram are in `labels.md`.
