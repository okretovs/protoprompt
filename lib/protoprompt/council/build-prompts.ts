import type {
  CouncilCandidateResult,
  CouncilMode,
  CouncilReviewResult,
  ProjectState,
  StageId,
} from "@/lib/protoprompt/types";

const RESPONSE_KEYS = ["response_a", "response_b", "response_c", "response_d"] as const;

function projectBrief(project: ProjectState): string {
  return `Idea: ${project.idea}\nProject name: ${project.projectName}\nScope mode: ${project.scopeMode}`;
}

export function buildCandidatePrompt(stage: StageId, project: ProjectState, pages?: string[]): string {
  const pagesLine = pages && pages.length > 0 ? `\nPages: ${JSON.stringify(pages)}` : "";
  return `${projectBrief(project)}\n\nStage: ${stage}${pagesLine}\n\nPropose candidate options for this stage.`;
}

/** Anonymizes each member's candidates as response_a..d, shuffled so members can't infer authorship. */
export function anonymizeCandidates(
  results: CouncilCandidateResult[]
): Record<string, CouncilCandidateResult["candidates"]> {
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  const anonymized: Record<string, CouncilCandidateResult["candidates"]> = {};
  shuffled.forEach((result, index) => {
    const key = RESPONSE_KEYS[index];
    if (key) anonymized[key] = result.candidates;
  });
  return anonymized;
}

export function buildReviewPrompt(
  stage: StageId,
  anonymized: Record<string, CouncilCandidateResult["candidates"]>
): string {
  return `Stage: ${stage}\n\nCandidate sets:\n${JSON.stringify(anonymized, null, 2)}`;
}

export interface ChairmanPromptParams {
  mode: CouncilMode;
  stage: StageId;
  project: ProjectState;
  candidates: CouncilCandidateResult[];
  reviews: CouncilReviewResult[];
}

export function buildChairmanPrompt({
  mode,
  stage,
  project,
  candidates,
  reviews,
}: ChairmanPromptParams): string {
  return `${projectBrief(project)}\n\nMode: ${mode}\nStage: ${stage}\n\nCandidates:\n${JSON.stringify(
    candidates,
    null,
    2
  )}\n\nReviews:\n${JSON.stringify(reviews, null, 2)}\n\nDossier: ${
    project.councilDossier ? JSON.stringify(project.councilDossier) : "none"
  }`;
}

export interface GroupedChairmanPromptParams extends ChairmanPromptParams {
  /** Ordered titles of the selected app pages; the chairman returns one group per page, in this order. */
  pages: string[];
}

export function buildGroupedChairmanPrompt({
  mode,
  stage,
  project,
  candidates,
  reviews,
  pages,
}: GroupedChairmanPromptParams): string {
  return `${projectBrief(project)}\n\nMode: ${mode}\nStage: ${stage}\nPages: ${JSON.stringify(
    pages
  )}\n\nCandidates:\n${JSON.stringify(candidates, null, 2)}\n\nReviews:\n${JSON.stringify(
    reviews,
    null,
    2
  )}\n\nDossier: ${project.councilDossier ? JSON.stringify(project.councilDossier) : "none"}`;
}
