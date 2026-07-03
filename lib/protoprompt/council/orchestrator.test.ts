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

function chairmanJsonFor(stage: "build_direction" | "data_sources" | "app_pages", withDossier = false): string {
  const titles: Record<typeof stage, string> = {
    build_direction: "Task capture",
    data_sources: "Manual notes",
    app_pages: "Dashboard",
  };
  const payload: Record<string, unknown> = {
    results: [
      {
        stage,
        options: [
          {
            title: titles[stage],
            description: "An option for the stage",
            tags: ["core"],
            recommendation_state: "recommended",
            why_it_fits: "It fits well",
            extended_feature: false,
            selection_state: "selected",
          },
        ],
        assumptions: ["Users create tasks manually"],
      },
    ],
  };
  if (withDossier) {
    payload.dossier = { themes: ["capture"], assumptions: ["Users create tasks manually"] };
  }
  return JSON.stringify(payload);
}

function stageFromPrompt(prompt: string): "build_direction" | "data_sources" | "app_pages" {
  const match = prompt.match(/Stage:\s*(\w+)/);
  if (!match) throw new Error(`Could not extract stage from prompt: ${prompt}`);
  const stage = match[1];
  if (stage !== "build_direction" && stage !== "data_sources" && stage !== "app_pages") {
    throw new Error(`Unsupported stage in test prompt: ${stage}`);
  }
  return stage;
}

function defaultGenerateImpl({ system, prompt }: { system: string; prompt: string }) {
  if (system === CHAIRMAN_SYSTEM_PROMPT) {
    const stage = stageFromPrompt(prompt);
    return Promise.resolve(chairmanJsonFor(stage, stage === "build_direction"));
  }
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
    generateMock.mockImplementation(({ system, prompt }: { system: string; prompt: string }) => {
      if (system === COUNCIL_MEMBERS.B.basePrompt) return Promise.reject(new Error("transient failure"));
      return defaultGenerateImpl({ system, prompt });
    });

    const project = createProjectState("A task app", "Fieldnotes");

    await expect(runStage({ stage: "build_direction", project })).rejects.toThrow("transient failure");
  });

  it("tolerates a Wave 2 reviewer failure and still produces a result", async () => {
    generateMock.mockImplementation(({ system, prompt }: { system: string; prompt: string }) => {
      if (system === COUNCIL_MEMBERS.C.reviewPrompt) return Promise.reject(new Error("reviewer down"));
      return defaultGenerateImpl({ system, prompt });
    });

    const project = createProjectState("A task app", "Fieldnotes");

    const { result } = await runStage({ stage: "build_direction", project });

    expect(result.options).toHaveLength(1);
  });

  it("retries the chairman once on a parse failure before giving up", async () => {
    let chairmanCalls = 0;
    generateMock.mockImplementation(({ system, prompt }: { system: string; prompt: string }) => {
      if (system === CHAIRMAN_SYSTEM_PROMPT) {
        chairmanCalls += 1;
        return chairmanCalls === 1
          ? Promise.resolve("not json")
          : Promise.resolve(chairmanJsonFor(stageFromPrompt(prompt), true));
      }
      return defaultGenerateImpl({ system, prompt });
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

    expect(result.stage).toBe("build_direction");
    expect(result.options).toHaveLength(1);
    expect(generateMock).toHaveBeenCalledTimes(1);
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ system: CHAIRMAN_SYSTEM_PROMPT })
    );
  });

  it.each([
    ["data_sources"] as const,
    ["app_pages"] as const,
  ])("only calls the chairman for %s when a dossier exists", async (stage) => {
    const project = createProjectState("A task app", "Fieldnotes");
    project.councilDossier = { themes: ["capture"], assumptions: ["Users create tasks manually"] };

    const { result } = await runStage({ stage, project });

    expect(result.stage).toBe(stage);
    expect(result.options).toHaveLength(1);
    expect(generateMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["data_sources"] as const,
    ["app_pages"] as const,
  ])("runs waves 1-3 in fresh mode for %s when no dossier exists", async (stage) => {
    const project = createProjectState("A task app", "Fieldnotes");

    const { result } = await runStage({ stage, project });

    expect(result.stage).toBe(stage);
    expect(result.options).toHaveLength(1);
    // 4 candidates + 4 reviews + 1 chairman.
    expect(generateMock).toHaveBeenCalledTimes(9);
  });
});
