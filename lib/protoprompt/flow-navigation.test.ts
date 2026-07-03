import { describe, expect, it } from "vitest";

import { advanceStage } from "./flow-navigation";

describe("advanceStage", () => {
  it("returns null from the final mockup style stage so the final prompt renders", () => {
    expect(advanceStage("mockup_style")).toBeNull();
  });

  it("advances ordinary stages", () => {
    expect(advanceStage("app_pages")).toBe("components");
  });
});
