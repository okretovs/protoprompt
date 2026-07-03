import { describe, expect, it } from "vitest";

import { markdownFileName } from "./final-prompt-file";
import { buildFinalPromptInput, FINAL_PROMPT_SECTIONS, FINAL_PROMPT_SYSTEM_PROMPT } from "./final-prompt";
import { createProjectState } from "./types";

describe("final prompt contract", () => {
  it("lists the fixed H2 sections in order", () => {
    const sectionHeadings = FINAL_PROMPT_SYSTEM_PROMPT
      .split("\n")
      .filter((line) => line.startsWith("## "));

    expect(sectionHeadings).toEqual(FINAL_PROMPT_SECTIONS.map((section) => `## ${section}`));
  });

  it("builds a prompt input from project state", () => {
    const project = createProjectState("A task app", "Fieldnotes");

    expect(buildFinalPromptInput(project)).toContain('"idea": "A task app"');
    expect(buildFinalPromptInput(project)).toContain('"scopeMode": "enriched"');
  });

  it("creates a safe markdown file name", () => {
    expect(markdownFileName("Field Notes!")).toBe("field-notes.md");
    expect(markdownFileName(" ")).toBe("protoprompt-brief.md");
  });
});
