# Domain docs

These engineering skills use domain docs to preserve project language, decisions, and constraints across sessions.

## Default layout

For a single Vercel app, prefer:

```text
CONTEXT.md
docs/adr/
```

Use `CONTEXT.md` for the project glossary, domain concepts, invariants, and workflow notes. Use `docs/adr/` for architectural decisions.

## Multi-context layout

If the repo grows into multiple distinct domains, add `CONTEXT-MAP.md` at the root. It should point to each domain-specific `CONTEXT.md` and ADR directory.

## Consumer rules

- Read `CONTEXT.md` before designing, diagnosing, testing, or implementing domain-sensitive work.
- Read relevant ADRs before changing architecture or established module boundaries.
- Use `/domain-modeling` when new terminology, rules, or architectural decisions are discovered.
- Use `/grilling` or `/grill-with-docs` when requirements are unclear and need focused questioning.
- Update docs as decisions land; do not leave important domain knowledge only in chat.
