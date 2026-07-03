"use client";

import { useEffect, useRef, useState } from "react";

import { AssumptionsSummary } from "@/components/protoprompt/assumptions-summary";
import { OptionCard } from "@/components/protoprompt/option-card";
import { Button } from "@/components/ui/button";
import { seedDefaultSelection } from "@/lib/protoprompt/selection";
import type { CouncilDossier, ProjectState, StageOptionsResult } from "@/lib/protoprompt/types";

interface BuildDirectionStageProps {
  project: ProjectState;
  onDossier: (dossier: CouncilDossier) => void;
}

type RunState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: StageOptionsResult };

export function BuildDirectionStage({ project, onDossier }: BuildDirectionStageProps) {
  const [run, setRun] = useState<RunState>({ status: "loading" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const hasUserChosen = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setRun({ status: "loading" });
      try {
        const response = await fetch("/api/council/stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: "build_direction", project }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Council run failed");
        }
        if (cancelled) return;

        const result = data.result as StageOptionsResult;
        setRun({ status: "ready", result });
        setSelectedIds(seedDefaultSelection(result.options, selectedIds, hasUserChosen.current));
        if (data.dossier) onDossier(data.dossier as CouncilDossier);
      } catch (error) {
        if (cancelled) return;
        setRun({ status: "error", message: error instanceof Error ? error.message : "Council run failed" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleOption(id: string) {
    hasUserChosen.current = true;
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
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
      <span className="pp-section-kicker">core functionality</span>

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

      <div>
        <Button variant="pp" size="sm" disabled={selectedIds.length === 0}>
          Continue
        </Button>
      </div>
    </section>
  );
}
