import { openai } from "@/lib/protoprompt/openai-client";
import { downgradeRequiredOptions } from "@/lib/protoprompt/selection";
import type {
  CouncilCandidateResult,
  CouncilDossier,
  CouncilMemberId,
  CouncilMode,
  CouncilReviewResult,
  ProjectState,
  StageId,
  StageOptionsResult,
} from "@/lib/protoprompt/types";

import { anonymizeCandidates, buildCandidatePrompt, buildChairmanPrompt, buildReviewPrompt } from "./build-prompts";
import { parseChairmanResponse, parseCouncilCandidateResponse, parseCouncilReviewResponse } from "./parse";
import { CHAIRMAN_SYSTEM_PROMPT, COUNCIL_MEMBERS } from "./prompts";

const COUNCIL_MEMBER_IDS: CouncilMemberId[] = ["A", "B", "C", "D"];
const CANDIDATE_TEMPERATURE = 0.4;
const REVIEW_TEMPERATURE = 0.4;
const CHAIRMAN_TEMPERATURE = 0.4;

/** Wave 1: candidate generation. A failure here is fatal for the stage (ADR 0006). */
export async function runCouncilMember(
  member: CouncilMemberId,
  stage: StageId,
  project: ProjectState
): Promise<CouncilCandidateResult> {
  const persona = COUNCIL_MEMBERS[member];
  const prompt = buildCandidatePrompt(stage, project);
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

  const candidates = await Promise.all(COUNCIL_MEMBER_IDS.map((member) => runCouncilMember(member, stage, project)));
  const anonymized = anonymizeCandidates(candidates);
  const reviews = await runReviews(stage, anonymized);

  return runChairman({ mode, stage, project, candidates, reviews });
}
