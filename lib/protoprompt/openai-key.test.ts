import { describe, expect, it } from "vitest";

import { isOpenAIKeyReady, shouldHideSubmittedKey } from "./openai-key";

describe("OpenAI key intake helpers", () => {
  it("requires a non-empty key before submission", () => {
    expect(isOpenAIKeyReady("")).toBe(false);
    expect(isOpenAIKeyReady("   ")).toBe(false);
    expect(isOpenAIKeyReady("sk-test")).toBe(true);
  });

  it("hides the key field value after submission", () => {
    expect(shouldHideSubmittedKey(false)).toBe(false);
    expect(shouldHideSubmittedKey(true)).toBe(true);
  });
});
