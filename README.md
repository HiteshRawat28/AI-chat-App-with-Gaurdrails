# AI Chat App with Guardrails

A full-stack AI chat application (React frontend, Node.js/Express backend) that lets users converse with an LLM (Gemini) while demonstrating production-grade Responsible AI practices: input filtering, output validation, and rate limiting.

## Setup

### Backend
1. Navigate to the `backend` directory.
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your details (especially `DATABASE_URL`).
4. Run `npx prisma migrate dev` to create the schema.
5. Run `npm run dev` to start the server.

### Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install`
3. Copy `.env.example` to `.env`.
4. Run `npm run dev` to start the React application.
