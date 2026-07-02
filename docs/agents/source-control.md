# Source control: GitHub

GitHub is the source control and PR review system.

## Rules

- GitHub Issues are not the issue tracker.
- Work should happen on branches.
- Pull requests should reference the relevant Linear issue ID.
- PRs should include a summary, verification steps, risk, and preview URL when applicable.
- Keep branches and PRs small enough to review.

## Branch names

Use:

```txt
<linear-id-lowercase>-<short-slug>
```

Example:

```txt
app-123-add-settings-page
```

## PR checklist

- Linear issue linked.
- Summary explains user-visible change.
- Verification steps are listed.
- Vercel preview URL is included for UI/deployment changes.
- Risks and rollback notes are included for non-trivial changes.
