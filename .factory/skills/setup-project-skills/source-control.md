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

Prefer branch names that include the Linear issue identifier:

```text
<LINEAR-ID>-short-slug
```

Example:

```text
ABC-123-add-login-form
```

## Pull requests

Every implementation PR should reference the relevant Linear issue identifier and include:

- What changed
- How it was verified
- Linked Linear issue
- Vercel preview URL, when applicable

After opening or updating a PR, add the PR URL back to the Linear issue when the Linear MCP server is available.
