import { openai, withTransientRetry } from "@/lib/protoprompt/openai-client";
import type { ProjectState, StageOption } from "@/lib/protoprompt/types";

export const FINAL_PROMPT_SECTIONS = [
  "App Name",
  "Product Objective",
  "Target Users",
  "MVP Scope",
  "Build Direction",
  "Data Sources",
  "Pages & Navigation",
  "Features by Page",
  "Components by Page",
  "Mockup Direction by Page",
  "Data Model",
  "Workflows",
  "User Roles & Permissions",
  "Integrations",
  "UI & Design Direction",
  "Design Principles",
  "Validation Rules",
  "Empty States",
  "Error States",
  "Acceptance Criteria",
  "Implementation Notes",
] as const;

export const FINAL_PROMPT_SYSTEM_PROMPT = `You are the ProtoPrompt council chairman producing the final build-ready operating brief.
Return markdown only. Do not wrap the response in code fences. Do not include prose before or after the markdown.
Use these H2 sections exactly, in this order:
${FINAL_PROMPT_SECTIONS.map((section) => `## ${section}`).join("\n")}
Be concrete, implementation-ready, and faithful to the selected options. Avoid generic filler.`;

export function buildFinalPromptInput(project: ProjectState): string {
  const selectedOptions = collectSelectedOptions(project);

  return `Project name: ${project.projectName}
Idea: ${project.idea}
Scope mode: ${project.scopeMode}

Council assumptions:
${project.councilAssumptions.map((assumption) => `- ${assumption}`).join("\n") || "- None"}

Selected option details:
${JSON.stringify(selectedOptions, null, 2)}

Assemble a directly usable implementation prompt. Ground every section in the selected option details above.`;
}

export function collectSelectedOptions(project: ProjectState): Array<{
  cacheKey: string;
  stage: string;
  context: string;
  options: StageOption[];
}> {
  return Object.entries(project.cachedOptions).flatMap(([key, result]) => {
    if (!result) return [];
    const selectedIds = project.selections[key] ?? result.options
      .filter((option) => option.selectionState === "selected")
      .map((option) => option.id);
    const selected = result.options.filter((option) => selectedIds.includes(option.id));
    const [, context = ""] = key.split("::");
    return [{ cacheKey: key, stage: result.stage, context, options: selected }];
  });
}

export async function generateFinalPrompt({
  project,
  apiKey,
}: {
  project: ProjectState;
  apiKey?: string;
}): Promise<ReadableStream<Uint8Array>> {
  return withTransientRetry(() =>
    openai.text.generateStreamRaw({
      system: FINAL_PROMPT_SYSTEM_PROMPT,
      prompt: buildFinalPromptInput(project),
      temperature: 0.35,
      apiKey,
    })
  );
}
