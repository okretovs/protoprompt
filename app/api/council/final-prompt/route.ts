import { NextResponse } from "next/server";

import { generateFinalPrompt } from "@/lib/protoprompt/final-prompt";
import type { ProjectState } from "@/lib/protoprompt/types";

interface FinalPromptRequestBody {
  project?: unknown;
  openAIKey?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FinalPromptRequestBody | null;

  if (!body || typeof body.project !== "object" || body.project === null) {
    return NextResponse.json({ error: "Request must include project" }, { status: 400 });
  }

  try {
    const apiKey = typeof body.openAIKey === "string" ? body.openAIKey : undefined;
    const stream = await generateFinalPrompt({ project: body.project as ProjectState, apiKey });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Final prompt generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
