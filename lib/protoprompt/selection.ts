import type { ModelRecommendationState, StageOption, StageOptionsResult } from "@/lib/protoprompt/types";

type ModelOption = Omit<StageOption, "recommendationState"> & {
  recommendationState: ModelRecommendationState;
};

export interface ModelStageOptionsResult extends Omit<StageOptionsResult, "options"> {
  options: ModelOption[];
}

/** ADR 0007: a model-returned "required" is downgraded to "recommended"; no option is ever Required. */
export function downgradeRequiredOptions(result: ModelStageOptionsResult): StageOptionsResult {
  return {
    ...result,
    options: result.options.map((option) => ({
      ...option,
      recommendationState: option.recommendationState === "required" ? "recommended" : option.recommendationState,
    })),
  };
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
