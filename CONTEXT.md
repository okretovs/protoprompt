# Project Context

## Project summary

`ProtoPrompt` is **Council-guided planning for vibe-coding tools**.

Tagline: _"We turn vibe coding into agentic engineering."_

The user drops in a one-line application idea. An AI Council of four personas deliberates in parallel, the user picks from curated option cards across seven stages, and the app streams back a structured markdown implementation prompt ready to paste into a vibe-coding tool.

## Product goals

- Turn a rough application idea into a polished, build-ready implementation prompt.
- Let users plan by **selecting curated options**, not by writing requirements docs by hand.
- Make the agent feel active and inspectable (visible council "waves"), never mysterious.
- For Day 0, the non-negotiable success moment is completing the full **7-stage flow** end to end.

## Target users

Product-minded builders and internal-tools engineers using vibe-coding tools who want structured planning before generation.

## Current architecture

- Framework: Next.js (App Router)
- UI: Tailwind CSS + shadcn/ui, with a component-scoped `--pp-*` token layer under `.protoprompt-root`
- Runtime: Next.js API routes on Vercel; streaming responses for the final prompt only
- LLM: OpenAI (gpt-5 mini); buffered `.generate` for the council pipeline, `generateStreamRaw` for the final prompt
- OpenAI key handling: server `OPENAI_API_KEY` remains supported; the Day 0 UI must require a user-provided OpenAI key before idea submission. The key is saved in browser `localStorage`, so missing server configuration does not block the full flow.
- Data store: none in MVP (stateless, all state client-side)
- Auth provider: none in MVP
- Hosting: Vercel
- Issue tracker: Linear
- Source control: GitHub

See `docs/adr/` for the decisions behind each of these.

## Flow stages (7)

1. **Your Idea** — read-only summary of the idea + project name, a "New idea" chip that returns to `/`, and a "Convene the council" CTA that advances to stage 2.
2. **Core Functionality (`build_direction`)** — up to 6 options, multi-select unlimited.
3. **Data Sources** — 4–8 options, multi-select unlimited.
4. **App Pages** — 2–8 options, multi-select unlimited.
5. **Components (per page)** — 2–6 options per selected page. One page at a time; Next advances the sub-page, then advances the stage.
6. **Mockup Style (per page)** — 2–6 options per selected page, single-select (radio). Each option includes a compact ASCII wireframe (4–7 lines, ~40 cols) and 2–4 short tags.
7. **Final Prompt** — auto-streaming markdown, with Copy / Download `.md` / Regenerate. The Day 0 quality bar is a prompt that can be used directly in a vibe-coding tool, not merely a sectioned placeholder.

The Continue button changes label contextually: "Next page" (mid per-page stage), "Generate prompt" (last stage before final), else "Continue". Back reverses the same rules.

Day 0 navigation must preserve every prior selection during the session. Back/forward movement should not regenerate a completed stage unless the user explicitly changes a run-level invalidator such as scope mode.

## Council & orchestration

Four peer personas, each with a distinct lens:

- **Council Member A — MVP Boundary**: smallest useful app; skeptical of bloat.
- **Council Member B — Workflow Clarity**: guided journey; readable, actionable pages.
- **Council Member C — Data & Implementation**: buildable; realistic data assumptions.
- **Council Member D — UI Readiness**: concrete, unambiguous UI direction.

Each persona has two prompts: `basePrompt` (candidate generation) and `reviewPrompt` (anonymous review). All personas share `SHARED_COUNCIL_RULES` and either `BASE_OUTPUT_RULES` or `REVIEW_OUTPUT_RULES`.

Three-wave orchestration (frontend-driven), gated by `project.council_dossier`:

- **Wave 1 — Candidates (parallel)**: `runCouncilMemberA..D` each return a JSON candidate set for the current stage.
- **Wave 2 — Reviews (parallel)**: candidates anonymized as `response_a..d`, then `reviewByMemberA..D` review them. Reviewer failures are non-fatal.
- **Wave 3 — Chairman synthesis**: `runChairman({ mode: 'fresh', ... })` returns `{ results, dossier }`; the dossier is persisted onto the project. If a dossier already exists, only Wave 3 runs in `mode: 'dossier'` (stages 2–5 finish in a few seconds instead of ~30).

Per-page stages (`components`, `mockup_style`) are `grouped_by_page`; the chairman returns `page_groups[]` and all groups are cached under `cached_options[stage::pageTitle]`. Every `StageOptionsResult` is cached under `cached_options[stage::context]` so back-navigation is instant.

## Scope modes

- **Enriched Building** (default) — council may propose useful adjacent capabilities, tagged `extended_feature` and shown with a violet "Extended Feature" badge.
- **Original Scope** — council must not introduce anything beyond what the idea describes.

Changing scope wipes `cached_options` and `council_dossier`, then re-runs the current stage from scratch.

## Domain vocabulary

| Term | Meaning | Notes |
|---|---|---|
| AI Council | Four peer personas that deliberate on each stage | Members A–D |
| Council Member A/B/C/D | MVP Boundary / Workflow Clarity / Data & Implementation / UI Readiness | Distinct lenses |
| `basePrompt` / `reviewPrompt` | Per-persona prompts for candidate generation vs anonymous review | |
| `SHARED_COUNCIL_RULES` | Rules shared by all personas | |
| `BASE_OUTPUT_RULES` / `REVIEW_OUTPUT_RULES` | Output contracts for base vs review passes | |
| Wave 1 / 2 / 3 | Candidates → Reviews → Chairman synthesis | Frontend-driven |
| Chairman | Synthesizes strongest ideas into stage options | Modes `fresh` / `dossier` |
| `council_dossier` | Cached council context reused across later stages | Enables fast stages 2–5 |
| `CouncilCandidateResult` | A member's candidate set for a stage | Parsed via `parseCouncilCandidateResponse` |
| `CouncilReviewResult` | A member's anonymous review | Parsed via `parseCouncilReviewResponse` |
| `StageOptionsResult` | Chairman's synthesized options for a stage | Cached in `cached_options` |
| `page_groups[]` | Per-page option groups for per-page stages | `parseGroupedStageResponse` |
| `cached_options[stage::context]` | Cache key for instant back-navigation | `stage::pageTitle` for per-page |
| `council_assumptions` | Deduplicated assumptions surfaced to the user | Appended per run |
| Scope mode | Enriched Building (default) vs Original Scope | Change wipes cache + dossier |
| `extended_feature` | Adjacent capability beyond the raw idea | Violet "Extended Feature" badge |
| User OpenAI key | A user-entered API key used for the current run when needed | Required before idea submit; saved in browser `localStorage`; hidden after submission |
| `build_direction` | Stage 2 core-functionality selections | Multi-select |
| OptionCard | Core UI primitive for a curated option | Multi-select / radio / mockup variants |
| Recommendation state | Recommended / Optional / Deferred | Never Required (downgraded to Recommended) |
| "Why it fits" | One-sentence rationale shown in a HoverCard | |
| Final prompt | Streamed markdown operating brief | Fixed H2 sections; must be directly usable for Day 0 |

## Final prompt sections

`generateFinalPrompt` streams markdown with fixed H2 sections: App Name, Product Objective, Target Users, MVP Scope, Build Direction, Data Sources, Pages & Navigation, Features by Page, Components by Page, Mockup Direction by Page, Data Model, Workflows, User Roles & Permissions, Integrations, UI & Design Direction, Design Principles, Validation Rules, Empty States, Error States, Acceptance Criteria, Implementation Notes.

Day 0 final-prompt acceptance requires the streamed brief to be directly usable as an implementation prompt in a vibe-coding tool.

## Failure handling

- Wave 1 candidate failure is **fatal** for the stage (user retries).
- Wave 2 reviewer failures are **non-fatal** (chairman proceeds with fewer reviews).
- Chairman failure or unparseable JSON: **auto-retry once** (repair pass), then fatal.
- Final-prompt stream failure: **auto-resume/retry once**, then error.
- Transient OpenAI errors: **one silent auto-retry**, then manual "Retry without cache" (bypasses cache).

## Known constraints

- Linear is the source of truth for planned work; GitHub Issues are not used for planning.
- Vercel Preview deployments are the primary UI/deployment verification surface.
- MVP is stateless: no database, no auth.
- OpenAI is the sole LLM provider (gpt-5 mini).
- User-provided OpenAI keys are allowed for Day 0 resilience and are saved in browser `localStorage`; they must not be logged, committed, written to docs, or persisted on the backend.
- Cards over forms: the user selects rather than writes. Options are never marked Required.
- Within a run, back/forward navigation must preserve all prior selections and use cached stage options where available.
- Orange is a signal color, not decoration. Avoid generic SaaS and AI-cliché visuals.
- Secrets must not be committed.

## Open questions

- Intake stage details: idea input UX, project-name derivation, and stage-1 validation.
- Non-functionals: OpenAI rate limits, cost budget, and latency targets for gpt-5 mini.
- Exact JSON schemas for candidate / review / dossier / stage-options payloads.
