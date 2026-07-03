"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
          <h1 className="pp-text-primary text-4xl font-semibold tracking-tight">
            ProtoPrompt
          </h1>
          <p className="pp-text-secondary max-w-xl text-lg leading-relaxed">
            Council-guided planning for vibe-coding tools. We turn vibe coding
            into agentic engineering.
          </p>
          <p className="pp-label">design token foundation · pro-10</p>
        </header>

        <hr className="pp-divider" />

        <section className="pp-fade-in grid gap-5 sm:grid-cols-2">
          <article className="pp-card" data-selected="true">
            <div className="flex items-center justify-between gap-3">
              <span className="pp-section-kicker">recommended</span>
              <span className="pp-badge">
                <span className="pp-step-dot" data-status="current" />
                signal
              </span>
            </div>
            <h2 className="pp-text-primary mt-3 text-xl font-medium">
              Selected option card
            </h2>
            <p className="pp-text-secondary mt-2 text-sm leading-relaxed">
              Orange is a signal accent only: selected state, active step, and a
              subtle glow. Never a large filled background.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="pp" size="sm">
                Select
              </Button>
              <Button variant="ppGhost" size="sm">
                Why it fits
              </Button>
            </div>
          </article>

          <article className="pp-card">
            <div className="flex items-center justify-between gap-3">
              <span className="pp-section-kicker">optional</span>
              <span className="pp-badge pp-badge-extended">extended feature</span>
            </div>
            <h2 className="pp-text-primary mt-3 text-xl font-medium">
              Glass surface
            </h2>
            <p className="pp-text-secondary mt-2 text-sm leading-relaxed">
              Translucent floating panel with backdrop blur, hairline border, and
              layered depth over a near-black dotted canvas.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="pp-step-dot" data-status="done" />
              <span className="pp-step-dot" data-status="current" />
              <span className="pp-step-dot" />
              <span className="pp-label">wave 1 / 2 / 3</span>
            </div>
          </article>
        </section>

        <section className="pp-fade-in flex flex-col gap-3">
          <span className="pp-label">final prompt · preview</span>
          <pre className="pp-prompt-surface pp-mono overflow-x-auto whitespace-pre-wrap">
{`## App Name
ProtoPrompt

## Product Objective
Turn a one-line idea into a build-ready implementation prompt.

## MVP Scope
- Stateless single-session run
- Council of four peer personas`}
          </pre>
        </section>

        <section className="pp-fade-in flex flex-wrap items-center gap-3">
          <span className="pp-text-muted text-sm">Type scale:</span>
          <span className="pp-text-primary">primary</span>
          <span className="pp-text-secondary">secondary</span>
          <span className="pp-text-muted">muted</span>
          <span className="pp-mono pp-text-secondary text-sm">mono 0xF2EDE4</span>
        </section>
      </main>
    </div>
  );
}
