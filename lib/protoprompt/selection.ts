import type {
  ModelRecommendationState,
  PageGroup,
  ProjectState,
  StageOption,
  StageOptionsResult,
  StageId,
} from "@/lib/protoprompt/types";
import { cacheKey } from "@/lib/protoprompt/cached-options";

export type ModelOption = Omit<StageOption, "recommendationState"> & {
  recommendationState: ModelRecommendationState;
};

export interface ModelStageOptionsResult extends Omit<StageOptionsResult, "options"> {
  options: ModelOption[];
}

export interface ModelPageGroup extends Omit<PageGroup, "options"> {
  options: ModelOption[];
}

/** ADR 0007: a model-returned "required" is downgraded to "recommended"; no option is ever Required. */
function downgradeOptions(options: ModelOption[]): StageOption[] {
  return options.map((option) => ({
    ...option,
    recommendationState: option.recommendationState === "required" ? "recommended" : option.recommendationState,
  }));
}

/** ADR 0007: a model-returned "required" is downgraded to "recommended"; no option is ever Required. */
export function downgradeRequiredOptions(result: ModelStageOptionsResult): StageOptionsResult {
  return { ...result, options: downgradeOptions(result.options) };
}

/** Same downgrade, applied to a single `grouped_by_page` page group. */
export function downgradeRequiredOptionsInGroup(group: ModelPageGroup): PageGroup {
  return { ...group, options: downgradeOptions(group.options) };
}

/**
 * Chairman-provided `selection_state === "selected"` seeds the user's selection
 * only when the user hasn't chosen for this stage yet.
 */
export function seedDefaultSelection(
  options: StageOption[],
  existingSelection: string[] | undefined,
  hasUserChosen: boolean
): string[] {
  if (hasUserChosen) {
    return existingSelection ?? [];
  }
  return options.filter((option) => option.selectionState === "selected").map((option) => option.id);
}

export function persistDefaultSelection(
  project: ProjectState,
  stage: StageId,
  options: StageOption[],
  context?: string
): { project: ProjectState; selectedIds: string[] } {
  const key = cacheKey(stage, context);
  const existing = project.selections[key];
  const hasUserChosen = existing !== undefined;
  const selectedIds = seedDefaultSelection(options, existing, hasUserChosen);

  if (hasUserChosen) {
    return { project, selectedIds };
  }

  return {
    project: {
      ...project,
      selections: { ...project.selections, [key]: selectedIds },
    },
    selectedIds,
  };
}
