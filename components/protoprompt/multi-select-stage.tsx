"use client";

import { useEffect, useState } from "react";

import { AssumptionsSummary } from "@/components/protoprompt/assumptions-summary";
import { OptionCard } from "@/components/protoprompt/option-card";
import { Button } from "@/components/ui/button";
import {
  appendAssumptions,
  cacheKey,
  getCached,
  setCached,
} from "@/lib/protoprompt/cached-options";
import { seedDefaultSelection } from "@/lib/protoprompt/selection";
import { backLabel, canGoBack as canGoBackFor, continueLabel } from "@/lib/protoprompt/stage-machine";
import type {
  CouncilDossier,
  ProjectState,
  StageId,
  StageOptionsResult,
} from "@/lib/protoprompt/types";

interface MultiSelectStageProps {
  stage: StageId;
  project: ProjectState;
  onUpdateProject: (next: ProjectState) => void;
  onContinue: () => void;
  onBack: () => void;
}

type RunState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: StageOptionsResult };

const SECTION_KICKER: Record<StageId, string> = {
  build_direction: "core functionality",
  data_sources: "data sources",
  app_pages: "app pages",
  intake: "your idea",
  components: "components",
  mockup_style: "mockup style",
  final_prompt: "final prompt",
};

export function MultiSelectStage({ stage, project, onUpdateProject, onContinue, onBack }: MultiSelectStageProps) {
  const persistedSelection = project.selections[cacheKey(stage)];

  const [run, setRun] = useState<RunState>(() => {
    const cached = getCached(project, stage);
    return cached ? { status: "ready", result: cached } : { status: "loading" };
  });
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const cached = getCached(project, stage);
    return seedDefaultSelection(
      cached?.options ?? [],
      persistedSelection,
      Boolean(persistedSelection?.length)
    );
  });

  useEffect(() => {
    const cached = getCached(project, stage);
    if (cached) return;

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/council/stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, project }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Council run failed");
        }
        if (cancelled) return;

        const result = data.result as StageOptionsResult;
        const dossier = data.dossier as CouncilDossier | undefined;

        let nextProject = setCached(project, stage, undefined, result);
        if (dossier) {
          nextProject = { ...nextProject, councilDossier: dossier };
        }
        nextProject = appendAssumptions(nextProject, result.assumptions);
        onUpdateProject(nextProject);

        const persistedAfter = nextProject.selections[cacheKey(stage)];
        setRun({ status: "ready", result });
        setSelectedIds(
          seedDefaultSelection(
            result.options,
            persistedAfter,
            Boolean(persistedAfter?.length)
          )
        );
      } catch (error) {
        if (cancelled) return;
        setRun({
          status: "error",
          message: error instanceof Error ? error.message : "Council run failed",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stage, project, onUpdateProject]);

  function toggleOption(id: string) {
    setSelectedIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      onUpdateProject({
        ...project,
        selections: { ...project.selections, [cacheKey(stage)]: next },
      });
      return next;
    });
  }

  if (run.status === "loading") {
    return (
      <section className="pp-fade-in flex flex-col items-start gap-3">
        <span className="pp-step-dot" data-status="current" />
        <p className="pp-label">convening the council — waves 1 / 2 / 3</p>
      </section>
    );
  }

  if (run.status === "error") {
    return (
      <section className="pp-fade-in pp-card flex flex-col gap-3" data-selected="true">
        <p className="pp-text-primary text-sm font-medium">Generation failed</p>
        <p className="pp-text-secondary text-sm">{run.message}</p>
      </section>
    );
  }

  return (
    <section className="pp-fade-in flex flex-col gap-5">
      <span className="pp-section-kicker">{SECTION_KICKER[stage]}</span>

      <AssumptionsSummary assumptions={run.result.assumptions} />

      <div className="grid gap-5 sm:grid-cols-2">
        {run.result.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedIds.includes(option.id)}
            onToggle={toggleOption}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ppGhost"
          size="sm"
          disabled={!canGoBackFor(stage)}
          onClick={onBack}
        >
          {backLabel()}
        </Button>
        <Button
          variant="pp"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={onContinue}
        >
          {continueLabel(stage)}
        </Button>
      </div>
    </section>
  );
}
