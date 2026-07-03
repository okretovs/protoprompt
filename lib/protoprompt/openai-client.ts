/**
 * OpenAI client boundary (ADR 0002).
 *
 * Every council call goes through `openai.text.generate`, a single buffered
 * seam. Tests mock this module instead of hitting the network (ADR 0006 /
 * PRO-11 test seam). Streaming (`generateStreamRaw`, for the final prompt
 * stage) is out of scope for this slice.
 */

const OPENAI_MODEL = "gpt-5-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export interface GenerateParams {
  system: string;
  prompt: string;
  temperature: number;
}

async function generate({ system, prompt, temperature }: GenerateParams): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
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
      temperature,
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
  },
};
