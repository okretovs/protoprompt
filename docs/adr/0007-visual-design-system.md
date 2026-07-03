# ADR 0007: Visual design system

## Status

Accepted

## Context

ProtoPrompt should feel like a premium engineering tool, not a generic AI SaaS wizard. The product is a command center for building software: signals come in, options are triaged, recommendations are surfaced, and the final prompt is assembled like an operational brief. The design must be reusable, themable, and isolated from any app-wide theme.

## Decision

Adopt a **dark-first "software-factory glass command center"** visual language, combining Factory-style industrial UI (near-black canvas, subtle dotted grid, warm off-white text, precise orange signal accents, monospaced technical labels, thin dividers, cinematic spacing) with Apple-style glass components (translucent floating panels, backdrop blur, hairline borders, layered depth, soft shadows).

Implementation rules:

- Design tokens live in `/frontend/components/protoprompt/protoprompt.css`, scoped under `.protoprompt-root`, defined for both light and dark modes. This is a component-scoped override; do not touch the app-wide theme. (PRO-10: implemented at `components/protoprompt/protoprompt.css` since the app lives at the repo root; the `/frontend` path is the original intent.)
- Semantic tokens are prefixed `--pp-*` (e.g. `--pp-canvas`, `--pp-glass`, `--pp-accent`, `--pp-text-primary`, `--pp-status-current`, `--pp-extended`, `--pp-shadow-glass`).
- Utility classes are prefixed `.pp-*` (`.pp-card`, `.pp-glass`, `.pp-prompt-surface`, `.pp-label`, `.pp-mono`, `.pp-section-kicker`, `.pp-badge*`, `.pp-step-dot`, `.pp-fade-in`, etc.).
- **Orange is a signal color**, not decoration: selected states, active steps, status dots, progress, connectors, thin outlines, subtle active glow. Never large filled orange backgrounds except tiny badges/compact controls.
- Typography: `var(--font-sans)` for editorial headings/body/buttons; `var(--font-mono)` for metadata, badges, prompt output, section kickers, counters, status text.
- **Cards over forms**: users select, not write. Options are never marked Required (a model-returned `required` is downgraded to `recommended`). Every recommendation has a one-sentence "Why it fits" HoverCard, and each stage has a collapsible "Why this was recommended" assumptions summary.
- Motion is quiet and functional (subtle fade, 1–2px glass lift, 200–280ms); no shimmer, sparkle, or "magical AI" effects.
- The final prompt renders as a smoked-glass, monospaced operating brief, not a plain textarea.

Explicitly avoid: generic SaaS gloss, blue/purple AI gradients, sparkles, cartoon illustrations, playful assistant UI, marketing-hype copy ("magical", "supercharged", "AI-powered").

## Consequences

- The scoped `.protoprompt-root` token layer keeps the theme self-contained and reusable across ProtoPrompt surfaces.
- shadcn/ui primitives (ADR 0001) must be re-skinned to these tokens rather than shipped with defaults.
- The `OptionCard` primitive carries the recommendation state, Extended Feature badge, tags, HoverCard rationale, selection control, and (mockup variant) ASCII wireframe.
- Loading and error states use console-style copy and orange signal dots to keep the pipeline visible and inspectable.
