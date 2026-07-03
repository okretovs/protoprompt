# Domain docs

These engineering skills use domain docs to preserve project language, decisions, and constraints across sessions.

## Layout

This repo uses a single-context layout:

```text
CONTEXT.md
docs/adr/
```

Use `CONTEXT.md` for the project glossary, domain concepts, invariants, and workflow notes. Use `docs/adr/` for architectural decisions.

If the repo grows into multiple distinct domains, add `CONTEXT-MAP.md` at the root pointing to each domain-specific `CONTEXT.md` and ADR directory.

## Consumer rules

- Read `CONTEXT.md` before designing, diagnosing, testing, or implementing domain-sensitive work.
- Read relevant ADRs before changing architecture or established module boundaries.
- Add domain terms only when they are real product concepts.
- Record decisions that affect future implementation choices; prefer short ADRs over long essays.
- When a term is ambiguous, ask focused clarification questions.
- Update docs as decisions land; do not leave important domain knowledge only in chat.

## ADR naming

```text
docs/adr/0001-short-title.md
```
