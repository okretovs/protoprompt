import { describe, expect, it } from "vitest";

import {
  CouncilParseError,
  parseChairmanResponse,
  parseCouncilCandidateResponse,
  parseCouncilReviewResponse,
  parseGroupedStageResponse,
} from "./parse";

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

describe("parseGroupedStageResponse", () => {
  function componentOption(overrides: Record<string, unknown> = {}) {
    return {
      title: "Filter bar",
      description: "Filters the list by status",
      tags: ["core"],
      recommendation_state: "recommended",
      why_it_fits: "Keeps the list scannable",
      extended_feature: false,
      selection_state: "unselected",
      ...overrides,
    };
  }

  function mockupOption(overrides: Record<string, unknown> = {}) {
    return {
      ...componentOption(),
      tags: ["dense", "list-first"],
      wireframe: ["+--------------------------------+", "| Dashboard                       |", "|----------------------------------|", "| [ Filter ]        [ + Add ]      |"],
      ...overrides,
    };
  }

  it("parses one group per page for a non-mockup grouped stage (components)", () => {
    const raw = JSON.stringify({
      page_groups: [
        { page_title: "Dashboard", options: [componentOption()], assumptions: ["Users triage daily"] },
        { page_title: "Settings", options: [componentOption({ title: "Toggle list" })], assumptions: [] },
      ],
    });

    const parsed = parseGroupedStageResponse("components", raw);

    expect(parsed.pageGroups).toHaveLength(2);
    expect(parsed.pageGroups[0].pageTitle).toBe("Dashboard");
    expect(parsed.pageGroups[0].options[0].title).toBe("Filter bar");
    expect(parsed.pageGroups[0].options[0].wireframe).toBeUndefined();
    expect(parsed.pageGroups[1].pageTitle).toBe("Settings");
  });

  it("requires a 4-7 line wireframe and 2-4 tags for mockup_style options", () => {
    const raw = JSON.stringify({
      page_groups: [{ page_title: "Dashboard", options: [mockupOption()], assumptions: [] }],
    });

    const parsed = parseGroupedStageResponse("mockup_style", raw);

    expect(parsed.pageGroups[0].options[0].wireframe).toHaveLength(4);
    expect(parsed.pageGroups[0].options[0].tags).toHaveLength(2);
  });

  it("throws when a mockup_style option's wireframe is too short", () => {
    const raw = JSON.stringify({
      page_groups: [
        { page_title: "Dashboard", options: [mockupOption({ wireframe: ["one line"] })], assumptions: [] },
      ],
    });

    expect(() => parseGroupedStageResponse("mockup_style", raw)).toThrow(CouncilParseError);
  });

  it("throws when a mockup_style option has too many tags", () => {
    const raw = JSON.stringify({
      page_groups: [
        {
          page_title: "Dashboard",
          options: [mockupOption({ tags: ["a", "b", "c", "d", "e"] })],
          assumptions: [],
        },
      ],
    });

    expect(() => parseGroupedStageResponse("mockup_style", raw)).toThrow(CouncilParseError);
  });

  it("throws CouncilParseError when page_groups array is missing", () => {
    expect(() => parseGroupedStageResponse("components", JSON.stringify({}))).toThrow(CouncilParseError);
  });

  it("generates stable ids scoped to the page title", () => {
    const raw = JSON.stringify({
      page_groups: [{ page_title: "Dashboard", options: [componentOption()], assumptions: [] }],
    });

    const parsed = parseGroupedStageResponse("components", raw);

    expect(parsed.pageGroups[0].options[0].id).toBe("components-dashboard-0-filter-bar");
  });
});
