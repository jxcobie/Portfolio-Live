# CMS WORKPLAN — Portfolio‑CMS Modernization

This document defines the end‑to‑end migration plan to evolve the existing Node/Express + static admin UI into a modern, secure, maintainable full‑stack platform. It enumerates phases, concrete tasks, acceptance criteria, risks, and rollback. It also shows how to leverage available MCP tooling (Playwright MCP; Context7 for docs) during execution.

---

## 1) Goals, Non‑Goals, Success Criteria

- Goals
  - Preserve all current functionality and data while modernizing implementation.
  - Introduce a TypeScript API with Prisma ORM and versioned endpoints.
  - Add a new Vite + React admin SPA with shadcn‑inspired primitives and feature‑flag fallback.
  - Strengthen security (headers, auth, CSP, rate limiting, safer uploads, secrets hygiene).
  - Establish automated testing (unit, integration, E2E) and CI/CD with containerization.
- Non‑Goals
  - No large UX redesign beyond component system and navigational clarity during the first cut.
  - No immediate multi‑tenant features or third‑party auth federation in the initial milestone.
- Success Criteria
  - Green CI (lint, typecheck, tests, build) and reproducible Docker deploy.
  - Legacy `/admin` available behind feature flag until SPA is ready; no downtime on cutover.
  - API v2 provides audited parity routes; v1 remains backward‑compatible via adapter layer.

---

## 2) Current Snapshot (As‑Is)

- Runtime: Node, legacy `server.js` with Express 4
- DB: SQLite file `cms_database.db` (tables: users, projects, project_images, technologies, project_technologies [no unique id], messages, analytics)
- Admin UI: static `/admin` HTML
- Security: API key and session mechanics implemented in `server.js`; file uploads via Multer; emails via Nodemailer
- Environment: `.env` contains CMS settings; modern workspaces created alongside legacy (apps/api, apps/admin-ui, packages/*)

---

## 3) Target Architecture (To‑Be)

- Backend
  - Node 18+ with TypeScript and Express 4 (kept; can upgrade to Fastify later if needed)
  - Prisma ORM: introspect SQLite now; provide a path to Postgres later
  - Versioned routes: `/api/v1` (legacy adapter), `/api/v2` (new services)
  - Zod validation for DTOs; Pino logging; Helmet/CORS/rate limits; structured error handling
- Frontend (Admin)
  - Vite + React (TypeScript), shadcn‑style components
  - React Router + React Query; code‑splitting & skeleton states
  - Feature flag `VITE_ENABLE_NEW_ADMIN` → if false, UI presents a redirect to legacy `/admin`
- Tooling
  - npm workspaces; ESLint/Prettier; TS configs shared
  - Playwright MCP for E2E checks; Context7 MCP for docs lookup when needed
- Deploy
  - Dockerized API and SPA, compose for local dev, CI/CD pipeline with build → test → push → deploy

---

## 4) Phases, Tasks, Acceptance Criteria

### Phase A — Baseline & Safeguards
- Tasks
  - Snapshot `cms_database.db` backup; verify `.gitignore` excludes generated and secrets.
  - Add baseline E2E smoke with Playwright MCP: legacy `/admin` loads, `/api/portfolio/public` works (if present).
- Acceptance
  - Backup artifact created; smoke E2E passes on current system.

### Phase B — Repo & Tooling Hardening
- Tasks
  - Ensure root lint/typecheck/build scripts succeed for all workspaces.
  - Standardize commit hooks (optional) and PR health checks.
- Acceptance
  - `npm run lint` / `typecheck` green in CI; reproducible local dev startup.

### Phase C — Database Models & Migrations (SQLite → Prisma; Postgres path ready)
- Tasks
  - Confirm Prisma introspection reflects tables: analytics, messages, projects, project_images, technologies, users.
  - Design `bookings` model based on legacy logic in `server.js` and add it to Prisma schema (if absent in DB). Fields (example): `id`, `name`, `email`, `phone`, `date`, `time`, `duration`, `meeting_type`, `notes`, `status`, `meeting_link`, `created_at`, `updated_at`.
  - Add migrations to create missing tables/indexes (SQLite first). If moving to Postgres later: write x‑database safe schema.
  - Seed script for minimal dev data.
- Acceptance
  - `prisma db pull` and `prisma generate` run cleanly; `projects/messages` counts match legacy routes; bookings table created and visible via Prisma API.

### Phase D — Backend Services (v2)
- Tasks
  - Create service layer: `services/{projects,messages,bookings}.ts` with Prisma calls.
  - Add `routes/v2/{projects,messages,bookings}.ts` with Zod validators and pagination.
  - Uniform error mapping and 4xx/5xx responses.
- Acceptance
  - Unit tests for services and route validators; `supertest` integration for v2 endpoints; health and stats route verified.

### Phase E — Legacy Adapter (v1)
- Tasks
  - Add a v1 → v2 adapter mapping old endpoints to new service functions (parameter translation, response shaping).
  - Send `Deprecation` header and `Sunset` timeline on v1 responses.
- Acceptance
  - Existing consumers continue to function; Playwright MCP verifies typical legacy flows.

### Phase F — Admin UI Implementation
- Tasks
  - Implement pages: Login, Dashboard (stats), Projects (list/detail/edit), Messages (list/detail), Bookings (calendar/list).
  - API hooks with React Query; optimistic updates where safe; toasts/skeleton states; form validation with Zod.
  - Toggle feature flag default to off until parity; enable per‑view as ready.
- Acceptance
  - UI routes render, core actions succeed against v2 API; accessibility and keyboard nav pass basic checks.

### Phase G — Security & Compliance
- Tasks
  - Enforce Helmet headers, CSP (nonce or hash for inline blocks), secure cookies (HttpOnly, SameSite), request size limits.
  - Password hashing with bcrypt; rotate session secret; review upload validation and virus scanning (if needed).
  - `npm audit` baseline and dependency upgrades.
- Acceptance
  - Security headers present; basic SSRF/XSS/CSRF mitigations documented; audit clean or risk accepted.

### Phase H — Testing Strategy
- Tasks
  - Unit: services/utilities using Vitest/Jest.
  - Integration: `supertest` for API endpoints (fixtures + seed).
  - E2E: Playwright MCP scripts for admin login, dashboard stats, project edit; CI friendly.
- Acceptance
  - Coverage thresholds agreed (e.g., 70%+), CI shows green on PRs.

### Phase I — Containerization & Deployment
- Tasks
  - Dockerfiles: API (node:18-alpine multi‑stage), SPA (vite build then static server).
  - Compose: api + spa + volume for sqlite (or mount Postgres later); healthchecks.
  - CI pipelines: build, test, artifact, push images, deploy to staging.
- Acceptance
  - `docker compose up` works locally; staging deploy with smoke tests and rollback ready.

### Phase J — Observability & Ops
- Tasks
  - Structured logs (request IDs); optional Sentry; basic metrics counters.
  - Runtime health endpoints and readiness probes.
- Acceptance
  - Logs contain correlation identifiers; health endpoints wired into container probes.

### Phase K — Rollout & Feature Flags
- Tasks
  - Toggle admin UI per environment; staged rollout with runtime switch.
  - Document rollback: re‑disable SPA, continue v1 adapter; DB migrations are backward compatible.
- Acceptance
  - Rollout plan trialed in staging; rollback rehearsed.

### Phase L — Documentation & Handoff
- Tasks
  - Expand README with runbooks, environment variables, endpoint docs, and admin usage.
  - Migration notes (SQLite → Postgres), troubleshooting, and FAQ.
- Acceptance
  - Docs pass peer review; onboarding new dev < 1 hour.

---

## 5) MCP Tooling Usage

- Playwright MCP
  - Validate legacy admin loads and basic flows work during every phase.
  - Automate: navigate to `/admin`, check login, visit dashboard, verify stats, run CRUD flow in projects.
  - Example (CLI pattern):
    - `mcp-inspector-cli --method tools/call -- /path/to/mcp-server-playwright --browser=chromium --headless -- tool-name browser_navigate --tool-arg url=https://localhost:5173`
- Context7 MCP
  - Pull reference docs snippets for Prisma schema examples, Express security patterns, React Query usage, etc.

> Note: Postgres MCP can be introduced when we switch to Postgres. For now, Prisma handles SQLite.

---

## 6) Detailed Task Breakdown (Checklists)

- Database
  - [ ] Design `bookings` Prisma model from legacy behavior
  - [ ] Create migration(s): `prisma migrate dev` for SQLite
  - [ ] Seed dev data; fixture factories for tests
- Backend
  - [ ] Implement Zod DTOs and request validators
  - [ ] Services for projects/messages/bookings
  - [ ] v2 routes with pagination/sorting; v1 adapter mapping
  - [ ] Error middleware and 404 handling parity
- Admin UI
  - [ ] Login form + auth hook
  - [ ] Dashboard Cards wired to `/api/v2/stats`
  - [ ] Projects list/search/detail; edit modal with optimistic update
  - [ ] Messages list/detail; mark as read
  - [ ] Bookings calendar/list, approve/deny
  - [ ] Feature‑flag ramp up per route
- Security
  - [ ] CSP definition; cookie policy, session storage
  - [ ] Audit & dependency updates
  - [ ] Upload validation and limits
- Testing
  - [ ] Unit suite for services and utils
  - [ ] Integration tests for routes
  - [ ] Playwright MCP E2E flows in CI
- DevEx/CI/CD
  - [ ] Dockerfiles (API, SPA); Compose
  - [ ] CI workflows: lint → typecheck → test → build → push → deploy
  - [ ] Smoke tests on staging; rollback job
- Docs
  - [ ] Environment variable matrix and examples
  - [ ] Endpoint docs for v2; mapping from v1
  - [ ] Runbooks and support SOPs

---

## 7) Risk & Mitigation

- Schema divergence between legacy SQL and Prisma
  - Mitigation: iterate with `db pull` in small steps, add `@@map`/`@map` to preserve column names
- Booking model uncertainties
  - Mitigation: codify minimal viable fields from `server.js` now; fill advanced fields as UI integrates
- Cutover incidents
  - Mitigation: feature‑flag new UI; v1 adapter remains default until parity; reversible DB migrations where possible
- CI flakiness (headless browsers)
  - Mitigation: run Playwright MCP headless with clear timeouts and retries; capture traces on failure

---

## 8) Timeline & Milestones (Indicative)

- Week 1: DB & backend services (projects/messages), v2 endpoints, baseline E2E
- Week 2: Admin UI dashboard + projects; v1 adapter mapping; security headers, CSP
- Week 3: Messages + bookings UI; Prisma booking migrations
- Week 4: CI/CD, Docker, staging deploy, docs; cutover rehearsal & rollback

---

## 9) Rollback Plan

1. Keep v1 endpoints intact behind adapter during all phases.
2. Disable SPA feature flag to return users to legacy `/admin` instantly.
3. For DB: maintain backward‑compatible migrations; keep dumps pre‑migration; revert image deploy if needed.

---

## 10) Appendix

- Environment Variables (examples)
  - API: `PORT`, `SESSION_SECRET`, `DATABASE_URL`, `LEGACY_ADMIN_URL`
  - Admin UI: `VITE_ENABLE_NEW_ADMIN`
- Endpoint Versioning
  - v1: legacy signatures via adapter
  - v2: typed DTOs + consistent pagination and error payloads
- Data Model Mapping
  - Map legacy table/column names to Prisma models with `@@map`/`@map` where necessary

---

Prepared for ongoing execution; this plan is living and should be updated as decisions are made (e.g., Postgres switchover timeline, auth scheme finalization).

