/**
 * Core domain types for the ProtoPrompt council pipeline.
 *
 * See CONTEXT.md and docs/adr/0002-0006 for the decisions behind this shape.
 * PRO-11 only exercises the `intake` and `build_direction` stages; later
 * stages are typed here so the pipeline doesn't need re-shaping per stage.
 */

export type ScopeMode = "enriched" | "original";

export type CouncilMemberId = "A" | "B" | "C" | "D";

export type StageId =
  | "intake"
  | "build_direction"
  | "data_sources"
  | "app_pages"
  | "components"
  | "mockup_style"
  | "final_prompt";

/** Recommendation state shown to the user. Never "required" (see ADR 0007). */
export type RecommendationState = "recommended" | "optional" | "deferred";

/** Raw recommendation state a model may return, before the required->recommended downgrade. */
export type ModelRecommendationState = RecommendationState | "required";

export type SelectionState = "selected" | "unselected";

export interface StageOption {
  id: string;
  title: string;
  description: string;
  tags: string[];
  recommendationState: RecommendationState;
  whyItFits: string;
  extendedFeature: boolean;
  selectionState: SelectionState;
  /** ASCII wireframe lines (4–7, ~40 cols); only present for `mockup_style` options. */
  wireframe?: string[];
}

export interface StageOptionsResult {
  stage: StageId;
  options: StageOption[];
  assumptions: string[];
}

/**
 * One page's synthesized options for a `grouped_by_page` stage (`components`,
 * `mockup_style`). The chairman returns one `PageGroup` per selected app page.
 */
export interface PageGroup {
  pageTitle: string;
  options: StageOption[];
  assumptions: string[];
}

export interface CouncilCandidate {
  title: string;
  description: string;
  tags: string[];
  extendedFeature: boolean;
  rationale: string;
}

export interface CouncilCandidateResult {
  member: CouncilMemberId;
  candidates: CouncilCandidate[];
}

export interface CouncilReviewNote {
  /** Anonymized reference, e.g. "response_a::0". */
  candidateRef: string;
  assessment: string;
  keep: boolean;
}

export interface CouncilReviewResult {
  member: CouncilMemberId;
  notes: CouncilReviewNote[];
}

export interface CouncilDossier {
  themes: string[];
  assumptions: string[];
}

export type CouncilMode = "fresh" | "dossier";

export interface ProjectState {
  idea: string;
  projectName: string;
  scopeMode: ScopeMode;
  /**
   * Option ids the user has explicitly selected, keyed by `cacheKey(stage, context)`
   * (see `lib/protoprompt/cached-options.ts`). Non-grouped stages use an empty
   * context (`build_direction::`); per-page stages key by page title
   * (`components::Dashboard`).
   */
  selections: Partial<Record<string, string[]>>;
  cachedOptions: Partial<Record<string, StageOptionsResult>>;
  councilDossier?: CouncilDossier;
  councilAssumptions: string[];
}

export function createProjectState(idea: string, projectName: string): ProjectState {
  return {
    idea,
    projectName,
    scopeMode: "enriched",
    selections: {},
    cachedOptions: {},
    councilAssumptions: [],
  };
}
