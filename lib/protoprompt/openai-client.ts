/**
 * OpenAI client boundary (ADR 0002).
 *
 * Every council call goes through this boundary. Tests mock this module
 * instead of hitting the network (ADR 0006 / PRO-11 test seam).
 */

const OPENAI_MODEL = "gpt-5-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export interface GenerateParams {
  system: string;
  prompt: string;
  temperature: number;
  apiKey?: string;
}

export type StreamParams = GenerateParams;

async function generate({ system, prompt, apiKey: providedApiKey }: GenerateParams): Promise<string> {
  const apiKey = resolveApiKey(providedApiKey);
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const data: unknown = await response.json();
  const content = extractContent(data);
  if (content === undefined) {
    throw new Error("OpenAI response did not contain message content");
  }

  return content;
}

async function generateStreamRaw({
  system,
  prompt,
  apiKey: providedApiKey,
}: StreamParams): Promise<ReadableStream<Uint8Array>> {
  const apiKey = resolveApiKey(providedApiKey);
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenAI stream failed (${response.status}): ${body}`);
  }

  return response.body.pipeThrough(openAIEventStreamToText());
}

function resolveApiKey(providedApiKey: string | undefined): string | undefined {
  return providedApiKey?.trim() || process.env.OPENAI_API_KEY;
}

function openAIEventStreamToText(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice("data:".length).trim();
        if (!payload || payload === "[DONE]") continue;

        const content = extractStreamDelta(payload);
        if (content) controller.enqueue(encoder.encode(content));
      }
    },
    flush(controller) {
      const tail = decoder.decode();
      if (tail) buffer += tail;
      const payload = buffer.replace(/^data:\s*/, "").trim();
      if (!payload || payload === "[DONE]") return;
      const content = extractStreamDelta(payload);
      if (content) controller.enqueue(encoder.encode(content));
    },
  });
}

function extractStreamDelta(payload: string): string | undefined {
  const data = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: unknown } }> };
  const content = data.choices?.[0]?.delta?.content;
  return typeof content === "string" ? content : undefined;
}

export function isTransientOpenAIError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(408|409|429|500|502|503|504|rate|timeout|temporar|transient)\b/i.test(message);
}

export async function withTransientRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientOpenAIError(error)) throw error;
    return operation();
  }
}

function extractContent(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const message = (choices[0] as { message?: unknown }).message;
  if (typeof message !== "object" || message === null) return undefined;
  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content : undefined;
}

export const openai = {
  text: {
    generate,
    generateStreamRaw,
  },
};
