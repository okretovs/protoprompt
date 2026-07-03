import { openai, withTransientRetry } from "@/lib/protoprompt/openai-client";
import type { ProjectState } from "@/lib/protoprompt/types";

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
Be concrete, implementation-ready, and faithful to the selected options.`;

export function buildFinalPromptInput(project: ProjectState): string {
  return `Project:
${JSON.stringify(project, null, 2)}

Assemble the final markdown prompt from the selected options, cached option details, council assumptions, and scope mode.`;
}

export async function generateFinalPrompt({ project }: { project: ProjectState }): Promise<ReadableStream<Uint8Array>> {
  return withTransientRetry(() =>
    openai.text.generateStreamRaw({
      system: FINAL_PROMPT_SYSTEM_PROMPT,
      prompt: buildFinalPromptInput(project),
      temperature: 0.35,
    })
  );
}
