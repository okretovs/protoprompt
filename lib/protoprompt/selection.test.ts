import { describe, expect, it } from "vitest";

import { downgradeRequiredOptions, seedDefaultSelection } from "./selection";
import type { ModelStageOptionsResult } from "./selection";
import type { StageOption } from "./types";

describe("downgradeRequiredOptions", () => {
  it("downgrades required to recommended and leaves other states untouched", () => {
    const result: ModelStageOptionsResult = {
      stage: "build_direction",
      assumptions: [],
      options: [
        makeModelOption({ id: "a", recommendationState: "required" }),
        makeModelOption({ id: "b", recommendationState: "optional" }),
      ],
    };

    const downgraded = downgradeRequiredOptions(result);

    expect(downgraded.options[0].recommendationState).toBe("recommended");
    expect(downgraded.options[1].recommendationState).toBe("optional");
  });
});

describe("seedDefaultSelection", () => {
  const options: StageOption[] = [
    makeOption({ id: "a", selectionState: "selected" }),
    makeOption({ id: "b", selectionState: "unselected" }),
    makeOption({ id: "c", selectionState: "selected" }),
  ];

  it("seeds from chairman-selected options when the user hasn't chosen yet", () => {
    expect(seedDefaultSelection(options, undefined, false)).toEqual(["a", "c"]);
  });

  it("does not override the user's existing selection", () => {
    expect(seedDefaultSelection(options, ["b"], true)).toEqual(["b"]);
  });

  it("respects an explicit empty selection made by the user", () => {
    expect(seedDefaultSelection(options, [], true)).toEqual([]);
  });
});

function makeOption(overrides: Partial<StageOption>): StageOption {
  return {
    id: "id",
    title: "Title",
    description: "Description",
    tags: [],
    recommendationState: "recommended",
    whyItFits: "Fits well",
    extendedFeature: false,
    selectionState: "unselected",
    ...overrides,
  };
}

function makeModelOption(
  overrides: Partial<ModelStageOptionsResult["options"][number]>
): ModelStageOptionsResult["options"][number] {
  return { ...makeOption({}), recommendationState: "recommended", ...overrides };
}
