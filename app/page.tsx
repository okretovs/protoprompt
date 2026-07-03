"use client";

import { useState } from "react";

import { BuildDirectionStage } from "@/components/protoprompt/build-direction-stage";
import { IntakeScreen } from "@/components/protoprompt/intake-screen";
import { Button } from "@/components/ui/button";
import { createProjectState } from "@/lib/protoprompt/types";
import type { ProjectState } from "@/lib/protoprompt/types";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [project, setProject] = useState<ProjectState | null>(null);

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

        {!project && (
          <IntakeScreen onSubmit={(idea, projectName) => setProject(createProjectState(idea, projectName))} />
        )}

        {project && (
          <BuildDirectionStage
            project={project}
            onDossier={(dossier) => setProject((current) => (current ? { ...current, councilDossier: dossier } : current))}
          />
        )}
      </main>
    </div>
  );
}
