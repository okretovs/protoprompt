"use client";

import { useEffect, useRef, useState } from "react";

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
import { selectedPageTitles } from "@/lib/protoprompt/pages";
import { seedDefaultSelection } from "@/lib/protoprompt/selection";
import { backLabel, canGoBack, continueLabel } from "@/lib/protoprompt/stage-machine";
import type {
  CouncilDossier,
  PageGroup,
  ProjectState,
  StageId,
} from "@/lib/protoprompt/types";

interface PerPageStageProps {
  stage: "components" | "mockup_style";
  project: ProjectState;
  openAIKey: string;
  onUpdateProject: (next: ProjectState) => void;
  onContinue: () => void;
  onBack: () => void;
}

type RunState = { status: "loading" } | { status: "error"; message: string } | { status: "ready" };

const SECTION_KICKER: Record<StageId, string> = {
  build_direction: "core functionality",
  data_sources: "data sources",
  app_pages: "app pages",
  intake: "your idea",
  components: "components",
  mockup_style: "mockup style",
  final_prompt: "final prompt",
};

export function PerPageStage({ stage, project, openAIKey, onUpdateProject, onContinue, onBack }: PerPageStageProps) {
  const pages = selectedPageTitles(project);
  const [pageIndex, setPageIndex] = useState(0);
  const [run, setRun] = useState<RunState>(() =>
    pages.every((title) => getCached(project, stage, title) !== undefined) ? { status: "ready" } : { status: "loading" }
  );
  const fetchedRef = useRef(false);

  const currentPageTitle = pages[pageIndex];
  const isMockup = stage === "mockup_style";

  useEffect(() => {
    if (fetchedRef.current) return;
    if (pages.every((title) => getCached(project, stage, title) !== undefined)) return;

    fetchedRef.current = true;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/council/stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, project, openAIKey }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Council run failed");
        }
        if (cancelled) return;

        const pageGroups = data.pageGroups as PageGroup[];
        const dossier = data.dossier as CouncilDossier | undefined;

        let nextProject = project;
        for (const group of pageGroups) {
          nextProject = setCached(nextProject, stage, group.pageTitle, {
            stage,
            options: group.options,
            assumptions: group.assumptions,
          });
        }
        if (dossier) {
          nextProject = { ...nextProject, councilDossier: dossier };
        }
        nextProject = appendAssumptions(nextProject, pageGroups.flatMap((group) => group.assumptions));
        onUpdateProject(nextProject);
        setRun({ status: "ready" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, project, openAIKey, onUpdateProject]);

  function retryWithoutCache() {
    const nextProject = clearGeneratedCouncilState(project);
    fetchedRef.current = false;
    onUpdateProject(nextProject);
    setRun({ status: "loading" });
  }

  const currentGroup = run.status === "ready" && currentPageTitle !== undefined
    ? getCached(project, stage, currentPageTitle)
    : undefined;

  const persisted = currentPageTitle !== undefined
    ? project.selections[cacheKey(stage, currentPageTitle)]
    : undefined;
  const selectedIds = currentGroup
    ? seedDefaultSelection(currentGroup.options, persisted, Boolean(persisted?.length))
    : [];

  function toggleOption(id: string) {
    if (currentPageTitle === undefined) return;
    const current = selectedIds;
    const next = isMockup ? [id] : current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

    onUpdateProject({
      ...project,
      selections: { ...project.selections, [cacheKey(stage, currentPageTitle)]: next },
    });
  }

  function handleContinue() {
    if (pageIndex < pages.length - 1) {
      setPageIndex((index) => index + 1);
      return;
    }
    onContinue();
  }

  function handleBack() {
    if (pageIndex > 0) {
      setPageIndex((index) => index - 1);
      return;
    }
    onBack();
  }

  if (run.status === "loading") {
    return <CouncilLoading wave={project.councilDossier ? "chairman" : "candidates"} />;
  }

  if (run.status === "error") {
    return <CouncilErrorCard message={run.message} onRetry={retryWithoutCache} />;
  }

  if (!currentGroup || currentPageTitle === undefined) {
    return null;
  }

  const subContext = { pageIndex, totalPages: pages.length };

  return (
    <section className="pp-fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="pp-section-kicker">{SECTION_KICKER[stage]}</span>
        <span className="pp-label">
          page {pageIndex + 1} of {pages.length} — {currentPageTitle}
        </span>
      </div>

      <AssumptionsSummary assumptions={currentGroup.assumptions} />

      <div className="grid gap-5 sm:grid-cols-2">
        {currentGroup.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedIds.includes(option.id)}
            onToggle={toggleOption}
            variant={isMockup ? "radio-mockup" : "select"}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ppGhost"
          size="sm"
          disabled={!canGoBack(stage, subContext)}
          onClick={handleBack}
        >
          {backLabel()}
        </Button>
        <Button
          variant="pp"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={handleContinue}
        >
          {continueLabel(stage, subContext)}
        </Button>
      </div>
    </section>
  );
}
