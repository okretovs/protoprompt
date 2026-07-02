---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable Linear issues using tracer-bullet vertical slices.
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

The Linear issue tracker and triage vocabulary should have been provided to you — run `/setup-project-skills` if `docs/agents/issue-tracker.md` or `docs/agents/triage-labels.md` is missing.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a Linear issue identifier, Linear URL, or PRD reference as an argument, fetch it through the Linear MCP server and read its full body, comments, labels/status, project, and links.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>

- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Any prefactoring should be done first

</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the issues to Linear

For each approved slice, create a Linear issue using the configured Linear MCP server. Use the issue body template below. These issues are considered ready for Factory Droid, so apply the mapped `ready-for-droid` status or label unless instructed otherwise.

Publish issues in dependency order (blockers first) so you can reference real Linear identifiers in the "Blocked by" field. Link child issues back to the parent PRD or source issue when applicable.

<issue-template>
## Parent

A reference to the parent Linear issue or PRD issue, if the source was an existing issue. Otherwise omit this section.

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] GitHub PR is opened against the correct base branch.
- [ ] Vercel preview deployment is generated for UI or deployment-impacting changes.
- [ ] Build, lint, and relevant tests pass, or skipped checks are explained.

## Blocked by

- A reference to the blocking Linear issue, if any

Or "None - can start immediately" if no blockers.

## Delivery

- GitHub branch:
- GitHub PR:
- Vercel preview:

</issue-template>

Do NOT close or modify any parent issue unless the user explicitly asks.
