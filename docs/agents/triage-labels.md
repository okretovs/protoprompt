# Triage roles

The ProtoPrompt Linear team models triage roles as workflow **statuses**. Use these exact status names.

| Canonical role | Linear status | Status type |
|---|---|---|
| `needs-triage` | Triage | backlog |
| `needs-info` | Needs Info | backlog |
| `ready-for-droid` | Ready for Droid | unstarted |
| `ready-for-human` | Ready for Human | unstarted |
| `in-progress` | In Progress | started |
| `in-review` | In Review | started |
| `done` | Done | completed |
| `wontfix` | Won't Fix | canceled |
| `duplicate` | Duplicate | duplicate |

When a skill mentions a canonical role, use the corresponding Linear status from this table. Do not create duplicate statuses with similar names without asking.

## Notes

- `ready-for-droid` marks issues that are fully specified and ready for Factory Droid implementation.
- `ready-for-human` marks issues that need human implementation or judgment.
- If you need to categorize work by type (bug, feature, docs, refactor, chore, security, performance, ui, backend), use Linear labels to supplement statuses. Confirm the label exists before creating a new one.
