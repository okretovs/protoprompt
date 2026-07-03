import type { ModelOption, ModelPageGroup, ModelStageOptionsResult } from "@/lib/protoprompt/selection";
import type {
  CouncilCandidateResult,
  CouncilDossier,
  CouncilMemberId,
  CouncilReviewResult,
  ModelRecommendationState,
  StageId,
} from "@/lib/protoprompt/types";

/** ASCII wireframe lines must be short and few enough to read as a compact sketch (PRO-13 acceptance criteria). */
const MIN_WIREFRAME_LINES = 4;
const MAX_WIREFRAME_LINES = 7;
const MIN_MOCKUP_TAGS = 2;
const MAX_MOCKUP_TAGS = 4;

export class CouncilParseError extends Error {
  constructor(message: string, readonly raw: string) {
    super(message);
    this.name = "CouncilParseError";
  }
}

function parseJson(raw: string, context: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new CouncilParseError(`${context}: response was not valid JSON`, raw);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown, context: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${context}: expected a string array`);
  }
  return value;
}

export function parseCouncilCandidateResponse(
  member: CouncilMemberId,
  raw: string
): CouncilCandidateResult {
  const data = parseJson(raw, `Candidate response for member ${member}`);
  if (!isRecord(data) || !Array.isArray(data.candidates)) {
    throw new CouncilParseError(`Candidate response for member ${member}: missing "candidates" array`, raw);
  }

  const candidates = data.candidates.map((candidate, index) => {
    if (!isRecord(candidate)) {
      throw new CouncilParseError(`Candidate response for member ${member}: candidate ${index} is not an object`, raw);
    }
    const { title, description, tags, extended_feature, rationale } = candidate;
    if (typeof title !== "string" || typeof description !== "string" || typeof rationale !== "string") {
      throw new CouncilParseError(
        `Candidate response for member ${member}: candidate ${index} missing required string fields`,
        raw
      );
    }
    return {
      title,
      description,
      tags: asStringArray(tags ?? [], `Candidate ${index} tags`),
      extendedFeature: Boolean(extended_feature),
      rationale,
    };
  });

  return { member, candidates };
}

export function parseCouncilReviewResponse(member: CouncilMemberId, raw: string): CouncilReviewResult {
  const data = parseJson(raw, `Review response for member ${member}`);
  if (!isRecord(data) || !Array.isArray(data.notes)) {
    throw new CouncilParseError(`Review response for member ${member}: missing "notes" array`, raw);
  }

  const notes = data.notes.map((note, index) => {
    if (!isRecord(note)) {
      throw new CouncilParseError(`Review response for member ${member}: note ${index} is not an object`, raw);
    }
    const { candidate_ref, assessment, keep } = note;
    if (typeof candidate_ref !== "string" || typeof assessment !== "string") {
      throw new CouncilParseError(
        `Review response for member ${member}: note ${index} missing required string fields`,
        raw
      );
    }
    return { candidateRef: candidate_ref, assessment, keep: Boolean(keep) };
  });

  return { member, notes };
}

const VALID_RECOMMENDATION_STATES: ModelRecommendationState[] = [
  "recommended",
  "optional",
  "deferred",
  "required",
];

function parseRecommendationState(value: unknown, context: string): ModelRecommendationState {
  if (typeof value !== "string" || !VALID_RECOMMENDATION_STATES.includes(value as ModelRecommendationState)) {
    throw new Error(`${context}: invalid recommendation_state "${String(value)}"`);
  }
  return value as ModelRecommendationState;
}

function parseSelectionState(value: unknown): "selected" | "unselected" {
  return value === "selected" ? "selected" : "unselected";
}

export interface ChairmanParseResult {
  results: ModelStageOptionsResult[];
  dossier?: CouncilDossier;
}

/**
 * Parses one chairman option object shared by both `parseChairmanResponse`
 * (flat stages) and `parseGroupedStageResponse` (per-page stages). Set
 * `requireWireframe` for `mockup_style`, whose `OptionCard` variant needs an
 * ASCII wireframe + a small, fixed tag count (PRO-13 acceptance criteria).
 */
function parseChairmanOption(
  option: unknown,
  idPrefix: string,
  optionIndex: number,
  context: string,
  raw: string,
  requireWireframe: boolean
): ModelOption {
  if (!isRecord(option)) {
    throw new CouncilParseError(`${context}: option ${optionIndex} is not an object`, raw);
  }
  const { title, description, tags, why_it_fits, extended_feature, recommendation_state, selection_state, wireframe } =
    option;
  if (typeof title !== "string" || typeof description !== "string" || typeof why_it_fits !== "string") {
    throw new CouncilParseError(`${context}: option ${optionIndex} missing required string fields`, raw);
  }

  const parsedTags = asStringArray(tags ?? [], `${context} option ${optionIndex} tags`);
  if (requireWireframe && (parsedTags.length < MIN_MOCKUP_TAGS || parsedTags.length > MAX_MOCKUP_TAGS)) {
    throw new CouncilParseError(
      `${context}: option ${optionIndex} must have ${MIN_MOCKUP_TAGS}-${MAX_MOCKUP_TAGS} tags, got ${parsedTags.length}`,
      raw
    );
  }

  let parsedWireframe: string[] | undefined;
  if (requireWireframe) {
    parsedWireframe = asStringArray(wireframe ?? [], `${context} option ${optionIndex} wireframe`);
    if (parsedWireframe.length < MIN_WIREFRAME_LINES || parsedWireframe.length > MAX_WIREFRAME_LINES) {
      throw new CouncilParseError(
        `${context}: option ${optionIndex} wireframe must have ${MIN_WIREFRAME_LINES}-${MAX_WIREFRAME_LINES} lines, got ${parsedWireframe.length}`,
        raw
      );
    }
  }

  return {
    id: `${idPrefix}-${optionIndex}-${slugify(title)}`,
    title,
    description,
    tags: parsedTags,
    whyItFits: why_it_fits,
    extendedFeature: Boolean(extended_feature),
    recommendationState: parseRecommendationState(recommendation_state, `${context} option ${optionIndex}`),
    selectionState: parseSelectionState(selection_state),
    ...(parsedWireframe ? { wireframe: parsedWireframe } : {}),
  };
}

/**
 * Parses the chairman's raw JSON for a flat (non-grouped) stage. Options
 * still carry the model's raw `ModelRecommendationState` (may be
 * "required"); callers apply the required->recommended downgrade via
 * `downgradeRequiredOptions`.
 */
export function parseChairmanResponse(expectedStage: StageId, raw: string): ChairmanParseResult {
  const data = parseJson(raw, "Chairman response");
  if (!isRecord(data) || !Array.isArray(data.results)) {
    throw new CouncilParseError('Chairman response: missing "results" array', raw);
  }

  const results = data.results.map((entry, entryIndex) => {
    if (!isRecord(entry) || typeof entry.stage !== "string" || !Array.isArray(entry.options)) {
      throw new CouncilParseError(`Chairman response: result ${entryIndex} is malformed`, raw);
    }

    const options = entry.options.map((option, optionIndex) =>
      parseChairmanOption(option, entry.stage as string, optionIndex, `Chairman response result ${entryIndex}`, raw, false)
    );

    const assumptions = asStringArray(entry.assumptions ?? [], `Chairman result ${entryIndex} assumptions`);

    return { stage: entry.stage as StageId, options, assumptions };
  });

  const dossier = parseDossier(data.dossier);

  return { results, dossier };
}

export interface GroupedChairmanParseResult {
  pageGroups: ModelPageGroup[];
  dossier?: CouncilDossier;
}

/**
 * Parses the chairman's raw JSON for a `grouped_by_page` stage (`components`,
 * `mockup_style`, ADR 0003). One `PageGroup` per selected app page, each with
 * its own options and assumptions. `mockup_style` additionally requires an
 * ASCII wireframe + a small fixed tag count per option.
 */
export function parseGroupedStageResponse(expectedStage: StageId, raw: string): GroupedChairmanParseResult {
  const data = parseJson(raw, "Chairman grouped response");
  if (!isRecord(data) || !Array.isArray(data.page_groups)) {
    throw new CouncilParseError('Chairman grouped response: missing "page_groups" array', raw);
  }

  const requireWireframe = expectedStage === "mockup_style";

  const pageGroups = data.page_groups.map((entry, groupIndex) => {
    if (!isRecord(entry) || typeof entry.page_title !== "string" || !Array.isArray(entry.options)) {
      throw new CouncilParseError(`Chairman grouped response: group ${groupIndex} is malformed`, raw);
    }

    const idPrefix = `${expectedStage}-${slugify(entry.page_title)}`;
    const options = entry.options.map((option, optionIndex) =>
      parseChairmanOption(
        option,
        idPrefix,
        optionIndex,
        `Chairman grouped response group ${groupIndex}`,
        raw,
        requireWireframe
      )
    );

    const assumptions = asStringArray(entry.assumptions ?? [], `Chairman grouped response group ${groupIndex} assumptions`);

    return { pageTitle: entry.page_title, options, assumptions };
  });

  const dossier = parseDossier(data.dossier);

  return { pageGroups, dossier };
}

function parseDossier(value: unknown): CouncilDossier | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) throw new Error("Chairman response: dossier is not an object");
  return {
    themes: asStringArray(value.themes ?? [], "Dossier themes"),
    assumptions: asStringArray(value.assumptions ?? [], "Dossier assumptions"),
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
