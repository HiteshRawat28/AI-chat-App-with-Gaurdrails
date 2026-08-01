# Build Phases — AI Chat App with Guardrails

## Phase 1: Project Setup & Skeleton
**Goal:** Get a runnable, empty full-stack skeleton — no features yet, just the pipes connected.
**Done when:**
- [ ] Backend (Express) runs locally with a `/health` endpoint returning 200
- [ ] Frontend (Vite + React) runs locally and can hit `/health` and display the result
- [ ] PostgreSQL instance running locally (or via Docker), Prisma connected, `prisma migrate` works with an empty schema
- [ ] `.env` / `.env.example` set up for both frontend and backend, nothing secret committed

## Phase 2: Auth (Signup, Login, JWT)
**Goal:** Users can create an account and log in; protected routes work.
**Done when:**
- [ ] Prisma `User` model created (email, hashed password, timestamps)
- [ ] `/api/auth/register` and `/api/auth/login` implemented, passwords hashed with bcrypt
- [ ] JWT issued on login, `auth.middleware.js` verifies it and attaches `req.user`
- [ ] Frontend has a basic login/signup form and stores the JWT, attaching it to subsequent requests
- [ ] A protected test route confirms the full auth flow works end-to-end

## Phase 3: Core Chat Loop (No Guardrails Yet)
**Goal:** A logged-in user can send a message and get a real LLM response back — plumbing before policy.
**Done when:**
- [ ] Prisma `Conversation` and `Message` models created, linked to `User`
- [ ] `geminiClient.js` implemented, successfully calls Gemini 3.1 Pro (confirm both High/Low variants work) with a test prompt
- [ ] `/api/chat/message` route: saves user message, calls LLM, saves and returns assistant message
- [ ] Frontend chat UI (`ChatWindow`, `MessageBubble`, `MessageInput`) sends/receives messages and renders history
- [ ] A full conversation (multiple turns) works and persists across a page refresh

## Phase 4: Input Guardrails
**Goal:** Restricted-topic input is blocked before it reaches the LLM.
**Done when:**
- [ ] `inputGuardrail.js` implemented with the `checkInput(text) -> {allowed, reason}` interface
- [ ] `restrictedTopics.js` rule file defines an initial keyword/regex rule set (documented with rationale per rule)
- [ ] Middleware wired in so blocked input never reaches `geminiClient.js`
- [ ] Blocked requests return a structured, non-error response the frontend can render as a friendly notice
- [ ] Unit tests cover at least: a clean input (passes), an obviously restricted input (blocked), and an edge case (e.g. restricted word inside an unrelated word)

## Phase 5: Output Guardrails
**Goal:** LLM responses are validated before being shown to the user.
**Done when:**
- [ ] `outputGuardrail.js` implemented with the `checkOutput(text) -> {allowed, sanitized?, reason}` interface
- [ ] `outputFormatRules.js` defines format/content checks (e.g. length bounds, no leaked system prompt text, no restricted-topic content that slipped through)
- [ ] Flagged outputs are either sanitized, replaced with a fallback message, or blocked — behavior is explicit per rule type
- [ ] Unit tests cover: a clean response (passes), a deliberately malformed/flagged test response (caught)

## Phase 6: Rate Limiting
**Goal:** Per-user request throttling prevents API abuse.
**Done when:**
- [ ] Rate-limit strategy chosen and implemented (DB-backed counter via Prisma, or Redis if added) — per-user, not just per-IP
- [ ] Exceeding the limit returns HTTP 429 with a `retryAfter` value
- [ ] Frontend shows a clear "you're sending messages too fast" notice with countdown/disabled input, not a raw error
- [ ] Rate-limit thresholds are configurable (env var or config file), not hardcoded magic numbers

## Phase 7: Guardrail Event Logging & Observability
**Goal:** Every guardrail trigger is captured for review — the Responsible AI evidence trail.
**Done when:**
- [ ] Prisma `GuardrailEvent` model created (user, type [input/output/rate-limit], rule triggered, timestamp, snippet of triggering content)
- [ ] Every block/flag event (input, output, rate-limit) writes a log entry
- [ ] A simple way to query these exists (even just a documented SQL query or a `/api/admin/guardrail-events` route gated to a test admin user) — full dashboard is future scope
- [ ] Logging failures never block the actual user-facing response (fail open on logging, fail closed on the guardrail itself)

## Phase 8: Polish, Error Handling & Local Deployment Readiness
**Goal:** The app feels complete and demoable end-to-end.
**Done when:**
- [ ] Global error handler catches unhandled errors and returns clean JSON, never stack traces, to the client
- [ ] LLM provider failures (timeout, 5xx) show a friendly retry message in the UI
- [ ] Loading states, empty states, and error states all have real UI (not blank screens)
- [ ] README documents setup: env vars, migrations, seed data (if any), how to run both frontend and backend locally
- [ ] A full manual test pass: signup → login → chat → trigger input guardrail → trigger output guardrail (if simulatable) → hit rate limit → confirm all are logged
