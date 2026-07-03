import { describe, expect, it } from "vitest";

import {
  MULTI_SELECT_STAGES,
  PER_PAGE_STAGES,
  STAGE_SEQUENCE,
  backLabel,
  canGoBack,
  continueLabel,
  isPerPageStage,
  nextStage,
  previousStage,
} from "./stage-machine";

describe("stage machine", () => {
  describe("MULTI_SELECT_STAGES order", () => {
    it("lists Core Functionality → Data Sources → App Pages", () => {
      expect(MULTI_SELECT_STAGES).toEqual(["build_direction", "data_sources", "app_pages"]);
    });
  });

  describe("PER_PAGE_STAGES order", () => {
    it("lists Components → Mockup Style", () => {
      expect(PER_PAGE_STAGES).toEqual(["components", "mockup_style"]);
    });
  });

  describe("STAGE_SEQUENCE", () => {
    it("chains the multi-select stages into the per-page stages", () => {
      expect(STAGE_SEQUENCE).toEqual([
        "build_direction",
        "data_sources",
        "app_pages",
        "components",
        "mockup_style",
      ]);
    });
  });

  describe("isPerPageStage", () => {
    it("is true for components and mockup_style", () => {
      expect(isPerPageStage("components")).toBe(true);
      expect(isPerPageStage("mockup_style")).toBe(true);
    });

    it("is false for the multi-select stages and other stages", () => {
      expect(isPerPageStage("build_direction")).toBe(false);
      expect(isPerPageStage("data_sources")).toBe(false);
      expect(isPerPageStage("app_pages")).toBe(false);
      expect(isPerPageStage("intake")).toBe(false);
      expect(isPerPageStage("final_prompt")).toBe(false);
    });
  });

  describe("nextStage", () => {
    it("advances through the multi-select stages", () => {
      expect(nextStage("build_direction")).toBe("data_sources");
      expect(nextStage("data_sources")).toBe("app_pages");
    });

    it("advances from the last multi-select stage into the first per-page stage", () => {
      expect(nextStage("app_pages")).toBe("components");
    });

    it("advances between per-page stages", () => {
      expect(nextStage("components")).toBe("mockup_style");
    });

    it("returns null past the last per-page stage", () => {
      expect(nextStage("mockup_style")).toBeNull();
    });

    it("returns null for stages outside the sequence", () => {
      expect(nextStage("intake")).toBeNull();
      expect(nextStage("final_prompt")).toBeNull();
    });
  });

  describe("previousStage", () => {
    it("reverses the multi-select flow", () => {
      expect(previousStage("data_sources")).toBe("build_direction");
      expect(previousStage("app_pages")).toBe("data_sources");
    });

    it("reverses from the first per-page stage into the last multi-select stage", () => {
      expect(previousStage("components")).toBe("app_pages");
    });

    it("reverses between per-page stages", () => {
      expect(previousStage("mockup_style")).toBe("components");
    });

    it("returns the current stage at the head of the flow", () => {
      expect(previousStage("build_direction")).toBe("build_direction");
    });
  });

  describe("continueLabel", () => {
    it.each(MULTI_SELECT_STAGES)('uses "Continue" for %s', (stage) => {
      expect(continueLabel(stage)).toBe("Continue");
    });

    it('uses "Next page" mid a per-page stage', () => {
      expect(continueLabel("components", { pageIndex: 0, totalPages: 3 })).toBe("Next page");
      expect(continueLabel("mockup_style", { pageIndex: 1, totalPages: 3 })).toBe("Next page");
    });

    it('uses "Continue" on the last page of components (advances to mockup_style, not final)', () => {
      expect(continueLabel("components", { pageIndex: 2, totalPages: 3 })).toBe("Continue");
    });

    it('uses "Generate prompt" on the last page of mockup_style (advances to final_prompt)', () => {
      expect(continueLabel("mockup_style", { pageIndex: 2, totalPages: 3 })).toBe("Generate prompt");
    });

    it("handles a single-page flow as immediately last", () => {
      expect(continueLabel("mockup_style", { pageIndex: 0, totalPages: 1 })).toBe("Generate prompt");
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
      expect(canGoBack("components")).toBe(true);
      expect(canGoBack("mockup_style")).toBe(true);
    });

    it("is true mid a per-page stage even off the head, based on page index", () => {
      expect(canGoBack("components", { pageIndex: 1, totalPages: 3 })).toBe(true);
    });

    it("falls back to the stage position when on the first page of a per-page stage", () => {
      expect(canGoBack("components", { pageIndex: 0, totalPages: 3 })).toBe(true);
    });
  });
});
