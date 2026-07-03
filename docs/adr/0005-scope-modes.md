# ADR 0005: Scope modes and cache invalidation

## Status

Accepted

## Context

Users differ in how much the council should expand on their idea. Some want a strict, faithful build; others want the council to surface useful adjacent capabilities. Because scope changes the council's instructions, previously generated options and the shared dossier become invalid when scope changes.

## Decision

Provide two **scope modes**:

- **Enriched Building** (default) — the council may propose useful adjacent capabilities, tagged `extended_feature` and shown with a violet "Extended Feature" badge on the card.
- **Original Scope** — the council must not introduce anything beyond what the idea describes.

Changing the scope mode **wipes `cached_options` and `council_dossier`**, then re-runs the current stage from scratch with the new scope.

## Consequences

- Scope is a global, run-level setting that materially changes council output; it cannot be applied retroactively without regeneration.
- Cache invalidation on scope change is mandatory to avoid mixing options generated under different scopes.
- Extended features are always visibly labeled so users can tell core from adjacent suggestions.
- Re-running after a scope change re-incurs full council cost for the current stage.
