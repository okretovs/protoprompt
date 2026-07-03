/**
 * App-page derivation for the per-page stages (`components`, `mockup_style`).
 *
 * Per-page stages iterate the titles of the app pages the user selected in
 * the `app_pages` stage. Selections there are stored as option ids, so this
 * resolves them to titles via the cached `app_pages` result, preserving
 * that result's option order.
 */

import { cacheKey, getCached } from "@/lib/protoprompt/cached-options";
import type { ProjectState } from "@/lib/protoprompt/types";

/** Titles of the selected app pages, in `app_pages` option order. Empty until `app_pages` has run. */
export function selectedPageTitles(project: ProjectState): string[] {
  const cached = getCached(project, "app_pages");
  if (!cached) return [];
  const selectedIds = new Set(project.selections[cacheKey("app_pages")] ?? []);
  return cached.options.filter((option) => selectedIds.has(option.id)).map((option) => option.title);
}
