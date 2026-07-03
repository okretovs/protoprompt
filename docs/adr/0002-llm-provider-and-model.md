# ADR 0002: LLM provider and model

## Status

Accepted

## Context

Every stage runs multiple council calls (candidates, reviews, chairman synthesis) plus a final prompt generation. We need predictable behavior, low latency across parallel waves, and a streaming path for the final output. The MVP does not require multi-provider abstraction.

## Decision

Use **OpenAI as the sole LLM provider**, model **gpt-5 mini** (quickest available gpt-5 model), via the OpenAI API resource clients exposed as globals:

- Council pipeline (Waves 1–3) uses **buffered** `openai.text.generate`.
  - Candidates and reviews: persona `basePrompt` / `reviewPrompt` as system message.
  - Chairman: `CHAIRMAN_SYSTEM_PROMPT` as system message.
- Final prompt uses **streaming** `openai.text.generateStreamRaw` (returned directly, no await/reshape), with a strict markdown-only chairman system prompt. For Day 0, the output must be directly usable in a vibe-coding tool, not merely section-complete.
- Do not send `temperature` for `gpt-5-mini`; the model only supports the API default.
- Day 0 requires a user-provided OpenAI API key before idea submission, saved in browser `localStorage`, while still supporting the server-side `OPENAI_API_KEY`. This keeps the complete 7-stage flow demoable when server configuration is missing.

## Consequences

- One provider keeps orchestration and error handling simple; parallel waves stay fast on a small model.
- Streaming is intentionally limited to the final prompt; council waves are buffered so results can be parsed and cached deterministically.
- The final prompt quality bar is use-directly, so prompt assembly must include concrete build direction from selected options rather than generic filler under the fixed headings.
- User-provided OpenAI keys are frontend-saved run credentials, not account data. They must not be logged, committed, written to docs, or persisted on the backend.
- Switching or adding providers later would require a provider abstraction not present in MVP.
- Prompt-response parsing (`parseCouncilCandidateResponse`, `parseCouncilReviewResponse`, `parseStageResponse`, `parseGroupedStageResponse`) depends on the model returning valid JSON; failures are handled per ADR 0006.
