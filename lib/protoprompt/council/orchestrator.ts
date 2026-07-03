import { selectedPageTitles } from "@/lib/protoprompt/pages";
import { openai } from "@/lib/protoprompt/openai-client";
import { downgradeRequiredOptions, downgradeRequiredOptionsInGroup } from "@/lib/protoprompt/selection";
import type {
  CouncilCandidateResult,
  CouncilDossier,
  CouncilMemberId,
  CouncilMode,
  CouncilReviewResult,
  PageGroup,
  ProjectState,
  StageId,
  StageOptionsResult,
} from "@/lib/protoprompt/types";

import {
  anonymizeCandidates,
  buildCandidatePrompt,
  buildChairmanPrompt,
  buildGroupedChairmanPrompt,
  buildReviewPrompt,
} from "./build-prompts";
import { parseChairmanResponse, parseCouncilCandidateResponse, parseCouncilReviewResponse, parseGroupedStageResponse } from "./parse";
import { CHAIRMAN_SYSTEM_PROMPT, COUNCIL_MEMBERS, chairmanSystemPromptFor } from "./prompts";

const COUNCIL_MEMBER_IDS: CouncilMemberId[] = ["A", "B", "C", "D"];
const CANDIDATE_TEMPERATURE = 0.4;
const REVIEW_TEMPERATURE = 0.4;
const CHAIRMAN_TEMPERATURE = 0.4;

/** Wave 1: candidate generation. A failure here is fatal for the stage (ADR 0006). */
export async function runCouncilMember(
  member: CouncilMemberId,
  stage: StageId,
  project: ProjectState,
  pages?: string[]
): Promise<CouncilCandidateResult> {
  const persona = COUNCIL_MEMBERS[member];
  const prompt = buildCandidatePrompt(stage, project, pages);
  const raw = await openai.text.generate({ system: persona.basePrompt, prompt, temperature: CANDIDATE_TEMPERATURE });
  return parseCouncilCandidateResponse(member, raw);
}

/** Wave 2: anonymous review. Reviewer failures are non-fatal (ADR 0006); see `runReviews`. */
export async function reviewByMember(
  member: CouncilMemberId,
  stage: StageId,
  anonymized: Record<string, CouncilCandidateResult["candidates"]>
): Promise<CouncilReviewResult> {
  const persona = COUNCIL_MEMBERS[member];
  const prompt = buildReviewPrompt(stage, anonymized);
  const raw = await openai.text.generate({ system: persona.reviewPrompt, prompt, temperature: REVIEW_TEMPERATURE });
  return parseCouncilReviewResponse(member, raw);
}

async function runReviews(
  stage: StageId,
  anonymized: Record<string, CouncilCandidateResult["candidates"]>
): Promise<CouncilReviewResult[]> {
  const settled = await Promise.allSettled(
    COUNCIL_MEMBER_IDS.map((member) => reviewByMember(member, stage, anonymized))
  );
  return settled
    .filter((entry): entry is PromiseFulfilledResult<CouncilReviewResult> => entry.status === "fulfilled")
    .map((entry) => entry.value);
}

/** Waves 1-2, shared by flat (`runStage`) and grouped (`runGroupedStage`) orchestration. */
async function runWaves1And2(
  stage: StageId,
  project: ProjectState,
  pages?: string[]
): Promise<{ candidates: CouncilCandidateResult[]; reviews: CouncilReviewResult[] }> {
  const candidates = await Promise.all(
    COUNCIL_MEMBER_IDS.map((member) => runCouncilMember(member, stage, project, pages))
  );
  const anonymized = anonymizeCandidates(candidates);
  const reviews = await runReviews(stage, anonymized);
  return { candidates, reviews };
}

export interface ChairmanResult {
  result: StageOptionsResult;
  dossier?: CouncilDossier;
}

export interface RunChairmanParams {
  mode: CouncilMode;
  stage: StageId;
  project: ProjectState;
  candidates: CouncilCandidateResult[];
  reviews: CouncilReviewResult[];
}

/** Wave 3: chairman synthesis, with one automatic repair retry on failure (ADR 0006). */
export async function runChairman(params: RunChairmanParams): Promise<ChairmanResult> {
  try {
    return await runChairmanOnce(params);
  } catch {
    return await runChairmanOnce(params);
  }
}

async function runChairmanOnce({ mode, stage, project, candidates, reviews }: RunChairmanParams): Promise<ChairmanResult> {
  const prompt = buildChairmanPrompt({ mode, stage, project, candidates, reviews });
  const raw = await openai.text.generate({
    system: CHAIRMAN_SYSTEM_PROMPT,
    prompt,
    temperature: CHAIRMAN_TEMPERATURE,
  });
  const parsed = parseChairmanResponse(stage, raw);
  const stageResult = parsed.results.find((entry) => entry.stage === stage) ?? parsed.results[0];
  if (!stageResult) {
    throw new Error(`Chairman response did not include results for stage "${stage}"`);
  }
  return { result: downgradeRequiredOptions(stageResult), dossier: parsed.dossier };
}

export interface RunStageParams {
  stage: StageId;
  project: ProjectState;
}

/**
 * Three-wave orchestration for a stage (ADR 0003). Gated on
 * `project.councilDossier`: missing -> full Waves 1-3 in "fresh" mode;
 * present -> Wave 3 only in "dossier" mode, reusing cached context.
 */
export async function runStage({ stage, project }: RunStageParams): Promise<ChairmanResult> {
  const mode: CouncilMode = project.councilDossier ? "dossier" : "fresh";

  if (mode === "dossier") {
    return runChairman({ mode, stage, project, candidates: [], reviews: [] });
  }

  const { candidates, reviews } = await runWaves1And2(stage, project);
  return runChairman({ mode, stage, project, candidates, reviews });
}

export interface GroupedChairmanResult {
  pageGroups: PageGroup[];
  dossier?: CouncilDossier;
}

export interface RunGroupedChairmanParams {
  mode: CouncilMode;
  stage: StageId;
  project: ProjectState;
  candidates: CouncilCandidateResult[];
  reviews: CouncilReviewResult[];
  pages: string[];
}

/** Wave 3 for `grouped_by_page` stages, with the same one-shot repair retry as `runChairman`. */
export async function runGroupedChairman(params: RunGroupedChairmanParams): Promise<GroupedChairmanResult> {
  try {
    return await runGroupedChairmanOnce(params);
  } catch {
    return await runGroupedChairmanOnce(params);
  }
}

async function runGroupedChairmanOnce({
  mode,
  stage,
  project,
  candidates,
  reviews,
  pages,
}: RunGroupedChairmanParams): Promise<GroupedChairmanResult> {
  const prompt = buildGroupedChairmanPrompt({ mode, stage, project, candidates, reviews, pages });
  const raw = await openai.text.generate({
    system: chairmanSystemPromptFor(stage),
    prompt,
    temperature: CHAIRMAN_TEMPERATURE,
  });
  const parsed = parseGroupedStageResponse(stage, raw);
  return { pageGroups: parsed.pageGroups.map(downgradeRequiredOptionsInGroup), dossier: parsed.dossier };
}

/**
 * Three-wave orchestration for a `grouped_by_page` stage (`components`,
 * `mockup_style`, ADR 0003). Same dossier gating as `runStage`; the chairman
 * returns one `PageGroup` per selected app page instead of a flat option list.
 */
export async function runGroupedStage({ stage, project }: RunStageParams): Promise<GroupedChairmanResult> {
  const mode: CouncilMode = project.councilDossier ? "dossier" : "fresh";
  const pages = selectedPageTitles(project);

  if (mode === "dossier") {
    return runGroupedChairman({ mode, stage, project, candidates: [], reviews: [], pages });
  }

  const { candidates, reviews } = await runWaves1And2(stage, project, pages);
  return runGroupedChairman({ mode, stage, project, candidates, reviews, pages });
}
