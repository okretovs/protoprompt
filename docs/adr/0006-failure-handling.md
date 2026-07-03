# ADR 0006: Council failure handling and retry policy

## Status

Accepted

## Context

The pipeline makes many OpenAI calls per stage across parallel waves plus a streamed final prompt. Calls can fail transiently, return unparseable JSON, or drop mid-stream. Behavior must stay predictable and recoverable without a database, and the UI must keep the system inspectable.

## Decision

Per-wave failure policy:

- **Wave 1 — Candidates**: a failed `runCouncilMemberA..D` call is **fatal** for the stage. Show an error card; the user retries the stage.
- **Wave 2 — Reviews**: reviewer failures are **non-fatal**. The chairman proceeds with fewer reviews.
- **Wave 3 — Chairman**: chairman failure or unparseable JSON triggers **one automatic retry (repair pass)**; if it still fails, the stage is fatal.
- **Final prompt stream**: a mid-stream failure triggers **one automatic resume/retry**; if it still fails, show an error.

Global retry policy: **one silent auto-retry on transient OpenAI errors**, then fall back to **manual retry**. The manual "Retry without cache" action **bypasses the cache** (`cached_options` / dossier) so a fresh run is forced.

Error UX: glass error cards with amber/orange signal accents, short direct copy ("Generation failed", "Retry without cache", "Could not resolve options", "Try again"), and no alarming red-heavy panels unless the failure is destructive.

## Consequences

- Candidate failures fail fast rather than synthesizing from incomplete input; review failures degrade gracefully.
- The single repair retry on the chairman absorbs most transient JSON/parse issues without user action.
- Cache-bypassing retry guarantees a clean regeneration when cached context is suspect.
- No automatic exponential backoff in MVP; repeated transient failures surface to the user quickly.
