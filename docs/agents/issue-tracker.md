# Issue tracker: Linear via MCP

Issues, PRDs, triage states, implementation tickets, and progress comments for this repo live in Linear.

Use the configured Linear MCP server for issue operations. Do not create GitHub Issues unless the user explicitly asks for an exception.

## Rules

- Treat Linear as the source of truth for planned work.
- Use GitHub only for source control, branches, commits, pull requests, code review, and check results.
- Link GitHub branches, commits, pull requests, and Vercel preview URLs back to the relevant Linear issue.
- Preserve Linear team, project, cycle, status, priority, assignee, and label conventions.
- If the Linear MCP server is unavailable, stop and ask the user to connect it. Do not invent issue IDs or pretend an issue was created.

## Common operations

Use Linear MCP tools to:

- Find issues by URL, identifier, title, team, project, cycle, label, assignee, or status.
- Read the full issue body, comments, labels, status, project, priority, relations, and links.
- Create PRDs and implementation issues from approved plans.
- Add comments with progress, decisions, blockers, and verification notes.
- Move issues between triage states.
- Apply or map the triage roles from `docs/agents/triage-labels.md`.
- Link related GitHub branches, commits, PRs, and Vercel preview URLs.

## Issue references

Prefer Linear identifiers such as `ABC-123`.

If the user gives a bare number like `#42`, do not assume it is a Linear issue. Search by title/context or ask for the Linear identifier unless the current conversation clearly identifies the issue.

## Pull requests

GitHub PRs are implementation artifacts linked to Linear issues; they are not the issue tracker.

When implementation starts:

- Create or use a branch named from the Linear issue identifier and a short slug, for example `abc-123-add-login-form`.
- Mention the Linear issue in the branch name, commit messages when appropriate, and PR body.
- Add the GitHub PR URL back to the Linear issue.
- Add the Vercel preview URL back to the Linear issue when UI or deployment verification matters.

## PRDs

When a PRD is created, publish it to Linear as the source-of-truth issue or parent issue. If implementation is split, create child or related Linear issues and link them to the PRD issue.
