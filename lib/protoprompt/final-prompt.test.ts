import { describe, expect, it } from "vitest";

import { markdownFileName } from "./final-prompt-file";
import { cacheKey, setCached } from "./cached-options";
import { buildFinalPromptInput, collectSelectedOptions, FINAL_PROMPT_SECTIONS, FINAL_PROMPT_SYSTEM_PROMPT } from "./final-prompt";
import { createProjectState } from "./types";

describe("final prompt contract", () => {
  it("lists the fixed H2 sections in order", () => {
    const sectionHeadings = FINAL_PROMPT_SYSTEM_PROMPT
      .split("\n")
      .filter((line) => line.startsWith("## "));

    expect(sectionHeadings).toEqual(FINAL_PROMPT_SECTIONS.map((section) => `## ${section}`));
  });

  it("builds a prompt input from project state", () => {
    const project = createProjectWithSelectedOptions();

    expect(buildFinalPromptInput(project)).toContain("Idea: A task app");
    expect(buildFinalPromptInput(project)).toContain("Scope mode: enriched");
    expect(buildFinalPromptInput(project)).toContain("Task capture");
    expect(buildFinalPromptInput(project)).not.toContain("Admin console");
  });

  it("collects selected option details for direct-use prompt assembly", () => {
    const project = createProjectWithSelectedOptions();

    expect(collectSelectedOptions(project)).toEqual([
      expect.objectContaining({
        cacheKey: "build_direction::",
        stage: "build_direction",
        options: [expect.objectContaining({ title: "Task capture" })],
      }),
    ]);
  });

  it("creates a safe markdown file name", () => {
    expect(markdownFileName("Field Notes!")).toBe("field-notes.md");
    expect(markdownFileName(" ")).toBe("protoprompt-brief.md");
  });
});

function createProjectWithSelectedOptions() {
  const result = {
    stage: "build_direction" as const,
    assumptions: ["Users need fast capture"],
    options: [
      {
        id: "capture",
        title: "Task capture",
        description: "Capture tasks quickly",
        tags: ["core"],
        recommendationState: "recommended" as const,
        whyItFits: "It is the core workflow.",
        extendedFeature: false,
        selectionState: "selected" as const,
      },
      {
        id: "admin",
        title: "Admin console",
        description: "Manage teams",
        tags: ["extended"],
        recommendationState: "optional" as const,
        whyItFits: "Useful later.",
        extendedFeature: true,
        selectionState: "unselected" as const,
      },
    ],
  };
  const project = setCached(createProjectState("A task app", "Fieldnotes"), "build_direction", undefined, result);
  return {
    ...project,
    councilAssumptions: result.assumptions,
    selections: { [cacheKey("build_direction")]: ["capture"] },
  };
}
