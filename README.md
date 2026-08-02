# AI Chat App with Guardrails

A full-stack AI chat application built with React, Node.js, Express, and Prisma, featuring robust safety guardrails, custom rate limiting, and an admin observability dashboard.

## Features

- **Secure Authentication**: JWT-based login and registration.
- **AI Chat Interface**: Real-time chat loop integrated with Google's Gemini API.
- **Multi-Layered Guardrails**:
  - *Input Guardrails*: Prevents restricted topics (e.g., financial advice, medical advice) from reaching the LLM.
  - *Output Guardrails*: Sanitizes or blocks unsafe responses from the AI.
- **Custom Rate Limiting**: Prisma-backed leaky bucket rate limiting to prevent API abuse.
- **Observability Dashboard**: An admin panel to monitor triggered guardrails and blocked messages.
- **Graceful Error Handling**: Robust fallbacks for API quota exhaustion and backend exceptions.

## Tech Stack

- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (via Prisma ORM)
- **AI Provider**: Google GenAI (Gemini)

## Setup Instructions

### 1. Clone & Install Dependencies
First, install the dependencies for both the frontend and backend.
```bash
# In the backend directory
cd backend
npm install

# In the frontend directory
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_123"
GEMINI_API_KEY="your_google_gemini_api_key"
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MS=60000
```

### 3. Database Migration
Run Prisma to set up the SQLite database schema:
```bash
cd backend
npx prisma migrate dev
```

### 4. Start the Application
Start both the backend and frontend development servers.
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

## Architecture & Data Flow

1. **User Request**: The user submits a message via the React frontend.
2. **Auth & Rate Limiting**: The Express backend verifies the JWT and checks the rate limit bucket in SQLite.
3. **Input Guardrail**: The message is checked against restricted topics. If blocked, an event is logged and the request is rejected.
4. **LLM Generation**: The prompt is sent to the Gemini API.
5. **Output Guardrail**: The AI's response is sanitized before being returned to the user.
6. **Logging**: Any guardrail violations are asynchronously logged to the `GuardrailEvent` table, which can be viewed at `/admin` by the `admin@example.com` user.

## Admin Dashboard

To view the observability logs:
1. Register and log in with the email: `admin@example.com`
2. Click the "Admin Logs" button in the header, or navigate to `/admin`.
