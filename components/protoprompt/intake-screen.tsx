"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { isOpenAIKeyReady, shouldHideSubmittedKey } from "@/lib/protoprompt/openai-key";

interface IntakeScreenProps {
  onSubmit: (idea: string, projectName: string, openAIKey: string) => void;
}

export function IntakeScreen({ onSubmit }: IntakeScreenProps) {
  const [idea, setIdea] = useState("");
  const [projectName, setProjectName] = useState("");
  const [openAIKey, setOpenAIKey] = useState("");
  const [submittedKey, setSubmittedKey] = useState(false);

  const canConvene = idea.trim().length > 0 && projectName.trim().length > 0 && isOpenAIKeyReady(openAIKey);

  function handleConvene() {
    if (!canConvene) return;
    setSubmittedKey(true);
    onSubmit(idea.trim(), projectName.trim(), openAIKey.trim());
  }

  function handleNewIdea() {
    setIdea("");
    setProjectName("");
    setOpenAIKey("");
    setSubmittedKey(false);
  }

  return (
    <section className="pp-fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <span className="pp-section-kicker">your idea</span>
        <Button variant="ppGhost" size="sm" onClick={handleNewIdea}>
          New idea
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="openai-key" className="pp-label">
          OpenAI API key
        </label>
        <input
          id="openai-key"
          type="password"
          value={shouldHideSubmittedKey(submittedKey) ? "" : openAIKey}
          onChange={(event) => setOpenAIKey(event.target.value)}
          placeholder="sk-..."
          autoComplete="off"
          className="pp-mono rounded-[var(--pp-radius-sm)] border border-[var(--pp-border-hairline)] bg-[var(--pp-glass)] px-3 py-2 text-sm text-[var(--pp-text-primary)] outline-none placeholder:text-[var(--pp-text-muted)] focus-visible:border-[var(--pp-border-strong)]"
        />
        <p className="pp-text-muted text-xs">
          Required for Day 0. Kept in memory only; never saved to browser storage.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="project-name" className="pp-label">
          project name
        </label>
        <input
          id="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="e.g. Fieldnotes"
          className="pp-mono rounded-[var(--pp-radius-sm)] border border-[var(--pp-border-hairline)] bg-[var(--pp-glass)] px-3 py-2 text-sm text-[var(--pp-text-primary)] outline-none placeholder:text-[var(--pp-text-muted)] focus-visible:border-[var(--pp-border-strong)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="idea" className="pp-label">
          one-line idea
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="A tool that turns field notes into structured reports."
          rows={3}
          className="rounded-[var(--pp-radius-sm)] border border-[var(--pp-border-hairline)] bg-[var(--pp-glass)] px-3 py-2 text-sm text-[var(--pp-text-primary)] outline-none placeholder:text-[var(--pp-text-muted)] focus-visible:border-[var(--pp-border-strong)]"
        />
      </div>

      <div>
        <p className="pp-label">read-only summary</p>
        <div className="pp-card mt-2 flex flex-col gap-3">
          <div>
            <p className="pp-label">project name</p>
            <p className="pp-text-primary mt-1 text-lg font-medium">{projectName || "—"}</p>
          </div>
          <hr className="pp-divider" />
          <div>
            <p className="pp-label">idea</p>
            <p className="pp-text-secondary mt-1 text-sm leading-relaxed">{idea || "—"}</p>
          </div>
        </div>
      </div>

      <div>
        <Button variant="pp" size="sm" disabled={!canConvene} onClick={handleConvene}>
          Convene the council
        </Button>
      </div>
    </section>
  );
}
