"use client";

import { useState } from "react";

import { IntakeScreen } from "@/components/protoprompt/intake-screen";
import { MultiSelectStage } from "@/components/protoprompt/multi-select-stage";
import { PerPageStage } from "@/components/protoprompt/per-page-stage";
import { Button } from "@/components/ui/button";
import {
  MULTI_SELECT_STAGES,
  isPerPageStage,
  nextStage,
  previousStage,
} from "@/lib/protoprompt/stage-machine";
import { createProjectState } from "@/lib/protoprompt/types";
import type { ProjectState, StageId } from "@/lib/protoprompt/types";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [project, setProject] = useState<ProjectState | null>(null);
  const [stage, setStage] = useState<StageId | null>(null);

  function handleUpdateProject(next: ProjectState) {
    setProject(next);
  }

  function handleAdvance() {
    if (!stage) return;
    const next = nextStage(stage);
    if (next) setStage(next);
  }

  function handleRetreat() {
    if (!stage) return;
    setStage(previousStage(stage));
  }

  function handleReset() {
    setProject(null);
    setStage(null);
  }

  const showMultiSelectStage =
    project !== null && stage !== null && (MULTI_SELECT_STAGES as StageId[]).includes(stage);
  const showPerPageStage =
    project !== null && stage !== null && isPerPageStage(stage);
  const showStage = showMultiSelectStage || showPerPageStage;

  return (
    <div
      className="protoprompt-root flex min-h-screen flex-col"
      data-theme={theme === "light" ? "light" : undefined}
    >
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
        <header className="pp-fade-in flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="pp-section-kicker">{"// software-factory · console"}</span>
            <Button
              size="sm"
              variant="ppGhost"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
          </div>
          <h1 className="pp-text-primary text-4xl font-semibold tracking-tight">ProtoPrompt</h1>
          <p className="pp-text-secondary max-w-xl text-lg leading-relaxed">
            Council-guided planning for vibe-coding tools. We turn vibe coding into agentic
            engineering.
          </p>
        </header>

        <hr className="pp-divider" />

        {!project && <IntakeScreen onSubmit={(idea, projectName) => {
          const next = createProjectState(idea, projectName);
          setProject(next);
          setStage("build_direction");
        }} />}

        {project && stage && project.councilDossier && (
          <div className="pp-text-muted pp-mono flex items-center justify-between gap-3 text-xs">
            <span>dossier mode — later stages reuse the cached council context.</span>
            <Button size="sm" variant="ppGhost" onClick={handleReset}>
              New idea
            </Button>
          </div>
        )}

        {showStage && project && stage && showMultiSelectStage && (
          <MultiSelectStage
            key={`${stage}::`}
            stage={stage}
            project={project}
            onUpdateProject={handleUpdateProject}
            onContinue={handleAdvance}
            onBack={handleRetreat}
          />
        )}

        {showStage && project && stage && showPerPageStage && (
          <PerPageStage
            key={`${stage}::per-page`}
            stage={stage as "components" | "mockup_style"}
            project={project}
            onUpdateProject={handleUpdateProject}
            onContinue={handleAdvance}
            onBack={handleRetreat}
          />
        )}

        {project && !showStage && (
          <Button size="sm" variant="ppGhost" onClick={handleReset}>
            New idea
          </Button>
        )}
      </main>
    </div>
  );
}
