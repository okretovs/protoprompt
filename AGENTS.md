# Project Agent Instructions

This repository is a Vercel-hosted app managed with Factory, Linear, GitHub, and Vercel.

## Operating model

- Linear is the source of truth for issues, PRDs, triage, and implementation tickets.
- GitHub is used for source control, branches, commits, pull requests, and code review.
- Vercel is used for Preview and Production deployments.
- Factory Droid executes work using repo context, skills, and MCP-connected tools.

Do not create GitHub Issues unless explicitly asked. Planned work belongs in Linear.

## Agent skills

### Issue tracker

Issues, PRDs, triage states, and implementation tickets live in Linear via MCP. Do not create GitHub Issues unless explicitly asked. See `docs/agents/issue-tracker.md`.

### Source control

Source control lives in GitHub. Implementation happens on branches submitted via pull requests linked to the relevant Linear issue. See `docs/agents/source-control.md`.

### Deployment

The app is hosted on Vercel. Pull requests produce preview deployments, and production deploys happen from `main`. See `docs/agents/deployment.md`.

### Triage roles

Linear statuses map to the canonical triage roles in `docs/agents/triage-labels.md`.

### Domain docs

Use `CONTEXT.md` and `docs/adr/` for project language and architectural decisions. See `docs/agents/domain.md`.

## Required workflow

For implementation work:

1. Start from a Linear issue or create one in Linear.
2. Confirm scope, acceptance criteria, dependencies, and verification plan.
3. Create a Git branch named with the Linear issue identifier.
4. Implement the smallest useful vertical slice.
5. Run verification commands.
6. Open or prepare a GitHub PR.
7. Link the GitHub PR and Vercel preview URL back to the Linear issue when available.

## Branch naming

Use:

```txt
<linear-id-lowercase>-<short-slug>
```

Examples:

```txt
app-123-add-auth-callback
web-42-fix-pricing-page-copy
```

## Build and test

Update this section after the real app scripts are known.

```bash
npm run lint
npm run test --if-present
npm run build
```

Use the package manager already present in the repo. Do not switch package managers without explicit approval.

## Source control

- Work on branches, not directly on `main`.
- Keep PRs small and linked to one Linear issue where possible.
- PR descriptions must include the Linear issue ID, verification steps, and preview URL when applicable.
- Do not mix unrelated work in one PR.

## Deployment

- Vercel Preview deployments are used to verify PRs.
- Production deploys come from the configured production branch, normally `main`.
- If deployment behaviour changes, verify both local behaviour and Vercel Preview behaviour.

## Documentation

Use:

- `CONTEXT.md` for project context and product/domain vocabulary.
- `docs/agents/` for agent workflow docs.
- `docs/adr/` for architecture decisions.
- `.factory/rules/` for coding standards.
- `.factory/skills/` for reusable Factory skills.

## Security

- Never commit secrets.
- Never put API keys, tokens, OAuth credentials, database URLs, or private env values in AGENTS.md, docs, rules, skills, or git history.
- Use `.env.local` locally and Vercel Environment Variables for deployments.
- Keep `.env.example` as documentation only.

## Memory and preferences

Droid should use these context files when relevant:

- `/Users/olliekretovs/Documents/Memories/memories.md` for personal preferences that apply across projects.
- `.factory/memories.md` for project-specific memories shared through the repo.
- `CONTEXT.md` for durable product, domain, and architecture context.

Do not store secrets in memory files.

## Coding standards

Follow the conventions documented in:

- `.factory/rules/typescript.md`
- `.factory/rules/testing.md`
- `.factory/rules/security.md`

If a rule conflicts with the codebase, prefer the codebase convention and update the rule only with explicit approval.
