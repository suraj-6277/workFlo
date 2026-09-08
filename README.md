# Workflo 🚀

A production-grade, TypeScript + Express + MongoDB team and task management backend featuring background automation (BullMQ + Redis).

## Tech Stack
- **Runtime:** Node.js + Express
- **Language:** TypeScript (Strict Mode)
- **Database:** MongoDB via Mongoose
- **Cache & Queues:** Redis via ioredis & BullMQ
- **Authentication:** Passport.js (Local + Google OAuth) with Redis-backed Sessions
- **Validation:** Zod
- **Logging:** Pino (Structured JSON logs)

## Project Structure
```
workflo/
├── ARCHITECTURE.md          # Locked architectural specifications
├── src/
│   ├── config/              # Validated environment configuration & DB setup
│   ├── controllers/         # HTTP request/response handlers
│   ├── services/            # Business logic & domain operations
│   ├── models/              # Mongoose schemas & data models
│   ├── routes/              # Express route declarations
│   ├── middlewares/         # Auth, permission guards, validation, errors
│   ├── jobs/                # BullMQ queues, workers, and schedulers
│   ├── types/               # TypeScript interfaces & declarations
│   ├── utils/               # Structured logger & shared helpers
│   ├── server.ts            # Express HTTP server entrypoint
│   └── worker.ts            # Decoupled BullMQ background worker entrypoint
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # ESLint v9 Flat Config
├── .prettierrc              # Code formatting rules
└── package.json
```

## Quickstart

### Prerequisites
- Node.js 20+
- MongoDB instance (local or remote)
- Redis instance (local or remote)

### Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Run API in development:
   ```bash
   npm run dev:api
   ```
4. Run background worker in development:
   ```bash
   npm run dev:worker
   ```
5. Build and lint:
   ```bash
   npm run lint
   npm run build
   ```
