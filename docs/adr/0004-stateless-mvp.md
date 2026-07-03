# ADR 0004: Stateless MVP (no database, no auth)

## Status

Accepted

## Context

The MVP Boundary lens favors the smallest useful app. A full run is a single guided session that produces a markdown prompt the user copies or downloads. `.env.example` includes `AUTH_*` and `DATABASE_URL`, but nothing in the core flow requires accounts or durable storage yet.

## Decision

Ship the MVP **stateless**: all run state (idea, project, selections, `cached_options`, `council_dossier`, `council_assumptions`) lives **client-side**. No database and no authentication in v1. The `AUTH_*` and `DATABASE_URL` entries in `.env.example` remain aspirational documentation only.

The Day 0 MVP requires a user-provided OpenAI key before idea submission. The key is saved in browser `localStorage` so the user can recover from missing server configuration without re-entering it. After submission, the UI hides the masked value to reduce accidental exposure during demos. It is not persisted to a database, cookies, docs, logs, or backend storage.

## Consequences

- No persistence: refresh or navigation away loses the run. Acceptable for MVP; revisit if users need saved sessions.
- No user accounts, so no per-user history, sharing, or quotas at the app layer.
- API routes are effectively stateless request handlers; caching lives in client state passed into each call.
- Missing server `OPENAI_API_KEY` should not block a Day 0 demo if the user supplies a frontend-saved key.
- Adding saved sessions or auth later is a deliberate follow-up that would supersede this ADR.
