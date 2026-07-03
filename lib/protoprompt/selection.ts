import type {
  ModelRecommendationState,
  PageGroup,
  StageOption,
  StageOptionsResult,
} from "@/lib/protoprompt/types";

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
