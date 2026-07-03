import { describe, expect, it } from "vitest";

import { cacheKey, setCached } from "./cached-options";
import { selectedPageTitles } from "./pages";
import { createProjectState } from "./types";
import type { StageOption, StageOptionsResult } from "./types";

function makePageOption(id: string, title: string): StageOption {
  return {
    id,
    title,
    description: "",
    tags: [],
    recommendationState: "recommended",
    whyItFits: "",
    extendedFeature: false,
    selectionState: "unselected",
  };
}

function seedAppPages(): StageOptionsResult {
  return {
    stage: "app_pages",
    assumptions: [],
    options: [
      makePageOption("app_pages-0-dashboard", "Dashboard"),
      makePageOption("app_pages-1-settings", "Settings"),
      makePageOption("app_pages-2-reports", "Reports"),
    ],
  };
}

describe("selectedPageTitles", () => {
  it("returns an empty list before app_pages has run", () => {
    const project = createProjectState("idea", "Fieldnotes");
    expect(selectedPageTitles(project)).toEqual([]);
  });

  it("resolves selected option ids to titles, in app_pages option order", () => {
    let project = createProjectState("idea", "Fieldnotes");
    project = setCached(project, "app_pages", undefined, seedAppPages());
    project = {
      ...project,
      selections: {
        ...project.selections,
        [cacheKey("app_pages")]: ["app_pages-2-reports", "app_pages-0-dashboard"],
      },
    };

    expect(selectedPageTitles(project)).toEqual(["Dashboard", "Reports"]);
  });

  it("excludes unselected pages", () => {
    let project = createProjectState("idea", "Fieldnotes");
    project = setCached(project, "app_pages", undefined, seedAppPages());
    project = {
      ...project,
      selections: { ...project.selections, [cacheKey("app_pages")]: ["app_pages-1-settings"] },
    };

    expect(selectedPageTitles(project)).toEqual(["Settings"]);
  });
});
