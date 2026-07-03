"use client";

import { useEffect, useState } from "react";

import { AssumptionsSummary } from "@/components/protoprompt/assumptions-summary";
import { CouncilErrorCard, CouncilLoading } from "@/components/protoprompt/council-status";
import { OptionCard } from "@/components/protoprompt/option-card";
import { Button } from "@/components/ui/button";
import {
  appendAssumptions,
  cacheKey,
  clearGeneratedCouncilState,
  getCached,
  setCached,
} from "@/lib/protoprompt/cached-options";
import { persistDefaultSelection, seedDefaultSelection } from "@/lib/protoprompt/selection";
import { backLabel, canGoBack as canGoBackFor, continueLabel } from "@/lib/protoprompt/stage-machine";
import { TESTING_DOSSIER, mockStageResult } from "@/lib/protoprompt/testing-flow";
import type {
  CouncilDossier,
  ProjectState,
  StageId,
  StageOptionsResult,
} from "@/lib/protoprompt/types";

interface MultiSelectStageProps {
  stage: StageId;
  project: ProjectState;
  openAIKey: string;
  testingMode?: boolean;
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

export function MultiSelectStage({
  stage,
  project,
  openAIKey,
  testingMode = false,
  onUpdateProject,
  onContinue,
  onBack,
}: MultiSelectStageProps) {
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
        const { result, dossier } = testingMode
          ? { result: mockStageResult(stage), dossier: TESTING_DOSSIER }
          : await fetchStageResult(stage, project, openAIKey);
        if (cancelled) return;

        let nextProject = setCached(project, stage, undefined, result);
        if (dossier) {
          nextProject = { ...nextProject, councilDossier: dossier };
        }
        nextProject = appendAssumptions(nextProject, result.assumptions);

        const defaulted = persistDefaultSelection(nextProject, stage, result.options);
        nextProject = defaulted.project;
        onUpdateProject(nextProject);

        setRun({ status: "ready", result });
        setSelectedIds(defaulted.selectedIds);
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
  }, [stage, project, openAIKey, testingMode, onUpdateProject]);

  function retryWithoutCache() {
    const nextProject = clearGeneratedCouncilState(project);
    onUpdateProject(nextProject);
    setRun({ status: "loading" });
    setSelectedIds([]);
  }

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
    return <CouncilLoading wave={project.councilDossier ? "chairman" : "candidates"} />;
  }

  if (run.status === "error") {
    return <CouncilErrorCard message={run.message} onRetry={retryWithoutCache} />;
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

async function fetchStageResult(
  stage: StageId,
  project: ProjectState,
  openAIKey: string
): Promise<{ result: StageOptionsResult; dossier?: CouncilDossier }> {
  const response = await fetch("/api/council/stage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, project, openAIKey }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Council run failed");
  }
  return { result: data.result as StageOptionsResult, dossier: data.dossier as CouncilDossier | undefined };
}
