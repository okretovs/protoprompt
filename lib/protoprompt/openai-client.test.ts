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

  it("omits temperature because gpt-5 mini only accepts the default", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: "ok" } }],
    })));
    globalThis.fetch = fetchMock as typeof fetch;

    await openai.text.generate({
      system: "system",
      prompt: "prompt",
      temperature: 0.4,
      apiKey: "sk-user",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).not.toHaveProperty("temperature");
  });
});
