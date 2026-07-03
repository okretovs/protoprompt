# ADR 0003: Three-wave council orchestration and dossier caching

## Status

Accepted

## Context

Each stage needs diverse, reviewed, synthesized options. Running four personas plus review and synthesis for every stage independently would be slow (~30s) and would lose shared context between stages. We also need instant back-navigation and per-page option grouping for the components and mockup stages.

## Decision

Orchestrate the council in **three waves, driven by the frontend**:

- **Wave 1 — Candidates (parallel)**: `runCouncilMemberA..D({ stage, project })` → `CouncilCandidateResult`.
- **Wave 2 — Reviews (parallel)**: anonymize candidates as `response_a..d`, then `reviewByMemberA..D` → `CouncilReviewResult`.
- **Wave 3 — Chairman synthesis**: `runChairman(...)` → `{ results: StageOptionsResult[]; dossier? }`.

Gate on `project.council_dossier`:

- **Missing** → run Waves 1–3 with `mode: 'fresh'`; build the dossier via `collectThemes` + `collectAssumptions` and persist it onto the project.
- **Present** → run Wave 3 only with `mode: 'dossier'`, reusing cached context so stages 2–5 finish in a few seconds.

Per-page stages (`components`, `mockup_style`) are `grouped_by_page`: the chairman returns `page_groups[]`; the frontend picks the group matching the current sub-context and caches all groups under `cached_options[stage::pageTitle]`. Every `StageOptionsResult` is cached under `cached_options[stage::context]`. Chairman-provided `selection_state === 'selected'` seeds the user's selection only if they haven't chosen yet; assumptions append to `project.council_assumptions` deduplicated.

Back/forward navigation during a run must preserve every prior selection and reuse cached options. A completed stage should not regenerate during navigation unless a run-level invalidator, such as scope mode, explicitly clears the cache and dossier.

## Consequences

- First stage pays full council cost; later stages are fast via the cached dossier.
- Caching makes back-navigation instant but requires disciplined invalidation (see ADR 0005).
- Selection preservation is part of the Day 0 completion bar, not a post-MVP enhancement.
- The dossier is the shared source of cross-stage context; its shape is load-bearing for `mode: 'dossier'`.
- Loading UX surfaces the in-flight wave (candidates / reviews / chairman) to keep the agent inspectable.
