import type { CouncilDossier, PageGroup, ProjectState, StageId, StageOptionsResult } from "@/lib/protoprompt/types";

export const TESTING_PROJECT_NAME = "LaunchPad CRM";
export const TESTING_IDEA = "A lightweight CRM for founders to track investor conversations, follow-ups, and fundraising progress.";
export const TESTING_OPENAI_KEY = "testing-mode";

export const TESTING_DOSSIER: CouncilDossier = {
  themes: ["investor pipeline", "follow-up discipline", "fundraising readiness"],
  assumptions: ["Users manage investor outreach manually today", "The MVP is single-user and client-side"],
};

export function mockStageResult(stage: StageId): StageOptionsResult {
  const result = MOCK_STAGE_RESULTS[stage];
  if (!result) throw new Error(`No testing result for stage ${stage}`);
  return result;
}

export function mockPageGroups(stage: "components" | "mockup_style", pages: string[]): PageGroup[] {
  return pages.map((pageTitle) => ({
    pageTitle,
    assumptions: [`${pageTitle} should stay focused on fast founder workflows.`],
    options: stage === "components" ? mockComponents(pageTitle) : mockMockups(pageTitle),
  }));
}

export function mockFinalPrompt(project: ProjectState): string {
  return `## App Name
${project.projectName}

## Product Objective
Build a focused fundraising CRM that helps founders capture investors, track conversations, and keep follow-ups from slipping.

## Target Users
Seed-stage founders and operators managing investor outreach without a dedicated CRM.

## MVP Scope
Single-user client-side app with investor pipeline tracking, follow-up reminders, and lightweight meeting notes.

## Build Direction
- Create a guided investor pipeline with statuses from prospect to committed.
- Prioritize speed of capture over heavy CRM customization.
- Treat any extended features as optional follow-up work.

## Data Sources
Manual entry is the primary source. CSV import can be stubbed as a future integration.

## Pages & Navigation
- Dashboard: pipeline overview and urgent follow-ups.
- Investors: searchable investor list with status filters.
- Investor Detail: conversation history, next step, notes.

## Features by Page
- Dashboard: stage counts, overdue follow-ups, recently updated investors.
- Investors: add investor, filter by stage, sort by next follow-up date.
- Investor Detail: edit status, add note, set next action.

## Components by Page
- Dashboard: PipelineSummary, FollowUpQueue, RecentActivity.
- Investors: InvestorTable, StageFilterBar, AddInvestorButton.
- Investor Detail: InvestorHeader, ConversationTimeline, NextStepPanel.

## Mockup Direction by Page
Use dense operating-console layouts with clear status chips, compact cards, and a left-to-right pipeline feel.

## Data Model
Investor(id, name, firm, stage, lastContactedAt, nextFollowUpAt, notes[]). Note(id, investorId, body, createdAt).

## Workflows
Founder adds investor, updates stage after a meeting, records notes, and sets a next follow-up date.

## User Roles & Permissions
MVP has one local user with full access.

## Integrations
None required for MVP. Calendar and email integrations are future work.

## UI & Design Direction
Dark-first command-center UI with glass cards, orange signal accents, and monospaced metadata.

## Design Principles
Optimize for fast capture, clear next action, and low cognitive load.

## Validation Rules
Investor name and stage are required. Follow-up dates must be valid future or present dates.

## Empty States
Show a starter investor card example and a clear Add Investor CTA when no investors exist.

## Error States
Use amber glass error cards for failed saves or invalid data, with direct retry or correction copy.

## Acceptance Criteria
- A user can add and edit investors.
- A user can see overdue follow-ups on the Dashboard.
- A user can navigate from list to detail and back without losing local state.

## Implementation Notes
Keep the MVP stateless in browser state. Use mock data seed fixtures for local testing.`;
}

const MOCK_STAGE_RESULTS: Partial<Record<StageId, StageOptionsResult>> = {
  build_direction: {
    stage: "build_direction",
    assumptions: ["Founders need fast capture more than enterprise CRM depth."],
    options: [
      option("pipeline", "Investor pipeline", "Track investors through prospect, intro, meeting, diligence, committed, and passed stages.", ["pipeline"], true),
      option("followups", "Follow-up queue", "Surface overdue and upcoming investor follow-ups so founders keep momentum.", ["reminders"], true),
      option("deck-room", "Investor data room", "Collect pitch deck, metrics, and diligence links in one place.", ["extended"], false, true),
    ],
  },
  data_sources: {
    stage: "data_sources",
    assumptions: ["Manual input is enough for a Day 0 MVP."],
    options: [
      option("manual", "Manual investor entry", "Users add investors, firms, stages, and notes directly.", ["manual"], true),
      option("csv", "CSV import", "Allow founders to paste or upload existing investor lists.", ["import"], false),
      option("calendar", "Calendar event enrichment", "Pull meeting dates from a calendar integration.", ["extended"], false, true),
    ],
  },
  app_pages: {
    stage: "app_pages",
    assumptions: ["Three pages are enough to cover the core workflow."],
    options: [
      option("dashboard", "Dashboard", "Overview of pipeline health and urgent follow-ups.", ["overview"], true),
      option("investors", "Investors", "Searchable investor list with stage filters and add actions.", ["list"], true),
      option("detail", "Investor Detail", "Conversation timeline, notes, stage, and next action.", ["detail"], true),
    ],
  },
};

function mockComponents(pageTitle: string) {
  return [
    option(`${pageTitle}-primary`, `${pageTitle} primary panel`, `The main working surface for ${pageTitle}.`, ["core"], true),
    option(`${pageTitle}-metadata`, `${pageTitle} metadata rail`, `Compact status metadata and next-action context for ${pageTitle}.`, ["metadata"], true),
  ];
}

function mockMockups(pageTitle: string) {
  return [
    {
      ...option(`${pageTitle}-console`, "Console layout", `A dense command-center layout for ${pageTitle}.`, ["dense", "glass"], true),
      wireframe: ["+------------------------------+", "| Header   Status    Action    |", "| Main panel        Side rail  |", "| Timeline / table             |", "+------------------------------+"],
    },
    {
      ...option(`${pageTitle}-cards`, "Card stack layout", `A softer card-first layout for ${pageTitle}.`, ["cards", "focused"], false),
      wireframe: ["+------------------------------+", "| Header                       |", "| [Card] [Card]                |", "| [Wide detail card]           |", "+------------------------------+"],
    },
  ];
}

function option(
  id: string,
  title: string,
  description: string,
  tags: string[],
  selected: boolean,
  extendedFeature = false
) {
  return {
    id,
    title,
    description,
    tags,
    recommendationState: selected ? "recommended" as const : "optional" as const,
    whyItFits: `${title} supports the Day 0 test flow.`,
    extendedFeature,
    selectionState: selected ? "selected" as const : "unselected" as const,
  };
}
