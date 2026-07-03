# ADR 0001: Frontend stack

## Status

Accepted

## Context

ProtoPrompt is a card-driven planning UI with a strong, specific visual language (dark "software-factory glass command center"). It needs accessible interactive primitives by name: HoverCard ("Why it fits"), RadioGroup (single-select mockup style), Badge, Card, Collapsible ("Why this was recommended"), and Button. The design system is expressed as CSS custom properties (`--pp-*` tokens) and `.pp-*` utility classes scoped under `.protoprompt-root`, and must not touch any app-wide theme.

## Decision

Build the app with **Next.js (App Router) + Tailwind CSS + shadcn/ui**, layered over a component-scoped token system:

- Tailwind for utility-first styling that pairs naturally with CSS variables.
- shadcn/ui for copy-in, fully re-skinnable accessible primitives, restyled entirely with `--pp-*` tokens and the glass treatment.
- A scoped token layer in `/frontend/components/protoprompt/protoprompt.css` under `.protoprompt-root`, defined for both light and dark modes.

> Implementation note (PRO-10): the Next.js app was scaffolded at the repository root rather than a `/frontend` subdirectory, so the token layer lives at `components/protoprompt/protoprompt.css`. The `/frontend/...` path in this ADR is retained as the original intent.

## Consequences

- Accessible behavior (hovercard, radio, collapsible, focus management) comes for free instead of being hand-rolled.
- shadcn components must be deliberately re-skinned so they do not read as "generic shadcn"; default styling is treated as a starting point only.
- The `.protoprompt-root` scope keeps ProtoPrompt's palette isolated from the surrounding app theme.
- Alternative considered: Tailwind-only custom components. Rejected for MVP because it forces rebuilding accessible primitives with no offsetting benefit.
