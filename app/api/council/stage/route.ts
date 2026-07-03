import { NextResponse } from "next/server";

import { runGroupedStage, runStage } from "@/lib/protoprompt/council/orchestrator";
import { isPerPageStage } from "@/lib/protoprompt/stage-machine";
import type { ProjectState, StageId } from "@/lib/protoprompt/types";

const FLAT_STAGES: StageId[] = ["build_direction", "data_sources", "app_pages"];
const GROUPED_STAGES: StageId[] = ["components", "mockup_style"];
const SUPPORTED_STAGES: StageId[] = [...FLAT_STAGES, ...GROUPED_STAGES];

interface RunStageRequestBody {
  stage?: unknown;
  project?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RunStageRequestBody | null;

  if (!body || typeof body.stage !== "string" || typeof body.project !== "object" || body.project === null) {
    return NextResponse.json({ error: "Request must include stage and project" }, { status: 400 });
  }

  const stage = body.stage as StageId;
  if (!SUPPORTED_STAGES.includes(stage)) {
    return NextResponse.json({ error: `Unsupported stage: ${stage}` }, { status: 400 });
  }

  const project = body.project as ProjectState;

  try {
    if (isPerPageStage(stage)) {
      const { pageGroups, dossier } = await runGroupedStage({ stage, project });
      return NextResponse.json({ pageGroups, dossier });
    }
    const { result, dossier } = await runStage({ stage, project });
    return NextResponse.json({ result, dossier });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Council run failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
