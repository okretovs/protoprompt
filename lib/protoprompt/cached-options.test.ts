import { describe, expect, it } from "vitest";

import { appendAssumptions, cacheKey, getCached, setCached } from "./cached-options";
import { createProjectState } from "./types";
import type { StageOptionsResult } from "./types";

function makeResult(stage: StageOptionsResult["stage"], stageIndex: number): StageOptionsResult {
  return {
    stage,
    assumptions: [],
    options: [
      {
        id: `${stage}-0-option-${stageIndex}`,
        title: `Option ${stageIndex}`,
        description: "",
        tags: [],
        recommendationState: "recommended",
        whyItFits: "",
        extendedFeature: false,
        selectionState: "unselected",
      },
    ],
  };
}

describe("cacheKey", () => {
  it("uses stage::context when context is provided", () => {
    expect(cacheKey("build_direction")).toBe("build_direction::");
    expect(cacheKey("build_direction", "")).toBe("build_direction::");
    expect(cacheKey("components", "Dashboard")).toBe("components::Dashboard");
  });
});

describe("getCached / setCached", () => {
  it("returns undefined on a cache miss", () => {
    const project = createProjectState("idea", "Fieldnotes");
    expect(getCached(project, "build_direction")).toBeUndefined();
  });

  it("round-trips a cached result", () => {
    const project = createProjectState("idea", "Fieldnotes");
    const result = makeResult("build_direction", 0);

    const updated = setCached(project, "build_direction", undefined, result);

    expect(getCached(updated, "build_direction")).toEqual(result);
  });

  it("keeps unrelated cache entries intact", () => {
    const project = createProjectState("idea", "Fieldnotes");
    const first = setCached(project, "build_direction", undefined, makeResult("build_direction", 0));
    const second = setCached(first, "data_sources", undefined, makeResult("data_sources", 1));

    expect(getCached(second, "build_direction")).toEqual(makeResult("build_direction", 0));
    expect(getCached(second, "data_sources")).toEqual(makeResult("data_sources", 1));
  });

  it("does not mutate the original project", () => {
    const project = createProjectState("idea", "Fieldnotes");
    const result = makeResult("build_direction", 0);

    const updated = setCached(project, "build_direction", undefined, result);

    expect(project.cachedOptions).toEqual({});
    expect(updated).not.toBe(project);
  });
});

describe("appendAssumptions", () => {
  it("appends new assumptions while preserving order", () => {
    const project = createProjectState("idea", "Fieldnotes");
    const updated = appendAssumptions(project, ["Users sign in with email"]);

    expect(updated.councilAssumptions).toEqual(["Users sign in with email"]);
  });

  it("dedupes against existing assumptions", () => {
    const project = { ...createProjectState("idea", "Fieldnotes"), councilAssumptions: ["alpha"] };
    const updated = appendAssumptions(project, ["alpha", "beta", "alpha", "gamma"]);

    expect(updated.councilAssumptions).toEqual(["alpha", "beta", "gamma"]);
  });

  it("returns the original project unchanged when no assumptions are provided", () => {
    const project = createProjectState("idea", "Fieldnotes");
    const updated = appendAssumptions(project, []);

    expect(updated).toBe(project);
  });
});
