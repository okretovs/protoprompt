"use client";

import { useEffect, useState } from "react";

import { CouncilErrorCard, CouncilLoading } from "@/components/protoprompt/council-status";
import { Button } from "@/components/ui/button";
import { markdownFileName } from "@/lib/protoprompt/final-prompt-file";
import { mockFinalPrompt } from "@/lib/protoprompt/testing-flow";
import type { ProjectState } from "@/lib/protoprompt/types";

interface FinalPromptStageProps {
  project: ProjectState;
  openAIKey: string;
  testingMode?: boolean;
}

type RunState =
  | { status: "loading"; markdown: string }
  | { status: "error"; message: string; markdown: string }
  | { status: "ready"; markdown: string };

export function FinalPromptStage({ project, openAIKey, testingMode = false }: FinalPromptStageProps) {
  const [run, setRun] = useState<RunState>({ status: "loading", markdown: "" });
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function streamPrompt(attempt = 0): Promise<void> {
      setRun({ status: "loading", markdown: "" });
      try {
        if (testingMode) {
          const markdown = mockFinalPrompt(project);
          setRun({ status: "ready", markdown });
          return;
        }
        const markdown = await readPromptStream(project, openAIKey, abortController.signal, (chunk) => {
          setRun((current) => ({ status: "loading", markdown: current.markdown + chunk }));
        });
        setRun({ status: "ready", markdown });
      } catch (error) {
        if (abortController.signal.aborted) return;
        if (attempt === 0) {
          await streamPrompt(1);
          return;
        }
        setRun({
          status: "error",
          message: error instanceof Error ? error.message : "Final prompt stream failed",
          markdown: "",
        });
      }
    }

    void streamPrompt();
    return () => abortController.abort();
  }, [project, openAIKey, testingMode, generation]);

  async function handleCopy() {
    const markdown = run.markdown;
    await navigator.clipboard.writeText(markdown);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy"), 1200);
  }

  function handleDownload() {
    const blob = new Blob([run.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = markdownFileName(project.projectName);
    link.click();
    URL.revokeObjectURL(url);
  }

  function regenerate() {
    setGeneration((value) => value + 1);
  }

  if (run.status === "error") {
    return <CouncilErrorCard message={run.message} onRetry={regenerate} />;
  }

  return (
    <section className="pp-fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="pp-section-kicker">final prompt</span>
        <div className="flex items-center gap-2">
          <Button variant="ppGhost" size="sm" disabled={!run.markdown} onClick={handleCopy}>
            {copyLabel}
          </Button>
          <Button variant="ppGhost" size="sm" disabled={!run.markdown} onClick={handleDownload}>
            Download .md
          </Button>
          <Button variant="pp" size="sm" onClick={regenerate}>
            Regenerate
          </Button>
        </div>
      </div>

      {run.status === "loading" && !run.markdown && <CouncilLoading wave="final" />}

      <pre className="pp-prompt-surface min-h-80 overflow-x-auto whitespace-pre-wrap">
        {run.markdown || "Awaiting streamed markdown..."}
      </pre>
    </section>
  );
}

export async function readPromptStream(
  project: ProjectState,
  openAIKey: string,
  signal: AbortSignal,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch("/api/council/final-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, openAIKey }),
    signal,
  });
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Final prompt stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let markdown = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    markdown += chunk;
    onChunk(chunk);
  }

  const tail = decoder.decode();
  if (tail) {
    markdown += tail;
    onChunk(tail);
  }
  return markdown;
}
