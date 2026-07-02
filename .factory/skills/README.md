# Engineering Skills

Reusable engineering skills for a Factory-powered local project using Linear for issues, GitHub for source control, and Vercel for deployment.

Factory skills are directories containing a `SKILL.md` file plus optional supporting files. User-invoked skills can be run directly with their slash command, while model-invoked skills can be loaded automatically when relevant.

## User-invoked

Reachable only when you type them (`disable-model-invocation: true`).

- **[choose-engineering-flow](./choose-engineering-flow/SKILL.md)** — Choose the right engineering skill or workflow for the current situation.
- **[grill-with-docs](./grill-with-docs/SKILL.md)** — Run a focused questioning session while updating the project domain model and ADRs.
- **[triage](./triage/SKILL.md)** — Move Linear issues through the project triage state machine.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then interview through whichever one is selected.
- **[setup-project-skills](./setup-project-skills/SKILL.md)** — Configure this repo for Linear MCP, GitHub PRs, Vercel deployment, triage roles, and domain docs. Run once per repo.
- **[to-issues](./to-issues/SKILL.md)** — Break any plan, spec, or PRD into independently-grabbable Linear issues using vertical slices.
- **[to-prd](./to-prd/SKILL.md)** — Turn the current conversation into a PRD and publish it to Linear.
- **[implement](./implement/SKILL.md)** — Implement work from a PRD or Linear issue, then prepare it for review.

## Model-invoked

Model- or user-reachable. These include trigger phrasing so Factory Droid can use them when relevant.

- **[prototype](./prototype/SKILL.md)** — Build a throwaway prototype to answer a design question: a runnable terminal app for state/logic, or several toggleable UI variations.
- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[tdd](./tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./domain-modeling/SKILL.md)** — Build and sharpen a project's domain model, then update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: small interfaces, clean seams, testable through the interface.
- **[grilling](./grilling/SKILL.md)** — Interview the user one question at a time to stress-test a plan or design.
- **[review](./review/SKILL.md)** — Review a branch, PR, or work-in-progress diff against repo standards and the originating Linear issue or PRD.
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)** — Resolve an in-progress merge or rebase conflict by tracing the intent behind each side.
