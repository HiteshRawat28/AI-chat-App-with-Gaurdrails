# Project Requirements Document — AI Chat App with Guardrails

## Overview
A full-stack AI chat application (React frontend, Node.js/Express backend) that lets users converse with an LLM (Gemini, via Antigravity-assisted development) while demonstrating production-grade Responsible AI practices: input filtering, output validation, and rate limiting. The project exists as a portfolio-quality demonstration of end-to-end ownership across frontend, backend, and AI safety layers.

## Target Users
- **Primary:** The developer (you) — as a showcase project demonstrating full-stack + Responsible AI engineering skills for a portfolio, interview, or resume artifact.
- **Secondary:** Anyone evaluating the project (recruiters, engineers) who wants to try the chat app and see the guardrails in action (e.g. triggering a blocked topic and seeing it handled gracefully).

## Core Features (v1 / MVP)
- **Chat UI**: React-based chat interface with message history, streaming or standard responses, loading/error states.
- **Auth**: Email/password signup & login (JWT-based), scoping conversations and rate limits per user.
- **LLM integration**: Backend proxies chat requests to Gemini (3.1 Pro, High/Low variants selectable), never exposing API keys to the client.
- **Input guardrails**: Pluggable filtering layer that checks user input against restricted-topic keyword/regex rules before it reaches the LLM; blocked requests return a clear, non-punitive message.
- **Output guardrails**: Pluggable validation layer that checks LLM responses against expected format/content standards before returning them to the user (e.g. re-flagging outputs that slipped through, format sanity checks).
- **Rate limiting**: Per-user request throttling to prevent API abuse, with clear feedback when a user hits the limit.
- **Conversation persistence**: Chat history stored per user, retrievable across sessions.
- **Guardrail event logging**: Every block/flag event (input or output) is logged with timestamp, user, rule triggered — this is the evidence trail for the "Responsible AI in production" story.

## Future Scope (not in v1)
- Swapping keyword/regex guardrails for an ML-based classifier or third-party moderation API (Perspective API, OpenAI moderation, etc.) — the interface is designed for this now, the implementation comes later.
- OAuth login (Google/GitHub).
- Admin dashboard for reviewing flagged events and tuning rules without redeploying.
- Multi-model routing (letting the user pick between providers, not just Gemini variants).
- Streaming token-by-token responses (v1 can be request/response; streaming is a nice-to-have).
- Team/shared conversations, message editing, conversation branching.

## Success Criteria
- A user can sign up, log in, and hold a multi-turn conversation with the LLM through the UI.
- Sending a message matching a restricted-topic rule is blocked before hitting the LLM, and the user sees a clear, friendly explanation.
- LLM outputs are checked against format/content rules before being shown; a deliberately malformed/flagged test response is caught and handled.
- Exceeding the rate limit returns a clear 429-style message in the UI, not a silent failure or crash.
- All guardrail trigger events (input blocks, output flags, rate-limit hits) are logged and queryable (even just via DB query for v1 — no dashboard required).
- The full stack runs locally end-to-end via a documented setup process (env vars, migrations, seed data if any).

## Out of Scope
- Production deployment/hosting setup (v1 targets local dev; deployment notes can come later).
- Horizontal scaling, load balancing, or multi-instance rate-limit coordination (single-instance in-memory or DB-backed limiting is sufficient for v1).
- Fine-tuning or training any model.
- Mobile app / React Native.
- Payment/billing integration.
