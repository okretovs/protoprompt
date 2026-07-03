import type { ModelStageOptionsResult } from "@/lib/protoprompt/selection";
import type {
  CouncilCandidateResult,
  CouncilDossier,
  CouncilMemberId,
  CouncilReviewResult,
  ModelRecommendationState,
  StageId,
} from "@/lib/protoprompt/types";

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
 * Parses the chairman's raw JSON. Options still carry the model's raw
 * `ModelRecommendationState` (may be "required"); callers apply the
 * required->recommended downgrade via `downgradeRequiredOptions`.
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

    const options = entry.options.map((option, optionIndex) => {
      if (!isRecord(option)) {
        throw new CouncilParseError(
          `Chairman response: result ${entryIndex} option ${optionIndex} is not an object`,
          raw
        );
      }
      const { title, description, tags, why_it_fits, extended_feature, recommendation_state, selection_state } =
        option;
      if (typeof title !== "string" || typeof description !== "string" || typeof why_it_fits !== "string") {
        throw new CouncilParseError(
          `Chairman response: result ${entryIndex} option ${optionIndex} missing required string fields`,
          raw
        );
      }
      return {
        id: `${entry.stage}-${optionIndex}-${slugify(title)}`,
        title,
        description,
        tags: asStringArray(tags ?? [], `Chairman option ${optionIndex} tags`),
        whyItFits: why_it_fits,
        extendedFeature: Boolean(extended_feature),
        recommendationState: parseRecommendationState(
          recommendation_state,
          `Chairman response option ${optionIndex}`
        ),
        selectionState: parseSelectionState(selection_state),
      };
    });

    const assumptions = asStringArray(entry.assumptions ?? [], `Chairman result ${entryIndex} assumptions`);

    return { stage: entry.stage as StageId, options, assumptions };
  });

  const dossier = parseDossier(data.dossier);

  return { results, dossier };
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
