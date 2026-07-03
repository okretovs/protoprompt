/**
 * Stage machine for the ProtoPrompt council flow (PRO-12).
 *
 * Defines the ordered list of multi-select stages, forward/back
 * transitions, and context-aware Continue / Back labels. PRO-12 keeps the
 * labels simple ("Continue" / "Back") for the multi-select stages; the
 * per-page sub-context labels ("Next page", "Generate prompt") are added in
 * PRO-13 against the same surface.
 *
 * Pure logic with no React or OpenAI-client dependencies so it can be
 * exercised directly in tests.
 */

import type { StageId } from "@/lib/protoprompt/types";

/**
 * Ordered list of multi-select stages. The intake stage ("intake") is not
 * driven by this machine — the page handles it separately. The final
 * "final_prompt" stage is rendered when this machine emits `null` from
 * `nextStage`.
 */
export const MULTI_SELECT_STAGES: StageId[] = [
  "build_direction",
  "data_sources",
  "app_pages",
];

export interface SubContext {
  /** Per-page stage sub-context (e.g. the page title). Undefined for non-grouped stages. */
  pageTitle?: string;
}

/** Returns the next stage in the flow, or `null` when the flow ends. */
export function nextStage(current: StageId, subContext?: SubContext): StageId | null {
  if (subContext?.pageTitle !== undefined) {
    return current;
  }
  const index = MULTI_SELECT_STAGES.indexOf(current);
  if (index === -1 || index === MULTI_SELECT_STAGES.length - 1) {
    return null;
  }
  return MULTI_SELECT_STAGES[index + 1];
}

/** Returns the previous stage, or the current stage when already at the first one. */
export function previousStage(current: StageId, subContext?: SubContext): StageId {
  if (subContext?.pageTitle !== undefined) {
    return current;
  }
  const index = MULTI_SELECT_STAGES.indexOf(current);
  if (index <= 0) {
    return current;
  }
  return MULTI_SELECT_STAGES[index - 1];
}

/** Returns the Continue button label for a given stage + sub-context. */
export function continueLabel(current: StageId, subContext?: SubContext): string {
  if (subContext?.pageTitle !== undefined) {
    return "Next page";
  }
  return "Continue";
}

/** Returns the Back button label for a given stage. */
export function backLabel(): string {
  return "Back";
}

/** True when the page should render a Back button for the given stage. */
export function canGoBack(current: StageId): boolean {
  return MULTI_SELECT_STAGES.indexOf(current) > 0;
}
