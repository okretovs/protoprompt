import { describe, expect, it } from "vitest";

import { cacheKey } from "./cached-options";
import { createProjectState } from "./types";
import { downgradeRequiredOptions, persistDefaultSelection, seedDefaultSelection } from "./selection";
import type { ModelStageOptionsResult } from "./selection";
import type { StageOption } from "./types";

const options: StageOption[] = [
  makeOption({ id: "a", selectionState: "selected" }),
  makeOption({ id: "b", selectionState: "unselected" }),
  makeOption({ id: "c", selectionState: "selected" }),
];

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

describe("persistDefaultSelection", () => {
  it("stores chairman-selected defaults so later stages can derive selected pages", () => {
    const project = createProjectState("idea", "Fieldnotes");

    const result = persistDefaultSelection(project, "app_pages", options);

    expect(result.selectedIds).toEqual(["a", "c"]);
    expect(result.project.selections[cacheKey("app_pages")]).toEqual(["a", "c"]);
  });

  it("does not overwrite an existing user selection", () => {
    const project = {
      ...createProjectState("idea", "Fieldnotes"),
      selections: { [cacheKey("app_pages")]: ["b"] },
    };

    const result = persistDefaultSelection(project, "app_pages", options);

    expect(result.selectedIds).toEqual(["b"]);
    expect(result.project.selections[cacheKey("app_pages")]).toEqual(["b"]);
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
