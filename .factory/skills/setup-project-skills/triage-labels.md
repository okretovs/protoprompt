# Triage roles

Map these canonical roles to the exact Linear statuses or labels used by this workspace.

| Canonical role | Linear status/label | Meaning |
|---|---|---|
| `bug` | `Bug` | Something is broken |
| `enhancement` | `Enhancement` | New feature or improvement |
| `needs-triage` | `Triage` | Needs maintainer evaluation |
| `needs-info` | `Needs Info` | Waiting on reporter or user clarification |
| `ready-for-droid` | `Ready for Droid` | Fully specified and ready for Factory Droid implementation |
| `ready-for-human` | `Ready for Human` | Needs human implementation or judgment |
| `wontfix` | `Won't Fix` | Will not be actioned |

Prefer Linear statuses for state roles when the workspace uses a workflow state machine. Use labels instead if the workspace already models these as labels.

When a skill mentions a canonical role, use the corresponding Linear status or label from this table. Do not create duplicate statuses or labels with similar names without asking.
