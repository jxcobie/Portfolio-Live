# Portfolio CMS (Content Management System)

A lightweight, custom-built CMS for managing portfolio content with SQLite database.

## Features

- 📝 **Portfolio Management**: Manage personal info, skills, projects, and testimonials
- 🖼️ **File Upload**: Image upload with validation and storage
- 🔒 **Authentication**: Basic API key authentication
- 📊 **Analytics**: Track page views and user interactions
- 💾 **SQLite Database**: Lightweight, file-based database
- 🚀 **RESTful API**: Clean API endpoints for all operations

## Architecture Overview

- **Workspaces**: `apps/api` (TypeScript Express API) and `apps/admin-ui` (Vite + React SPA), backed by
  shared packages in `packages/*`.
- **Feature flag**: Toggle `VITE_ENABLE_NEW_ADMIN` to roll out the SPA gradually. When disabled, the
  API returns `LEGACY_ADMIN_URL`, which you can point to a maintenance experience or alternate UI.
- **Environment management**: Strongly typed with Zod in `@portfolio-cms/config`.
- **Security**: Helmet-driven CSP, session cookies, rate limiting, and structured logging are baked
  into the API.
- **API surface**: `/api/v2/projects`, `/api/v2/messages`, `/api/v2/bookings`, and `/api/v2/stats`
  deliver Prisma-backed data. `/api/v1/*` proxies exist to keep legacy clients functioning until they
  migrate.

## Tech Stack

- **Runtime**: Node.js (legacy server on JavaScript, new services on Node 18+ with TypeScript)
- **Framework**: Express.js (legacy + modern API)
- **Database**: SQLite3 (Prisma integration planned)
- **File Upload**: Multer
- **CORS**: Enabled for frontend integration
- **Admin UI (new)**: Vite, React 19, TailwindCSS, shadcn-inspired primitives

## Directory Structure

```
Portfolio-CMS/
├── apps/
│   ├── api/                    # TypeScript API (Express + Prisma)
│   │   ├── prisma/             # Prisma schema, migrations, seed scripts
│   │   └── src/                # Routes (v1 adapters + v2), services, utils
│   └── admin-ui/               # Vite + React admin SPA
├── packages/
│   ├── config/                 # Environment loader + Zod schema
│   └── core/                   # Shared domain types
├── generated/prisma            # Prisma client output (gitignored)
├── Dockerfile.api / Dockerfile.admin
├── docker-compose.yml
├── tsconfig.base.json / eslint.config.mjs / .prettierrc.json
└── cms_database.db             # SQLite content store
```

All workflow commands now run through the workspaces (API + admin); the legacy Node server and static
admin UI have been fully retired.

## Installation

### 1. Install Dependencies

```bash
cd Portfolio-CMS
npm install
```

Use the workspace-aware scripts to work on the CMS:

```bash
# Run the API (tsx + TypeScript)
npm run dev:api

# Run the admin SPA (set VITE_ENABLE_NEW_ADMIN=true to render it)
npm run dev:admin

# Build both packages for CI
npm run build:api
npm run build:admin

# Database introspection / client generation (Prisma)
npm run prisma:pull   # Sync schema from cms_database.db
npm run prisma:generate
npm run prisma:seed --workspace @portfolio-cms/api
```

The Prisma client is generated to `generated/prisma` (ignored from source control) and consumed via
`getPrismaClient()` in the API. Booking and scheduling tables are now provisioned through Prisma
migrations, and the seed script populates default working hours. `/api/v2/stats` and the admin SPA
now pull live counts for projects, unread messages, and upcoming confirmed bookings.

### 3. Security Hardening

- Helmet ships with a CSP allowing only same-origin resources for scripts (with inline styles for
  Tailwind) and standard anti-MIME headers.
- Sessions use `express-session` (+ secure cookies in production). Ensure `SESSION_SECRET` is at
  least 32 characters and swap in a persistent session store (Redis, Postgres, etc.) before going to
  production.
- `express-rate-limit` protects the API (`500` requests / 15 minutes / IP). Tune via `.env` or
  override in `app.ts` if needed.
- CORS honours `ALLOWED_ORIGINS` (comma-separated) for the admin SPA and any other front-ends.

### 4. Testing Workflow

- `npm run test --workspace @portfolio-cms/api` → Vitest for service + route coverage.
- `npm run lint`, `npm run typecheck`, `npm run build:api`, `npm run build:admin` → CI friendly
  health checks.

### 5. Containerization

- `Dockerfile.api` builds the TypeScript API and prunes dev dependencies before runtime.
- `Dockerfile.admin` builds the SPA and serves it with Nginx.
- `docker-compose.yml` ties both together (API on `4000`, Admin on `4173`). Mount
  `cms_database.db` via a volume for persistence.

### 6. Deploying with Coolify (GUI v4+)

1. In Coolify, create a new **Docker Compose** application pointing to this repository/branch.
2. Paste the `docker-compose.yml` contents into the Coolify compose editor.
3. Define environment variables (or attach an `.env` file). Required: `SESSION_SECRET`, `PORT=4000`,
   SMTP credentials, `ALLOWED_ORIGINS`, `LEGACY_ADMIN_URL`. Add a persistent volume mapping to
   `/app/cms_database.db` for the API service.
4. Configure ports: publish API `4000`, Admin `4173` (Coolify default domain can map to 4173).
5. Deploy; Coolify will build both images. Run migrations by allowing the API container to start with
   the mounted database file.
6. Use Coolify's built-in HTTP tester to verify `/api/health` and `/api/v2/stats`. When comfortable,
   set `VITE_ENABLE_NEW_ADMIN=true` (either via env or redeploying the admin container) to enable the
   new SPA, otherwise the legacy admin stays as fallback.

### 2. Environment Setup

Copy `.env.example` (or start from `.env` below) and adjust the values for your environment. At a
minimum:

```env
NODE_ENV=development
PORT=4000
SESSION_SECRET=change-me-super-secret-key
DATABASE_URL="file:./cms_database.db"
LEGACY_ADMIN_URL=http://localhost:4173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

Set `SESSION_SECRET` to a long random string in production. If you prefer Postgres, update
`DATABASE_URL` accordingly (Prisma ships with migrations for SQLite and easily targets Postgres).

## API Quick Reference

| Endpoint                     | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `GET /api/v2/stats`          | Summary counts for projects, messages, bookings   |
| `GET /api/v2/projects`       | Paginated projects (`status`, `search`, `page`)   |
| `GET /api/v2/messages`       | Paginated inbox (`status=read|unread`)            |
| `GET /api/v2/bookings`       | Paginated bookings (`upcoming`, `status`, `date`) |
| `POST /api/v2/bookings`      | Create booking (awaits notification integrations) |
| `PATCH /api/v2/bookings/:id` | Update booking status                             |

> All endpoints return JSON; authenticated admin routes expect session cookies. When the SPA feature
> flag is disabled, clients can poll `/api/v1/legacy-admin` to learn where to redirect users.

## Useful Scripts

| Script                  | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Run the API in watch mode               |
| `npm run dev:admin`     | Run the admin SPA (Vite dev server)     |
| `npm run build:api`     | Compile the API TypeScript output       |
| `npm run build:admin`   | Create a production SPA bundle          |
| `npm run test`          | Run Vitest suites (API services/routes) |
| `npm run prisma:seed`   | Populate working hours & defaults       |

## Production Notes

- Use Docker images or the Docker Compose stack supplied in the repo (`docker-compose.yml`).
- Mount `cms_database.db` on durable storage or switch `DATABASE_URL` to a managed Postgres instance.
- Swap the in-memory session store for Redis/Postgres via `express-session` before high-traffic use.
- Configure HTTPS (Coolify can provision Let's Encrypt automatically; otherwise place Nginx in front).
## Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000 (API)
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Mac/Linux

# Kill process if safe
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### Database Locked

```bash
# Close all connections to database
rm cms_database.db-journal

# If it persists, restart the API container/process
```

### CORS Errors

1. Check `ALLOWED_ORIGINS` in `.env`
2. Ensure origins include protocol: `https://domain.com`
3. Restart server after changing `.env`

## Development Tips

- **Routes & Adapters**: Add new REST resources under `apps/api/src/routes/v2` (and proxy through
  `v1` if legacy clients still consume the older signature).
- **Services**: Keep Prisma logic inside `apps/api/src/services/*`, returning plain objects for easy
  testing.
- **Migrations**: Define changes in `apps/api/prisma/schema.prisma`, then run `npm run prisma:pull`
  (if introspecting), `prisma migrate dev`, and regenerate the client.
- **Testing**: Add Vitest specs under `apps/api/tests/` to cover new behaviour; `npm run test` ensures
  they run in CI.

## License

MIT

## Support

For issues and questions:

- Create an issue in the repository
- Email: hello@jxcobcreations.com

---

**Made with ❤️ by Jacob Jaballah**
