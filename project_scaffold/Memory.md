# Memory Log — AI Chat App with Guardrails

> **Instructions for the AI coding assistant working on this project:**
>
> This file is your persistent memory across chat sessions. The codebase and other planning docs (PRD, Architecture, Rules, Phases, Design) don't change often, but you need a fast way to know *where things stand* without re-reading the whole project every time.
>
> **Update this file whenever you:**
> - Complete a phase or a meaningful chunk of work
> - Make a decision that deviates from the original docs (and why)
> - Hit a blocker or leave something half-finished
> - Learn something about the codebase that isn't obvious from the code itself
>
> **Format for each entry:** append, don't rewrite history. Use:
> ```
> ## {Date or Session Label}
> - Status: {what's done}
> - Next: {what to do next}
> - Notes: {gotchas, decisions, deviations from the plan}
> ```
>
> At the start of a new chat session, read this file first (before re-reading the whole codebase) to get oriented. Only dig into the actual code when this file doesn't answer your question.

---

<!-- New entries go below this line -->

## 2026-08-01 Session Start
- Status: Read project scaffold documentation (PRD, Architecture, Rules, Phases, Design).
- Next: Awaiting user confirmation to begin Phase 1 (Project Setup & Skeleton).
- Notes: No code written yet. Project scope and guardrails constraints understood.

## 2026-08-01 Phase 1 Complete
- Status: Initialized Vite frontend and Express backend. Prisma configured for Postgres. Added /health endpoint and tested connection.
- Next: Awaiting user database configuration and approval to start Phase 2 (Auth).
- Notes: Both frontend and backend dev servers are currently running in background. User needs to set DATABASE_URL in backend/.env before running migrations.
