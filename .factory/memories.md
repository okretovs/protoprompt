# Project Memories

This file is for durable project-level context that should be shared with collaborators and Factory Droid.

## Architecture decisions

- This app is hosted on Vercel.
- Linear is the source of truth for issues, PRDs, triage, and planning.
- GitHub is used for source control, branches, commits, pull requests, and checks.
- GitHub Issues are not used unless explicitly requested.

## Known constraints

- No auth is currently planned.
- No database is currently planned.
- Environment variables should be added only when the app actually reads them.

## Known issues

- Add recurring project-specific issues here when they become durable context.
