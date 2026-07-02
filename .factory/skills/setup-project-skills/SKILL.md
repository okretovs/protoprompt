---
name: setup-project-skills
description: "Configure this repo for the engineering skills: Linear issues via MCP, GitHub source control and PRs, Vercel deployments, triage vocabulary, and domain docs. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup Project Skills

Scaffold the per-repo configuration that the engineering skills assume.

This setup is intentionally opinionated for this project shape:

- **Issue tracker** — Linear via the configured Linear MCP server
- **Source control** — GitHub branches, commits, and pull requests
- **Deployment** — Vercel preview deployments and production deploys from GitHub
- **Triage vocabulary** — Linear statuses or labels mapped to the canonical roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; do not assume:

- `git remote -v` and `.git/config` — confirm the GitHub remote and default branch.
- `AGENTS.md` at the repo root — does it exist? Is there already an `## Agent skills` section?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root.
- `docs/adr/` and any package-level ADR directories.
- `docs/agents/` — does this skill's prior output already exist?
- Vercel configuration files, environment references, and deployment notes, such as `vercel.json`, framework settings, or existing docs.
- Existing Linear identifiers in branch names, commits, PR descriptions, docs, or comments.

### 2. Present findings and ask

Summarise what is present and what is missing. Then walk the user through the decisions **one at a time**. Present a section, get the user's answer, then move to the next. Do not dump all decisions at once.

#### Section A — Linear issue tracker

Explain:

> Issues, PRDs, triage states, implementation tickets, and progress comments live in Linear. Factory Droid should use the configured Linear MCP server for issue operations. GitHub Issues are not the source of truth for planned work.

Confirm:

- The Linear workspace/team/project/cycle to use by default, if the user has one.
- Whether triage roles are represented as Linear **statuses**, **labels**, or a mix.
- Whether to use a canonical implementation-ready role called `ready-for-droid`, or map that role to an existing Linear name.

If the Linear MCP server is not available to the agent, stop and ask the user to connect it before writing issue-tracker instructions that pretend the tool exists.

#### Section B — Source control

Explain:

> GitHub is used for source control, pull requests, checks, and code review. GitHub PRs should reference Linear issues, but GitHub Issues should not be created unless the user explicitly requests an exception.

Confirm:

- Main production branch name.
- Branch naming convention, preferably `<LINEAR-ID>-short-slug`.
- Whether PRs should be linked back to Linear automatically or by explicit comments.

#### Section C — Deployment

Explain:

> Vercel is the deployment surface. GitHub PRs should produce preview deployments. Production deploys happen from the configured production branch.

Confirm:

- Whether preview URLs should be posted back to Linear for UI/deployment-impacting work.
- Any project-specific verification command before PRs are considered ready, such as `npm run lint`, `npm run test`, or `npm run build`.

#### Section D — Domain docs

Explain:

> Some skills read `CONTEXT.md` to learn project language and `docs/adr/` for architectural decisions. They need to know whether the repo has one global context or multiple contexts.

Confirm the layout:

- **Single-context** — one `CONTEXT.md` and `docs/adr/` at the repo root. Most single Vercel apps use this.
- **Multi-context** — `CONTEXT-MAP.md` at the root pointing to per-area `CONTEXT.md` files.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to `AGENTS.md`.
- `docs/agents/issue-tracker.md` using `issue-tracker-linear.md` as the seed.
- `docs/agents/source-control.md` using `source-control.md` as the seed.
- `docs/agents/deployment.md` using `deployment.md` as the seed.
- `docs/agents/triage-labels.md` using `triage-labels.md` as the seed.
- `docs/agents/domain.md` using `domain.md` as the seed.

Let the user edit before writing unless they explicitly asked you to apply the setup directly.

### 4. Write

Create or update `AGENTS.md`. If an `## Agent skills` block already exists, update that block in place rather than appending a duplicate. Do not overwrite user edits to surrounding sections.

Use this block shape:

```markdown
## Agent skills

### Issue tracker

Issues, PRDs, triage states, and implementation tickets live in Linear via MCP. Do not create GitHub Issues unless explicitly asked. See `docs/agents/issue-tracker.md`.

### Source control

Source control lives in GitHub. Implementation work should happen on branches and be submitted through GitHub pull requests linked to the relevant Linear issue. See `docs/agents/source-control.md`.

### Deployment

The app is hosted on Vercel. GitHub pull requests should produce Vercel preview deployments, and production deploys happen from the configured production branch. See `docs/agents/deployment.md`.

### Triage roles

Linear statuses or labels map to the canonical triage roles in `docs/agents/triage-labels.md`.

### Domain docs

Use `CONTEXT.md`, `CONTEXT-MAP.md` when present, and `docs/adr/` for project language and architectural decisions. See `docs/agents/domain.md`.
```

Then write the docs files using the seed templates in this skill folder:

- [issue-tracker-linear.md](./issue-tracker-linear.md) — Linear issue tracker via MCP
- [source-control.md](./source-control.md) — GitHub source-control and PR workflow
- [deployment.md](./deployment.md) — Vercel deployment workflow
- [triage-labels.md](./triage-labels.md) — Linear role/status/label mapping
- [domain.md](./domain.md) — domain doc consumer rules and layout

### 5. Done

Tell the user the setup is complete and list which files were created or updated. Mention that `docs/agents/*.md` can be edited directly later; re-running this skill is only necessary if the workflow changes.
