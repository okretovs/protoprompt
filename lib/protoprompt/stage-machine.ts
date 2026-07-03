/**
 * Stage machine for the ProtoPrompt council flow (PRO-12, extended PRO-13).
 *
 * Defines the ordered list of stages driven by this machine and the
 * forward/back transitions between them, plus context-aware Continue / Back
 * labels. The intake stage ("intake") is not driven by this machine — the
 * page handles it separately. The final "final_prompt" stage is rendered
 * when this machine emits `null` from `nextStage`.
 *
 * Per-page stages (`components`, `mockup_style`) are entered/exited through
 * the same `nextStage` / `previousStage` transitions as any other stage; the
 * sub-page navigation *within* a per-page stage (iterating the selected app
 * pages) is owned by the stage's own component (`PerPageStage`) and never
 * crosses this module — it only calls into `continueLabel` / `canGoBack`
 * with a `SubContext` to render the right label while it's mid-stage.
 *
 * Pure logic with no React or OpenAI-client dependencies so it can be
 * exercised directly in tests.
 */

import type { StageId } from "@/lib/protoprompt/types";

/** Ordered list of unlimited multi-select stages (no per-page sub-navigation). */
export const MULTI_SELECT_STAGES: StageId[] = ["build_direction", "data_sources", "app_pages"];

/** Ordered list of per-page stages (`grouped_by_page`, ADR 0003). */
export const PER_PAGE_STAGES: StageId[] = ["components", "mockup_style"];

/** Full stage order this machine sequences, from the first multi-select stage through the last per-page stage. */
export const STAGE_SEQUENCE: StageId[] = [...MULTI_SELECT_STAGES, ...PER_PAGE_STAGES];

/** True when `stage` is one of the `grouped_by_page` stages. */
export function isPerPageStage(stage: StageId): boolean {
  return (PER_PAGE_STAGES as StageId[]).includes(stage);
}

export interface SubContext {
  /** Zero-based index of the currently-viewed page within a per-page stage. */
  pageIndex: number;
  /** Total number of selected app pages being iterated. */
  totalPages: number;
}

/** Returns the next stage in the flow, or `null` when the flow ends (the caller should render `final_prompt`). */
export function nextStage(current: StageId): StageId | null {
  const index = STAGE_SEQUENCE.indexOf(current);
  if (index === -1 || index === STAGE_SEQUENCE.length - 1) {
    return null;
  }
  return STAGE_SEQUENCE[index + 1];
}

/** Returns the previous stage, or the current stage when already at the first one. */
export function previousStage(current: StageId): StageId {
  const index = STAGE_SEQUENCE.indexOf(current);
  if (index <= 0) {
    return current;
  }
  return STAGE_SEQUENCE[index - 1];
}

/** Returns the Continue button label for a stage, optionally mid a per-page sub-context. */
export function continueLabel(current: StageId, subContext?: SubContext): string {
  if (subContext) {
    const isLastPage = subContext.pageIndex >= subContext.totalPages - 1;
    if (!isLastPage) return "Next page";
    return current === PER_PAGE_STAGES[PER_PAGE_STAGES.length - 1] ? "Generate prompt" : "Continue";
  }
  return "Continue";
}

/** Returns the Back button label for a given stage. */
export function backLabel(): string {
  return "Back";
}

/** True when the page should render an enabled Back button for the given stage + sub-context. */
export function canGoBack(current: StageId, subContext?: SubContext): boolean {
  if (subContext && subContext.pageIndex > 0) {
    return true;
  }
  return STAGE_SEQUENCE.indexOf(current) > 0;
}
