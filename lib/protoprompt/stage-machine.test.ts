import { describe, expect, it } from "vitest";

import { MULTI_SELECT_STAGES, backLabel, canGoBack, continueLabel, nextStage, previousStage } from "./stage-machine";

describe("stage machine", () => {
  describe("MULTI_SELECT_STAGES order", () => {
    it("lists Idea → Core Functionality → Data Sources → App Pages", () => {
      expect(MULTI_SELECT_STAGES).toEqual(["build_direction", "data_sources", "app_pages"]);
    });
  });

  describe("nextStage", () => {
    it("advances within the multi-select stages", () => {
      expect(nextStage("build_direction")).toBe("data_sources");
      expect(nextStage("data_sources")).toBe("app_pages");
    });

    it("returns null past the last stage", () => {
      expect(nextStage("app_pages")).toBeNull();
    });

    it("returns null for stages outside the multi-select flow", () => {
      expect(nextStage("intake")).toBeNull();
      expect(nextStage("components")).toBeNull();
      expect(nextStage("mockup_style")).toBeNull();
      expect(nextStage("final_prompt")).toBeNull();
    });

    it("stays on the per-page stage when a sub-context is set", () => {
      expect(nextStage("components", { pageTitle: "Dashboard" })).toBe("components");
    });
  });

  describe("previousStage", () => {
    it("reverses the multi-select flow", () => {
      expect(previousStage("data_sources")).toBe("build_direction");
      expect(previousStage("app_pages")).toBe("data_sources");
    });

    it("returns the current stage at the head of the flow", () => {
      expect(previousStage("build_direction")).toBe("build_direction");
    });

    it("stays on the per-page stage when a sub-context is set", () => {
      expect(previousStage("components", { pageTitle: "Dashboard" })).toBe("components");
    });
  });

  describe("continueLabel", () => {
    it.each(MULTI_SELECT_STAGES)('uses "Continue" for %s', (stage) => {
      expect(continueLabel(stage)).toBe("Continue");
    });

    it('uses "Next page" for per-page sub-contexts', () => {
      expect(continueLabel("components", { pageTitle: "Dashboard" })).toBe("Next page");
      expect(continueLabel("mockup_style", { pageTitle: "Dashboard" })).toBe("Next page");
    });
  });

  describe("backLabel", () => {
    it("is always Back at this slice", () => {
      expect(backLabel()).toBe("Back");
    });
  });

  describe("canGoBack", () => {
    it("is false at the head of the flow", () => {
      expect(canGoBack("build_direction")).toBe(false);
    });

    it("is true once the user has moved forward", () => {
      expect(canGoBack("data_sources")).toBe(true);
      expect(canGoBack("app_pages")).toBe(true);
    });
  });
});
