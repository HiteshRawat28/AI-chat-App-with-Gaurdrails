# Architecture — AI Chat App with Guardrails

## App Flow
1. User signs up / logs in via React frontend → POST `/api/auth/register` or `/api/auth/login` → backend issues JWT.
2. Frontend stores JWT (memory or httpOnly cookie), attaches it to all subsequent requests.
3. User types a message in the chat UI → POST `/api/chat/message` (with JWT).
4. Backend middleware chain runs in order:
   a. **Auth middleware** — verifies JWT, attaches `req.user`.
   b. **Rate limiter middleware** — checks user's request count in the current window; rejects with 429 if exceeded.
   c. **Input guardrail layer** — runs `checkInput(text)` against keyword/regex rules; if blocked, short-circuits with a clear message and logs the event — LLM is never called.
5. If input passes, backend calls the Gemini API (3.1 Pro High or Low, selectable per request or per user setting) with the conversation context.
6. LLM response comes back → **Output guardrail layer** runs `checkOutput(response)` — validates format/content; if flagged, either sanitizes, replaces with a fallback message, or (for severe cases) blocks and logs.
7. Validated response is persisted to the conversation history (DB) and returned to the frontend.
8. Frontend renders the message; on any guardrail block/rate-limit hit, displays a clear inline notice instead of a raw error.

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Fast dev server, standard for SPA chat UIs, easy to add streaming later |
| Backend | Node.js + Express | Matches your stated preference; simple middleware model maps cleanly onto the guardrail-chain design |
| Database | PostgreSQL + Prisma ORM | Relational data (users → conversations → messages → guardrail_events) fits Postgres well; Prisma keeps schema/migrations clean in a Node stack; real concurrent-write support matters for rate-limit counters |
| LLM Provider | Google Gemini 3.1 Pro (High/Low) via Antigravity-assisted integration | Per your current dev setup; backend abstracts the provider call so switching later doesn't touch guardrail logic |
| Auth | JWT (email/password, bcrypt-hashed) | Lightweight, no third-party OAuth setup overhead, sufficient to scope rate limits and history per user |
| Hosting/Deploy | Local dev only for v1 (undecided — revisit before Phase 8) | Deployment explicitly out of scope for v1 per PRD |

## Folder Structure
```
ai-chat-guardrails/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   └── GuardrailNotice.jsx
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   ├── api/
│   │   │   └── client.js          # thin fetch wrapper, attaches JWT
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── chat.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── guardrails/
│   │   │   ├── inputGuardrail.js   # checkInput(text) -> {allowed, reason}
│   │   │   ├── outputGuardrail.js  # checkOutput(text) -> {allowed, sanitized, reason}
│   │   │   └── rules/
│   │   │       ├── restrictedTopics.js
│   │   │       └── outputFormatRules.js
│   │   ├── llm/
│   │   │   └── geminiClient.js     # provider-specific call, isolated from routes
│   │   ├── services/
│   │   │   ├── chat.service.js
│   │   │   └── guardrailLog.service.js
│   │   ├── db/
│   │   │   └── prisma.js
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── README.md
```

## Key Architectural Decisions
- **Guardrails as a pluggable interface, not inline logic**: `checkInput`/`checkOutput` return a standard shape (`{allowed, reason, sanitized?}`) so the keyword/regex implementation can be swapped for a moderation API or ML classifier later without touching routes or the LLM client.
- **Guardrail checks happen in middleware/service layer, never in the frontend**: client-side filtering is trivially bypassable; all enforcement is server-side. Frontend may optimistically warn, but never relies on it.
- **LLM provider call isolated in `llm/geminiClient.js`**: routes and services never call Gemini directly — this keeps the door open to swapping models/providers.
- **Rate limiting is per-user, DB or Redis-backed, not in-memory-only**: an in-memory counter resets on server restart and doesn't work across instances; even for v1 single-instance, a DB-backed or Redis counter is the honest choice for the "prevent API abuse" story.
- **All guardrail events are logged to a dedicated table**, not just console logs — this is the auditable evidence trail that makes the Responsible AI claim concrete and demoable.
