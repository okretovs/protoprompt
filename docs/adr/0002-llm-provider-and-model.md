# ADR 0002: LLM provider and model

## Status

Accepted

## Context

Every stage runs multiple council calls (candidates, reviews, chairman synthesis) plus a final prompt generation. We need predictable behavior, low latency across parallel waves, and a streaming path for the final output. The MVP does not require multi-provider abstraction.

## Decision

Use **OpenAI as the sole LLM provider**, model **gpt-5 mini** (quickest available gpt-5 model), via the OpenAI API resource clients exposed as globals:

- Council pipeline (Waves 1–3) uses **buffered** `openai.text.generate`.
  - Candidates and reviews: temperature `0.4`, persona `basePrompt` / `reviewPrompt` as system message.
  - Chairman: temperature `0.4`, `CHAIRMAN_SYSTEM_PROMPT` as system message.
- Final prompt uses **streaming** `openai.text.generateStreamRaw` (returned directly, no await/reshape), temperature `0.3`, with a strict markdown-only chairman system prompt.

## Consequences

- One provider keeps orchestration and error handling simple; parallel waves stay fast on a small model.
- Streaming is intentionally limited to the final prompt; council waves are buffered so results can be parsed and cached deterministically.
- Switching or adding providers later would require a provider abstraction not present in MVP.
- Prompt-response parsing (`parseCouncilCandidateResponse`, `parseCouncilReviewResponse`, `parseStageResponse`, `parseGroupedStageResponse`) depends on the model returning valid JSON; failures are handled per ADR 0006.
