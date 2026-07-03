import { describe, expect, it } from "vitest";

import { OPENAI_KEY_STORAGE_KEY, isOpenAIKeyReady, readStoredOpenAIKey, saveStoredOpenAIKey, shouldHideSubmittedKey } from "./openai-key";

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

  it("reads and writes the key using the frontend storage key", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };

    expect(saveStoredOpenAIKey(storage, "  sk-test  ")).toBe("sk-test");
    expect(values.get(OPENAI_KEY_STORAGE_KEY)).toBe("sk-test");
    expect(readStoredOpenAIKey(storage)).toBe("sk-test");

    expect(saveStoredOpenAIKey(storage, " ")).toBe("");
    expect(readStoredOpenAIKey(storage)).toBe("");
  });
});
