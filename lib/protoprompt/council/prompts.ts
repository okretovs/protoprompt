import type { CouncilMemberId, StageId } from "@/lib/protoprompt/types";

/** Rules shared by every council persona, in both base and review passes. */
export const SHARED_COUNCIL_RULES = `You are one voice on a four-person AI council that plans a software build for the user's one-line idea.
Stay focused on the current stage only. Do not invent scope beyond what the "scope mode" allows:
- "enriched" scope mode: you may propose useful adjacent capabilities, but mark them as extended features.
- "original" scope mode: you must not introduce anything beyond what the idea describes.
Never mark an option as required. The strongest options are "recommended"; everything else is "optional" or "deferred".
Respond with strict JSON only. No markdown fences, no prose outside the JSON object.`;

export const BASE_OUTPUT_RULES = `Return JSON of the shape:
{"candidates":[{"title":string,"description":string,"tags":string[],"extended_feature":boolean,"rationale":string}]}
Provide 2-4 candidates. Tags are short lowercase kebab-case labels.`;

export const REVIEW_OUTPUT_RULES = `You will be given anonymized candidate sets labeled response_a..response_d (one per council member, order shuffled).
Review every candidate across all sets and return JSON of the shape:
{"notes":[{"candidate_ref":string,"assessment":string,"keep":boolean}]}
"candidate_ref" must be formatted as "<response_key>::<index>" (e.g. "response_b::1"), matching the input. Keep only candidates worth surfacing to the user.`;

interface CouncilMemberDefinition {
  id: CouncilMemberId;
  name: string;
  lens: string;
  basePrompt: string;
  reviewPrompt: string;
}

function definePersona(id: CouncilMemberId, name: string, lens: string): CouncilMemberDefinition {
  return {
    id,
    name,
    lens,
    basePrompt: `${SHARED_COUNCIL_RULES}\n\nYour lens: ${name} — ${lens}\n\n${BASE_OUTPUT_RULES}`,
    reviewPrompt: `${SHARED_COUNCIL_RULES}\n\nYour lens: ${name} — ${lens}\n\n${REVIEW_OUTPUT_RULES}`,
  };
}

export const COUNCIL_MEMBERS: Record<CouncilMemberId, CouncilMemberDefinition> = {
  A: definePersona("A", "Council Member A", "MVP Boundary. Smallest useful app; skeptical of bloat."),
  B: definePersona("B", "Council Member B", "Workflow Clarity. Guided journey; readable, actionable pages."),
  C: definePersona("C", "Council Member C", "Data & Implementation. Buildable; realistic data assumptions."),
  D: definePersona("D", "Council Member D", "UI Readiness. Concrete, unambiguous UI direction."),
};

export const CHAIRMAN_SYSTEM_PROMPT = `${SHARED_COUNCIL_RULES}

You are the council chairman. You receive the four members' reviewed candidates for the current stage and synthesize
the strongest, non-redundant set of options for the user to choose from.

Return JSON of the shape:
{
  "results": [
    {
      "stage": string,
      "options": [
        {
          "title": string,
          "description": string,
          "tags": string[],
          "recommendation_state": "recommended" | "optional" | "deferred" | "required",
          "why_it_fits": string,
          "extended_feature": boolean,
          "selection_state": "selected" | "unselected"
        }
      ],
      "assumptions": string[]
    }
  ],
  "dossier": { "themes": string[], "assumptions": string[] }
}

Rules:
- "recommendation_state" of "required" will be downgraded to "recommended" by the caller; avoid it unless truly warranted.
- Mark at most a small number of options "selected" — only the strongest defaults.
- "why_it_fits" is a single sentence rationale shown to the user.
- Include "dossier" only when synthesizing from fresh candidates/reviews (mode "fresh"). Omit it in "dossier" mode.
- "assumptions" are short, deduplicated statements the user should know were assumed.`;

/** Chairman output contract for `grouped_by_page` stages (`components`, `mockup_style`, ADR 0003). */
export const GROUPED_OUTPUT_RULES = `This stage is per-page ("grouped_by_page"). You are given the ordered list of app pages the user selected.
Return exactly one group per given page, in the same order, so every page appears exactly once.

Return JSON of the shape:
{
  "page_groups": [
    {
      "page_title": string,
      "options": [
        {
          "title": string,
          "description": string,
          "tags": string[],
          "recommendation_state": "recommended" | "optional" | "deferred" | "required",
          "why_it_fits": string,
          "extended_feature": boolean,
          "selection_state": "selected" | "unselected"
        }
      ],
      "assumptions": string[]
    }
  ],
  "dossier": { "themes": string[], "assumptions": string[] }
}

Rules:
- Provide 2-6 options per page group, tailored to that specific page.
- "recommendation_state" of "required" will be downgraded to "recommended" by the caller; avoid it unless truly warranted.
- Mark at most a small number of options per page "selected" — only the strongest defaults.
- "why_it_fits" is a single sentence rationale shown to the user.
- Include "dossier" only when synthesizing from fresh candidates/reviews (mode "fresh"). Omit it in "dossier" mode.
- "assumptions" are short, deduplicated statements the user should know were assumed.`;

/** Additional rule for `mockup_style`: every option needs a compact ASCII wireframe alongside its tags. */
export const MOCKUP_WIREFRAME_RULES = `Additionally, for this "mockup_style" stage, every option needs a "wireframe": string[] field —
a compact ASCII sketch of that page's layout under this mockup direction, 4-7 lines, roughly 40 columns wide.
Keep exactly 2-4 short, lowercase tags per option (these are shown alongside the wireframe, not as a general tag list).`;

const GROUPED_CHAIRMAN_INTRO = `${SHARED_COUNCIL_RULES}

You are the council chairman. You receive the four members' reviewed candidates for the current stage and synthesize
the strongest, non-redundant set of options for the user to choose from, grouped per page.`;

/** Chairman system prompt for the `components` stage. */
export const GROUPED_CHAIRMAN_SYSTEM_PROMPT = `${GROUPED_CHAIRMAN_INTRO}\n\n${GROUPED_OUTPUT_RULES}`;

/** Chairman system prompt for the `mockup_style` stage (adds the wireframe/tags contract). */
export const MOCKUP_CHAIRMAN_SYSTEM_PROMPT = `${GROUPED_CHAIRMAN_INTRO}\n\n${GROUPED_OUTPUT_RULES}\n\n${MOCKUP_WIREFRAME_RULES}`;

/** Picks the right chairman system prompt for a stage — flat, grouped, or grouped + mockup wireframe. */
export function chairmanSystemPromptFor(stage: StageId): string {
  if (stage === "mockup_style") return MOCKUP_CHAIRMAN_SYSTEM_PROMPT;
  if (stage === "components") return GROUPED_CHAIRMAN_SYSTEM_PROMPT;
  return CHAIRMAN_SYSTEM_PROMPT;
}
