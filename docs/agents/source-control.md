# Source control: GitHub

Source control for this repo lives in GitHub.

Use GitHub for:

- branches
- commits
- pull requests
- code review
- CI/check results
- links to Vercel preview deployments

Do not use GitHub Issues as the issue tracker unless explicitly instructed. Planned work lives in Linear.

## Branches

Work on branches, never directly on `main`. Use lowercase branch names that include the Linear issue identifier:

```text
<linear-id-lowercase>-short-slug
```

Example:

```text
app-123-add-login-form
```

## Pull requests

Every implementation PR should reference the relevant Linear issue identifier and include:

- What changed
- How it was verified
- Linked Linear issue
- Vercel preview URL, when applicable

After opening or updating a PR, automatically add the PR URL back to the Linear issue when the Linear MCP server is available. Add the Vercel preview URL back to the Linear issue as well for UI or deployment-impacting work.

Keep branches and PRs small enough to review, and do not mix unrelated work in one PR.
