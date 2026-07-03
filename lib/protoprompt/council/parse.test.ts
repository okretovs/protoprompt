import { describe, expect, it } from "vitest";

import { CouncilParseError, parseChairmanResponse, parseCouncilCandidateResponse, parseCouncilReviewResponse } from "./parse";

describe("parseCouncilCandidateResponse", () => {
  it("parses a well-formed candidate response", () => {
    const raw = JSON.stringify({
      candidates: [
        { title: "Task capture", description: "Capture tasks quickly", tags: ["core"], extended_feature: false, rationale: "MVP essential" },
      ],
    });

    const result = parseCouncilCandidateResponse("A", raw);

    expect(result).toEqual({
      member: "A",
      candidates: [
        { title: "Task capture", description: "Capture tasks quickly", tags: ["core"], extendedFeature: false, rationale: "MVP essential" },
      ],
    });
  });

  it("throws CouncilParseError on invalid JSON", () => {
    expect(() => parseCouncilCandidateResponse("A", "not json")).toThrow(CouncilParseError);
  });

  it("throws when candidates array is missing", () => {
    expect(() => parseCouncilCandidateResponse("A", JSON.stringify({}))).toThrow(CouncilParseError);
  });
});

describe("parseCouncilReviewResponse", () => {
  it("parses a well-formed review response", () => {
    const raw = JSON.stringify({
      notes: [{ candidate_ref: "response_a::0", assessment: "Strong fit", keep: true }],
    });

    const result = parseCouncilReviewResponse("B", raw);

    expect(result).toEqual({
      member: "B",
      notes: [{ candidateRef: "response_a::0", assessment: "Strong fit", keep: true }],
    });
  });
});

describe("parseChairmanResponse", () => {
  it("parses options, downgrade-eligible required state, and dossier", () => {
    const raw = JSON.stringify({
      results: [
        {
          stage: "build_direction",
          options: [
            {
              title: "Task capture",
              description: "Capture tasks quickly",
              tags: ["core"],
              recommendation_state: "required",
              why_it_fits: "Every user needs this",
              extended_feature: false,
              selection_state: "selected",
            },
          ],
          assumptions: ["Users create tasks manually"],
        },
      ],
      dossier: { themes: ["capture"], assumptions: ["Users create tasks manually"] },
    });

    const parsed = parseChairmanResponse("build_direction", raw);

    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0].stage).toBe("build_direction");
    expect(parsed.results[0].options[0].recommendationState).toBe("required");
    expect(parsed.results[0].options[0].selectionState).toBe("selected");
    expect(parsed.dossier).toEqual({ themes: ["capture"], assumptions: ["Users create tasks manually"] });
  });

  it("throws CouncilParseError when results array is missing", () => {
    expect(() => parseChairmanResponse("build_direction", JSON.stringify({}))).toThrow(CouncilParseError);
  });

  it("rejects an invalid recommendation_state", () => {
    const raw = JSON.stringify({
      results: [
        {
          stage: "build_direction",
          options: [
            {
              title: "X",
              description: "Y",
              tags: [],
              recommendation_state: "mandatory",
              why_it_fits: "Z",
            },
          ],
          assumptions: [],
        },
      ],
    });

    expect(() => parseChairmanResponse("build_direction", raw)).toThrow();
  });
});
