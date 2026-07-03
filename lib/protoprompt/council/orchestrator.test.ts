import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProjectState } from "@/lib/protoprompt/types";

import { CHAIRMAN_SYSTEM_PROMPT, COUNCIL_MEMBERS } from "./prompts";

const generateMock = vi.fn();

vi.mock("@/lib/protoprompt/openai-client", () => ({
  openai: { text: { generate: (...args: unknown[]) => generateMock(...args) } },
}));

// Imported after the mock so the orchestrator picks up the mocked boundary.
const { runStage } = await import("./orchestrator");

const CANDIDATE_JSON = JSON.stringify({
  candidates: [
    { title: "Task capture", description: "Capture tasks quickly", tags: ["core"], extended_feature: false, rationale: "MVP essential" },
  ],
});

const REVIEW_JSON = JSON.stringify({
  notes: [{ candidate_ref: "response_a::0", assessment: "Strong fit", keep: true }],
});

const CHAIRMAN_JSON = JSON.stringify({
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

function defaultGenerateImpl({ system }: { system: string }) {
  if (system === CHAIRMAN_SYSTEM_PROMPT) return Promise.resolve(CHAIRMAN_JSON);
  if (Object.values(COUNCIL_MEMBERS).some((member) => member.basePrompt === system)) {
    return Promise.resolve(CANDIDATE_JSON);
  }
  if (Object.values(COUNCIL_MEMBERS).some((member) => member.reviewPrompt === system)) {
    return Promise.resolve(REVIEW_JSON);
  }
  return Promise.reject(new Error(`Unexpected system prompt: ${system}`));
}

beforeEach(() => {
  generateMock.mockReset();
  generateMock.mockImplementation(defaultGenerateImpl);
});

describe("runStage — fresh mode", () => {
  it("runs waves 1-3, downgrades required to recommended, and returns the dossier", async () => {
    const project = createProjectState("A task app", "Fieldnotes");

    const { result, dossier } = await runStage({ stage: "build_direction", project });

    expect(result.stage).toBe("build_direction");
    expect(result.options[0].recommendationState).toBe("recommended");
    expect(result.options[0].selectionState).toBe("selected");
    expect(dossier).toEqual({ themes: ["capture"], assumptions: ["Users create tasks manually"] });

    // 4 candidate calls + 4 review calls + 1 chairman call.
    expect(generateMock).toHaveBeenCalledTimes(9);
  });

  it("is fatal when a Wave 1 candidate call fails", async () => {
    generateMock.mockImplementation(({ system }: { system: string }) => {
      if (system === COUNCIL_MEMBERS.B.basePrompt) return Promise.reject(new Error("transient failure"));
      return defaultGenerateImpl({ system });
    });

    const project = createProjectState("A task app", "Fieldnotes");

    await expect(runStage({ stage: "build_direction", project })).rejects.toThrow("transient failure");
  });

  it("tolerates a Wave 2 reviewer failure and still produces a result", async () => {
    generateMock.mockImplementation(({ system }: { system: string }) => {
      if (system === COUNCIL_MEMBERS.C.reviewPrompt) return Promise.reject(new Error("reviewer down"));
      return defaultGenerateImpl({ system });
    });

    const project = createProjectState("A task app", "Fieldnotes");

    const { result } = await runStage({ stage: "build_direction", project });

    expect(result.options).toHaveLength(1);
  });

  it("retries the chairman once on a parse failure before giving up", async () => {
    let chairmanCalls = 0;
    generateMock.mockImplementation(({ system }: { system: string }) => {
      if (system === CHAIRMAN_SYSTEM_PROMPT) {
        chairmanCalls += 1;
        return chairmanCalls === 1 ? Promise.resolve("not json") : Promise.resolve(CHAIRMAN_JSON);
      }
      return defaultGenerateImpl({ system });
    });

    const project = createProjectState("A task app", "Fieldnotes");

    const { result } = await runStage({ stage: "build_direction", project });

    expect(chairmanCalls).toBe(2);
    expect(result.options).toHaveLength(1);
  });
});

describe("runStage — dossier mode", () => {
  it("skips waves 1-2 and only calls the chairman", async () => {
    const project = createProjectState("A task app", "Fieldnotes");
    project.councilDossier = { themes: ["capture"], assumptions: ["Users create tasks manually"] };

    const { result } = await runStage({ stage: "build_direction", project });

    expect(result.options).toHaveLength(1);
    expect(generateMock).toHaveBeenCalledTimes(1);
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ system: CHAIRMAN_SYSTEM_PROMPT })
    );
  });
});
