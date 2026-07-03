/**
 * Per-stage option cache helpers (ADR 0003).
 *
 * The flow caches each chairman-synthesized `StageOptionsResult` under
 * `cached_options[stage::context]` so back-navigation is instant and never
 * re-runs the council. PRO-12 stages are non-grouped and use an empty
 * context suffix (`build_direction::`, `data_sources::`, `app_pages::`).
 * PRO-13 will exercise per-page keys (`components::Dashboard`,
 * `mockup_style::Dashboard`); the same helpers cover both.
 *
 * Each helper returns a fresh `ProjectState` rather than mutating in place
 * so this module stays trivially testable at the seam.
 */

import type { ProjectState, StageId, StageOptionsResult } from "@/lib/protoprompt/types";

/** Cache key shape per ADR 0003: `${stage}::${context}` with empty context when none. */
export function cacheKey(stage: StageId, context?: string): string {
  return `${stage}::${context ?? ""}`;
}

/** Returns the cached result for a stage + optional context, or undefined on miss. */
export function getCached(
  project: ProjectState,
  stage: StageId,
  context?: string
): StageOptionsResult | undefined {
  return project.cachedOptions[cacheKey(stage, context)];
}

/** Returns a new `ProjectState` with `result` cached under the stage + context key. */
export function setCached(
  project: ProjectState,
  stage: StageId,
  context: string | undefined,
  result: StageOptionsResult
): ProjectState {
  return {
    ...project,
    cachedOptions: { ...project.cachedOptions, [cacheKey(stage, context)]: result },
  };
}

/**
 * Returns a new `ProjectState` with `assumptions` appended to
 * `councilAssumptions`, preserving the original order and deduplicating
 * against the existing list.
 */
export function appendAssumptions(project: ProjectState, assumptions: string[]): ProjectState {
  if (assumptions.length === 0) {
    return project;
  }
  const seen = new Set(project.councilAssumptions);
  const merged = [...project.councilAssumptions];
  for (const assumption of assumptions) {
    if (seen.has(assumption)) continue;
    seen.add(assumption);
    merged.push(assumption);
  }
  return { ...project, councilAssumptions: merged };
}
