---
name: choose-engineering-flow
description: Help choose the right engineering skill or workflow for the current situation. A router over the user-invoked skills in this repo.
disable-model-invocation: true
---

# Choose Engineering Flow

Use this when the user is not sure which skill to run next.

A **flow** is a path through the skills. Most product work follows one main flow, with separate routes for triage, review, debugging, architecture upkeep, and conflict resolution.

## Precondition

Run **`/setup-project-skills`** once per repo before relying on issue, PR, deployment, or domain-doc workflows. It records the project assumptions that the other skills read:

- Linear via MCP for issues and PRDs
- GitHub for source control and pull requests
- Vercel for preview and production deployment
- `AGENTS.md`, `CONTEXT.md`, `docs/agents/*`, and `docs/adr/*` for repo guidance

## Main flow: idea → implementation

Use this when the user has a feature idea, product change, or design problem that needs to become code.

1. **`/grill-with-docs`** — sharpen the idea through interview while updating the project domain model in `CONTEXT.md` and ADRs.
2. **Branch — do you need runnable evidence?**
   - If a question needs to be seen or executed, use **`/prototype`** to create throwaway code that answers the question.
   - Bring the result back into the main conversation as a concise note: what was tested, what was learned, and what decision changed.
3. **Branch — is this a multi-ticket build?**
   - **Yes** → **`/to-prd`** to synthesize the product requirement → **`/to-issues`** to create independent Linear issues.
   - **No** → **`/implement`** in the current context or from a single Linear issue.
4. **After implementation** → **`/review`** to compare the diff against repo standards and the originating Linear issue/PRD.

## Context hygiene

Keep the grilling, PRD, and issue-splitting phases in one continuous context where possible so the decisions build on the same understanding. For long work, create a short handoff note in the repo or in Linear before starting a fresh session.

For implementation, prefer one fresh session per Linear issue. Each session should read the issue, relevant docs, ADRs, and linked PRD rather than relying on stale chat memory.

## Triage route

Use **`/triage`** when work arrives raw in Linear: bug reports, requests, unclear tasks, or items that need categorising.

Triage is for issues that were not already prepared by `/to-issues`. Issues produced by `/to-issues` should already be ready for Droid implementation unless the user says otherwise.

## Debugging route

Use **`/diagnosing-bugs`** when something is broken, failing, slow, flaky, or unexplained. It enforces a disciplined loop: reproduce, minimise, hypothesise, instrument, fix, and regression-test.

## Test-first route

Use **`/tdd`** when the user wants to implement a feature or fix a bug test-first. It works best for vertical slices where the desired external behaviour is already known.

## Architecture route

Use **`/improve-codebase-architecture`** when the project needs upkeep rather than a specific feature. It scans for shallow modules, poor seams, duplication, and agent-unfriendly structure, then uses `/grilling` and `/domain-modeling` to turn a selected opportunity into a concrete plan.

Use **`/codebase-design`** when another skill needs shared vocabulary for deep modules, interfaces, seams, adapters, leverage, and locality.

Use **`/domain-modeling`** when project language, rules, or architectural decisions need to be clarified and written down.

## Review and maintenance

- **`/review`** — review a branch, PR, or work-in-progress diff against standards and the originating Linear issue/PRD.
- **`/resolving-merge-conflicts`** — resolve an in-progress merge or rebase conflict by tracing the intent behind each side.

## Standalone helpers

- **`/grilling`** — interview the user one question at a time about a plan or design.
- **`/grill-with-docs`** — run `/grilling` while updating `CONTEXT.md` and ADRs through `/domain-modeling`.
- **`/prototype`** — build throwaway logic or UI variations to answer a specific design question.
