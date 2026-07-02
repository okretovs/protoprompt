---
name: implement
description: Implement a piece of work based on a PRD or Linear issue.
disable-model-invocation: true
---

# Implement

Implement the work described by the user, PRD, or Linear issue.

## Process

1. Read the source of truth: the Linear issue, PRD, linked docs, relevant ADRs, and `CONTEXT.md`.
2. Confirm the intended behaviour, acceptance criteria, and out-of-scope items.
3. Create or use a GitHub branch that includes the Linear issue identifier when one exists.
4. Work in small vertical slices. Prefer `/tdd` when expected behaviour is clear.
5. Run the repo's verification commands, such as lint, tests, and build. Use the actual commands defined by the repo.
6. For UI or deployment-impacting changes, verify locally and, when available, against the Vercel preview deployment.
7. Summarize the diff, verification results, known risks, and any skipped checks.
8. Use `/review` to review the work against repo standards and the originating Linear issue/PRD before asking for final review.

Do not mark the Linear issue complete unless the user explicitly asks you to do so.
