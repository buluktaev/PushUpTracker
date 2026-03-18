# Technology Stack

**Analysis Date:** 2026-03-18

## Languages

**Primary:**
- TypeScript 5 - All application code and configuration
- JavaScript - Build scripts, configuration files

**CSS:**
- Tailwind CSS 3.4.1 - Utility-first styling with dark mode support

## Runtime

**Environment:**
- Node.js 20 (slim Docker image)
- Next.js 14.2.35 (App Router, React Server Components)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.35 - Full-stack React framework with App Router
- React 18 - UI library with hooks and server components

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- Next.js built-in (`next build`, `next dev`, `next lint`)
- PostCSS 8 - CSS processing pipeline (Tailwind integration)
- Autoprefixer 10 - Vendor prefix handling

## Key Dependencies

**Critical:**
- `@prisma/client` 7.4.2 - PostgreSQL ORM (production queries, migrations)
- `@prisma/adapter-pg` 7.4.2 - Native PostgreSQL adapter for Prisma 7
- `pg` 8.20.0 - Native PostgreSQL client (pool management with SSL options)
- `@supabase/supabase-js` 2.99.1 - Authentication SDK (email/password auth)
- `@supabase/ssr` 0.9.0 - Server-side auth helpers for Next.js middleware

**Vision/ML:**
- `@mediapipe/tasks-vision` 0.10.32 - Pose detection for automatic push-up counting

**UI/UX:**
- `geist` 1.7.0 - Monospace font (GeistMono) for UI
- `@number-flow/react` 0.6.0 - Animated countdown counter
- Material Symbols Outlined (Google Fonts CDN) - Icon library

**Utilities:**
- `dotenv` 17.3.1 - Environment variable management
- `@types/*` packages - TypeScript type definitions

## Configuration

**Environment:**
- `.env` file (required at runtime) - Contains `DATABASE_URL`, Supabase credentials, admin key
- `.env.production.example`, `.env.staging.example` - Reference templates
- `.env.test` - Testing database credentials (symlinked in worktrees)
- `prisma.config.ts` - Prisma CLI configuration (reads `DATABASE_URL` from `process.env`)
- Variables loaded via `dotenv` package during `prisma.config.ts` initialization

**Key Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (Yandex Cloud in production, Supabase in test)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, in browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, for auth)
- `ADMIN_API_KEY` - Admin operations (e.g., delete rooms endpoint)
- `NODE_ENV` - Set to `production` on Render

**Build:**
- `next.config.mjs` - Minimal Next.js configuration (empty defaults)
- `tsconfig.json` - TypeScript compiler options with path alias `@/*` → root
- `tailwind.config.ts` - Dark mode via `class`, content scanning for CSS purging
- `postcss.config.mjs` - Minimal PostCSS config (Next.js handles Tailwind integration)
- `.eslintrc.json` - Extends `next/core-web-vitals`

## Platform Requirements

**Development:**
- Node.js 20+
- npm 9+
- PostgreSQL database (Supabase or Yandex Cloud)
- `.env` file with database connection
- `prisma migrate deploy` runs automatically on `npm run dev`

**Production:**
- Deployment target: Render (Frankfurt region, free tier)
- Docker build: Node.js 20-slim with OpenSSL library
- Health check: `/api/health` endpoint (Render monitors this)
- Keep-alive: UptimeRobot pings every 5 minutes (prevents free tier sleep)
- Database: Yandex Cloud Managed PostgreSQL with SSL (custom CA, `rejectUnauthorized: false`)

## SSL/TLS Configuration

**Yandex Cloud (Production):**
- Manual `pg.Pool` creation in `lib/prisma.ts` with `ssl: { rejectUnauthorized: false }`
- Required: `@prisma/adapter-pg` must wrap the pool for Prisma to use custom SSL options
- Note: `sslmode=require` in connection string ≠ SSL verification; node-postgres overrides `ssl` option without the pool wrapper

**Docker Build:**
- Dummy DATABASE_URL during build: `postgresql://dummy@localhost/dummy`
- Allows Prisma client generation without real database access

## Database Migrations

**Development Workflow:**
- `npm run dev` runs `prisma migrate deploy` automatically
- Interactive: `prisma migrate dev` is used for schema changes
- Non-interactive environments: Create SQL migrations manually + `prisma migrate deploy`

**CLI Configuration:**
- `prisma.config.ts` reads `DATABASE_URL` from environment
- `prisma/schema.prisma` defines schema, `prisma/migrations/` stores migrations
- Prisma 7: No `url` in `datasource db` block (uses `prisma.config.ts` instead)

**Production Migration:**
- Dockerfile runs `npx prisma migrate deploy` at startup (after `npm ci`, before server start)

---

*Stack analysis: 2026-03-18*
