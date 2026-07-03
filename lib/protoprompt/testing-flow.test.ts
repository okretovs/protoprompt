import { describe, expect, it } from "vitest";

import { createProjectState } from "./types";
import { TESTING_IDEA, TESTING_PROJECT_NAME, mockFinalPrompt, mockPageGroups, mockStageResult } from "./testing-flow";

describe("testing flow fixtures", () => {
  it("provides mock options for every generated stage in the UI flow", () => {
    expect(mockStageResult("build_direction").options.length).toBeGreaterThan(0);
    expect(mockStageResult("data_sources").options.length).toBeGreaterThan(0);
    expect(mockStageResult("app_pages").options.filter((option) => option.selectionState === "selected")).toHaveLength(3);
  });

  it("provides page-group fixtures for components and mockup style", () => {
    expect(mockPageGroups("components", ["Dashboard"])[0].options.length).toBeGreaterThan(0);
    expect(mockPageGroups("mockup_style", ["Dashboard"])[0].options[0].wireframe).toBeDefined();
  });

  it("provides a complete mock final prompt", () => {
    const project = createProjectState(TESTING_IDEA, TESTING_PROJECT_NAME);
    const prompt = mockFinalPrompt(project);

    expect(prompt).toContain("## App Name");
    expect(prompt).toContain("## Acceptance Criteria");
    expect(prompt).toContain(TESTING_PROJECT_NAME);
  });
});
