# Workflo — Architecture & Specification Document

> **Status:** Locked (Phase 1 Complete)  
> **Source of Truth:** Replaces and fixes architectural flaws from the prototype ("Zentra").

---

## 1. System Overview & Core Decisions

| Domain | Decision | Rationale |
| :--- | :--- | :--- |
| **Repository Structure** | Dedicated Backend Repository (Polyrepo) | Focused purely on backend systems, Docker orchestration, and Redis background queues without frontend tooling noise. |
| **API Architecture** | Strict REST with Unified Response Envelope | Predictable `{ success, message, data, errors }` format across all endpoints for robust client consumption and consistent error handling. |
| **Authentication** | Server-Side Cookie Sessions via Redis & Passport | Fixes Zentra's session leak bug. Only `user._id` is stored in the session store. Instant server-side revocation and immune to client-side XSS token theft. |
| **Authorization** | Declarative Single-Source-of-Truth Matrix | Static, compile-time checked enums (`Role`, `Permission`) with a central `ROLE_PERMISSIONS` map. `Workspace.owner` strictly references `User._id`. |
| **Background Jobs** | BullMQ + Redis (Decoupled Worker Process) | Background jobs (recurring task cloning, due-date reminder emails) execute in an isolated worker process (`src/worker.ts`), preventing API event loop starvation. |
| **Infrastructure** | Multi-Container Docker Setup (`docker-compose`) | Fully reproducible local and production environment orchestrating the API, Worker, MongoDB, and Redis. |

---

## 2. API Response Contract

All HTTP responses will conform to this standard structure:

### Success Response (`2xx`)
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... }
}
```

### Error Response (`4xx`, `5xx`)
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 3. Security & Domain Invariants

1. **Workspace Ownership:** `Workspace.owner` must point to `User._id` (Type: `ObjectId`), never to a `Role` or `Member` identifier.
2. **Session Hygiene:** `passport.serializeUser` serializes *only* `user._id`. No password hashes, salt, or user metadata may ever be saved into session records or returned in JSON responses.
3. **Permission Checks:** Authorization middleware must test against the exact required `Permission` enum value, checking membership via the central matrix.
4. **Job Idempotency:** Background workers must track execution uniqueness to prevent duplicate tasks or multiple reminder emails on retry.

---

## 4. Process Architecture

```
[ HTTP Clients ] ───> [ src/server.ts (Express API) ] ───> [ MongoDB ]
                                │                               ▲
                                ▼                               │
                         [ Redis Queue ]                        │
                                │                               │
                                ▼                               │
                      [ src/worker.ts (BullMQ) ] ────────────────
```

