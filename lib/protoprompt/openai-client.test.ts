import { afterEach, describe, expect, it, vi } from "vitest";

import { openai } from "./openai-client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("openai client key handling", () => {
  it("uses a provided in-memory key for buffered calls", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: "ok" } }],
    })));
    globalThis.fetch = fetchMock as typeof fetch;

    await openai.text.generate({
      system: "system",
      prompt: "prompt",
      temperature: 0.1,
      apiKey: "sk-user",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer sk-user" }),
      })
    );
  });
});
