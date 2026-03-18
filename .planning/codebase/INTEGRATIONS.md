# External Integrations

**Analysis Date:** 2026-03-18

## APIs & External Services

**MediaPipe Pose Detection:**
- `@mediapipe/tasks-vision` 0.10.32 - Real-time pose landmark detection for automatic push-up counting
  - Runs in browser (WebGL-accelerated via browser APIs)
  - No external API calls; entirely client-side processing
  - Provides 33 pose landmarks used by `components/CameraWorkout.tsx`

## Data Storage

**Databases:**
- **Production:** Yandex Cloud Managed PostgreSQL
  - Host: `rc1a-7633vqts157enmle.mdb.yandexcloud.net:6432`
  - User: `selectywellness_app`
  - Connection: Requires SSL with `sslmode=no-verify` (self-signed CA)
  - Pooler: Built-in Odyssey connection pooler
  - Client: Prisma 7 via `@prisma/adapter-pg` + `pg` pool wrapper

- **Testing:** Supabase PostgreSQL (`eu-west-1`)
  - Session pooler (port 5432) for migrations
  - Transaction pooler (port 6543) not used with Prisma
  - Connection method: `.env.test` symlinked to worktree `.env`

**File Storage:**
- Local filesystem only - No external file storage service configured

**Caching:**
- None configured - In-memory Prisma query cache only

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (email + password)
  - Project URL: `https://kteiwuaweembjpygnwtm.supabase.co`
  - Anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, for client SDK)
  - Implementation: `lib/supabase-client.ts` (browser), `lib/supabase-server.ts` (server)
  - SDK: `@supabase/supabase-js` 2.99.1 (client), `@supabase/ssr` 0.9.0 (server)
  - Session storage: Supabase Auth cookies (managed by middleware)
  - **Important:** Auth data stored on Supabase, NOT in Yandex Cloud database

**User Profile Data:**
- Table: `Profile` (Supabase user ID + email + name)
- Location: Yandex Cloud PostgreSQL (via Prisma ORM)
- Linking: `Participant.userId` references Supabase UUID after auth claim

**Session Management:**
- Middleware: `middleware.ts` validates session via `supabase.auth.getUser()`
- Protects routes: `/room/*`, `/profile`
- Auth pages: `/login`, `/register`, `/auth/confirm`, `/verify-email`

## Monitoring & Observability

**Error Tracking:**
- None configured - Errors logged to stdout/stderr only

**Logs:**
- `console.error()` for health check failures (`app/api/health/route.ts`)
- Standard output to Docker logs (Render captures via container logs)

**Health Checks:**
- Endpoint: `GET /api/health`
- Implementation: `app/api/health/route.ts` - Executes `SELECT 1` query to verify database connectivity
- Consumer: Render platform + UptimeRobot (5-minute interval)

## CI/CD & Deployment

**Hosting:**
- Render (Frankfurt region, free tier)
- URL: https://pushuptracker-oq2o.onrender.com
- Auto-deploy: Disabled (`autoDeployTrigger: off` in `render.yaml`)

**CI Pipeline:**
- None configured - Manual deployment via Render dashboard or git push (if enabled)

**Build Process:**
- Docker image: `node:20-slim` + OpenSSL library
- Build steps:
  1. `npm ci` - Install dependencies
  2. `DATABASE_URL="postgresql://dummy@localhost/dummy" npm run build` - Next.js build with Prisma client generation
  3. Startup: `npx prisma migrate deploy && node_modules/.bin/next start`
- Config file: `render.yaml` (web service blueprint)
- Dockerfile: `Dockerfile` in project root

**Deployment Configuration:**
- Service name: `pushup-tracker`
- Plan: Free tier
- Region: Frankfurt (eu-west-1)
- Branch: `main`
- Docker path: `./Dockerfile`

## Environment Configuration

**Required Environment Variables (Render Dashboard):**
- `DATABASE_URL` - PostgreSQL connection string (Yandex Cloud)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase auth key
- `ADMIN_API_KEY` - Admin operations secret (e.g., delete rooms)
- `NODE_ENV=production` - Production environment flag

**Build Arguments (Docker):**
- `NEXT_PUBLIC_SUPABASE_URL` - Passed during docker build for client-side usage
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Passed during docker build

**Secrets Location:**
- Render environment variables (dashboard managed, not in `.env` file)
- Development: `.env` file (Git-ignored)
- Testing: `.env.test` file (Git-ignored, symlinked to worktrees)

## Webhooks & Callbacks

**Incoming:**
- `POST /api/rooms/[code]/join` - Participant joins room (from frontend form submission)
- `POST /api/sessions` - Log workout session (from `components/CameraWorkout.tsx`)
- `POST /api/auth/claim` - Claim existing participants after Supabase Auth login
- `POST /api/auth/resend` - Resend verification email (rate-limited: 3 per 15 minutes)
- `GET /api/health` - Health check (triggered by Render + UptimeRobot)

**Outgoing:**
- Supabase Auth email delivery - Sends confirmation/verification emails via Supabase service

**Admin Endpoints:**
- `DELETE /api/admin/rooms/[code]` - Delete room (requires `x-admin-key` header)

## External CDNs & Resources

**Font Delivery:**
- Google Fonts - Geist Mono font family (via `geist` npm package)
- Google Fonts CDN - Material Symbols Outlined icons
  - URL: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined...`
  - Parameters: opsz=20, wght=400, FILL=1, GRAD=-25

**PWA Assets:**
- Icons hosted locally: `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png`
- Manifest: `/manifest.json` (W3C PWA standard)

---

*Integration audit: 2026-03-18*
