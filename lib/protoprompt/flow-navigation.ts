import { nextStage } from "@/lib/protoprompt/stage-machine";
import type { StageId } from "@/lib/protoprompt/types";

export function advanceStage(current: StageId | null): StageId | null {
  if (!current) return null;
  return nextStage(current);
}
