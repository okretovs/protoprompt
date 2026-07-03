"use client";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { StageOption } from "@/lib/protoprompt/types";

interface OptionCardProps {
  option: StageOption;
  selected: boolean;
  onToggle: (id: string) => void;
  /** "select" (default) is unlimited multi-select. "radio-mockup" adds the ASCII wireframe and single-select semantics. */
  variant?: "select" | "radio-mockup";
}

const RECOMMENDATION_LABEL: Record<StageOption["recommendationState"], string> = {
  recommended: "recommended",
  optional: "optional",
  deferred: "deferred",
};

export function OptionCard({ option, selected, onToggle, variant = "select" }: OptionCardProps) {
  const isMockup = variant === "radio-mockup";

  return (
    <article className="pp-card flex flex-col" data-selected={selected ? "true" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span className="pp-section-kicker">{RECOMMENDATION_LABEL[option.recommendationState]}</span>
        {option.extendedFeature && <span className="pp-badge pp-badge-extended">extended feature</span>}
      </div>

      <h3 className="pp-text-primary mt-3 text-xl font-medium">{option.title}</h3>
      <p className="pp-text-secondary mt-2 text-sm leading-relaxed">{option.description}</p>

      {isMockup && option.wireframe && option.wireframe.length > 0 && (
        <pre className="pp-mono pp-glass mt-3 overflow-x-auto rounded-[var(--pp-radius-sm)] px-3 py-2 text-[0.6875rem] leading-relaxed text-[var(--pp-text-secondary)]">
          {option.wireframe.join("\n")}
        </pre>
      )}

      {option.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {option.tags.map((tag) => (
            <li key={tag} className="pp-badge">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant={selected ? "pp" : "ppGhost"}
          size="sm"
          role={isMockup ? "radio" : undefined}
          aria-checked={isMockup ? selected : undefined}
          aria-pressed={isMockup ? undefined : selected}
          onClick={() => onToggle(option.id)}
        >
          {selected ? "Selected" : isMockup ? "Choose" : "Select"}
        </Button>

        <HoverCard>
          <HoverCardTrigger
            render={
              <Button variant="ppGhost" size="sm">
                Why it fits
              </Button>
            }
          />
          <HoverCardContent className="pp-glass pp-mono text-xs">
            <p className="pp-text-secondary">{option.whyItFits}</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </article>
  );
}
