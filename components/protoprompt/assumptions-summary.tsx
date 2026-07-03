"use client";

import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AssumptionsSummaryProps {
  assumptions: string[];
}

export function AssumptionsSummary({ assumptions }: AssumptionsSummaryProps) {
  if (assumptions.length === 0) return null;

  return (
    <Collapsible className="pp-glass rounded-[var(--pp-radius)] px-4 py-3">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left">
        <span className="pp-label">why this was recommended</span>
        <ChevronDown className="pp-text-muted size-4 transition-transform group-data-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="pp-text-secondary mt-3 flex flex-col gap-1.5 text-sm">
          {assumptions.map((assumption) => (
            <li key={assumption} className="flex gap-2">
              <span aria-hidden className="pp-text-muted">
                –
              </span>
              <span>{assumption}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
