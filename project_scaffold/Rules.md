# Rules — AI Chat App with Guardrails

## Libraries & Tools
**Use:**
- `express` for the backend server and routing
- `prisma` + `@prisma/client` for DB access and migrations (PostgreSQL)
- `jsonwebtoken` + `bcrypt` for auth
- `zod` for request/response schema validation (used by both API validation and the output guardrail's format checks)
- `express-rate-limit` (or a custom Prisma/Redis-backed limiter if per-user granularity needs exceed the package's defaults)
- `dotenv` for environment/config management
- React (via Vite), plain `fetch` for API calls — no heavy state library needed at this scale (Context + hooks is enough)

**Avoid:**
- No ORMs other than Prisma (avoid mixing raw SQL and an ORM — pick one path for schema management)
- No client-side-only guardrail enforcement — every filter/validation must be re-checked server-side regardless of what the frontend does
- No hardcoded API keys or secrets in source — everything through `.env`, never committed
- No global in-memory rate-limit state if the app is ever expected to run multi-instance (flag this explicitly if it comes up)
- Avoid pulling in a full moderation API or ML classifier dependency in v1 — the interface should support it later, but v1 implementation stays keyword/regex per the PRD

## Error Handling
- All Express routes wrapped in try/catch or use an async-handler wrapper; errors funnel to a single `errorHandler.middleware.js`.
- Guardrail blocks are **not** treated as server errors — they return a normal 200/4xx-style structured response like `{ blocked: true, reason: "restricted_topic" }`, not a thrown exception, so the frontend can render a clean inline notice.
- LLM API failures (timeout, provider error) are caught and surfaced to the user as a friendly "couldn't get a response, try again" message — never a raw stack trace or provider error string.
- Rate-limit rejections return HTTP 429 with a `retryAfter` hint the frontend can use to show a countdown or disabled input.
- Every guardrail trigger (input block, output flag) is logged via `guardrailLog.service.js` before the response is sent — logging failures should never block the user-facing response, but should be logged to console/error tracking at minimum.

## Coding Standards
- File naming: `camelCase.js` for logic modules, `PascalCase.jsx` for React components.
- One responsibility per file: guardrail rule files only define rules, `inputGuardrail.js`/`outputGuardrail.js` only orchestrate them — don't mix rule definitions with orchestration logic.
- All guardrail rule functions are pure functions: `(input) => result`, no side effects, easy to unit test in isolation.
- Comment *why*, not *what*, especially in guardrail rule files — e.g. why a topic is restricted or why a format check exists, since this is the part future readers (and interviewers) will scrutinize most.
- Keep the Gemini client (`geminiClient.js`) provider-specific config (model name, High/Low variant selection) isolated from business logic — switching models should be a one-file change.

## AI Assistant Boundaries
- Should always:
  - Ask before adding a new dependency, especially anything touching auth, security, or the guardrail layer.
  - Write or update a basic test when adding a new guardrail rule (input or output).
  - Flag any change that would make guardrail enforcement client-side-only or optional.
  - Keep `checkInput`/`checkOutput` function signatures stable so swapping rule implementations later doesn't ripple into routes.
- Should never:
  - Remove or weaken an existing guardrail rule without explicit confirmation from the user.
  - Log raw user message content in a way that's inconsistent with how conversation history is already stored (don't create a second, less-protected copy of sensitive data).
  - Modify the Prisma schema without flagging the migration to the user first.
  - Silently swap the LLM provider or model variant — this is a visible, intentional choice (Gemini 3.1 Pro High vs Low) and should stay explicit.
