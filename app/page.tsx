"use client";

import { useState } from "react";

import { IntakeScreen } from "@/components/protoprompt/intake-screen";
import { FinalPromptStage } from "@/components/protoprompt/final-prompt-stage";
import { MultiSelectStage } from "@/components/protoprompt/multi-select-stage";
import { PerPageStage } from "@/components/protoprompt/per-page-stage";
import { Button } from "@/components/ui/button";
import { clearGeneratedCouncilState } from "@/lib/protoprompt/cached-options";
import {
  MULTI_SELECT_STAGES,
  isPerPageStage,
  nextStage,
  previousStage,
} from "@/lib/protoprompt/stage-machine";
import { createProjectState } from "@/lib/protoprompt/types";
import type { ProjectState, ScopeMode, StageId } from "@/lib/protoprompt/types";

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

  function handleScopeChange(scopeMode: ScopeMode) {
    if (!project || project.scopeMode === scopeMode) return;
    setProject({ ...clearGeneratedCouncilState(project), scopeMode });
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

        {project && stage && (
          <section className="pp-glass flex flex-col gap-3 rounded-[var(--pp-radius)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="pp-label">scope mode</p>
              <p className="pp-text-muted mt-1 text-xs">
                Changing scope clears cached options and dossier, then regenerates this stage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={project.scopeMode === "enriched" ? "pp" : "ppGhost"}
                onClick={() => handleScopeChange("enriched")}
              >
                Enriched Building
              </Button>
              <Button
                size="sm"
                variant={project.scopeMode === "original" ? "pp" : "ppGhost"}
                onClick={() => handleScopeChange("original")}
              >
                Original Scope
              </Button>
            </div>
          </section>
        )}

        {showStage && project && stage && showMultiSelectStage && (
          <MultiSelectStage
            key={`${stage}::${project.scopeMode}`}
            stage={stage}
            project={project}
            onUpdateProject={handleUpdateProject}
            onContinue={handleAdvance}
            onBack={handleRetreat}
          />
        )}

        {showStage && project && stage && showPerPageStage && (
          <PerPageStage
            key={`${stage}::per-page::${project.scopeMode}`}
            stage={stage as "components" | "mockup_style"}
            project={project}
            onUpdateProject={handleUpdateProject}
            onContinue={handleAdvance}
            onBack={handleRetreat}
          />
        )}

        {project && !showStage && stage === null && <FinalPromptStage project={project} />}
      </main>
    </div>
  );
}
