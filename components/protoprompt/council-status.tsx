"use client";

import { Button } from "@/components/ui/button";

export type CouncilWave = "candidates" | "reviews" | "chairman" | "final";

const WAVE_COPY: Record<CouncilWave, string> = {
  candidates: "Council members are independently generating candidates...",
  reviews: "Council members are anonymously reviewing each candidate set...",
  chairman: "The Chairman is synthesizing the council's strongest ideas...",
  final: "The Chairman is streaming the final operating brief...",
};

export function CouncilLoading({ wave }: { wave: CouncilWave }) {
  return (
    <section className="pp-fade-in pp-card flex flex-col items-start gap-3">
      <span className="pp-signal-dot" aria-hidden="true" />
      <p className="pp-text-primary pp-mono text-sm">{WAVE_COPY[wave]}</p>
      <p className="pp-text-muted text-xs">
        Parallel backend calls are in flight; this stage will update as soon as the council resolves.
      </p>
    </section>
  );
}

export function CouncilErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="pp-fade-in pp-card pp-error-card flex flex-col gap-3">
      <p className="pp-text-primary text-sm font-medium">Generation failed</p>
      <p className="pp-text-secondary text-sm">{message}</p>
      <Button variant="ppGhost" size="sm" onClick={onRetry}>
        Retry without cache
      </Button>
    </section>
  );
}
