# Codebase Structure

**Analysis Date:** 2026-03-18

## Directory Layout

```
pushuptracker/
├── app/                          # Next.js App Router pages & API
│   ├── api/                      # Backend API routes
│   │   ├── admin/                # Admin-only operations
│   │   ├── auth/                 # Auth endpoints (claim, resend)
│   │   ├── profile/              # User profile endpoints
│   │   ├── rooms/                # Room CRUD & management
│   │   │   ├── [code]/           # Room-specific endpoints
│   │   │   │   ├── join/         # Join room endpoint
│   │   │   │   ├── membership/   # Leave room endpoint
│   │   │   │   └── route.ts      # Room GET/DELETE
│   │   │   └── route.ts          # Create room, list user's rooms
│   │   ├── health/               # Health check (Render keep-alive)
│   │   └── sessions/             # Workout session creation
│   ├── auth/                     # Auth pages
│   │   └── confirm/              # Email verification callback
│   ├── room/                     # Room page
│   │   └── [code]/               # Dynamic room page
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── verify-email/             # Email verification status page
│   ├── layout.tsx                # Root layout (fonts, theme)
│   ├── page.tsx                  # Home page (create/join forms)
│   └── globals.css               # Global styles + CSS variables
│
├── components/                   # React components
│   ├── CameraWorkout.tsx         # MediaPipe Pose integration, rep counting
│   ├── Icon.tsx                  # Material Symbols Outlined wrapper
│   └── ThemeToggle.tsx           # Dark/light mode toggle
│
├── hooks/                        # Custom React hooks
│   └── useRooms.ts               # Multi-room localStorage state
│
├── lib/                          # Shared utilities & services
│   ├── prisma.ts                 # Prisma client singleton (pg.Pool)
│   ├── profile.ts                # Profile creation & lookup
│   ├── supabase-client.ts        # Supabase Auth (browser)
│   ├── supabase-server.ts        # Supabase Auth (server)
│   ├── verify-password.ts        # Password verification via Supabase
│   └── emailRateLimit.ts         # Rate limiting for email resend
│
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Data models (Room, Participant, Session, Profile)
│   └── migrations/               # Auto-generated migration files
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── theme-init.js             # FOUC prevention script
│   ├── icon.svg                  # Logo SVG
│   ├── icon-192.png              # PWA icon 192x192
│   ├── icon-512.png              # PWA icon 512x512
│   ├── apple-touch-icon.png      # iOS home screen icon
│   └── mediapipe/                # MediaPipe model & WASM files
│       └── models/
│           └── pose_landmarker_full.task
│
├── .planning/                    # GSD planning docs
│   └── codebase/                 # This directory
│
├── .worktrees/                   # Git worktrees for feature branches
│
├── middleware.ts                 # Auth middleware (route protection)
├── tsconfig.json                 # TypeScript config
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── package.json                  # Dependencies & scripts
├── prisma.config.ts              # DATABASE_URL for Prisma CLI
├── Dockerfile                    # Production build image
├── render.yaml                   # Render deployment config
├── README.md                     # Project documentation
├── AGENTS.md                     # Agent instructions
└── CLAUDE.md                     # Claude Code setup
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router structure (pages, layouts, routes)
- Contains: `.tsx` pages, API route handlers, global styles
- Key files: `page.tsx` (home), `layout.tsx` (root), `room/[code]/page.tsx` (main app)

**app/api/:**
- Purpose: Backend API endpoints (REST routes)
- Contains: 10 route handlers (POST/GET/DELETE)
- Key files: `rooms/route.ts` (CRUD), `sessions/route.ts` (workout data)

**components/:**
- Purpose: Reusable React UI components
- Contains: `.tsx` files (no subdirectories)
- Key files: `CameraWorkout.tsx` (MediaPipe integration), `Icon.tsx` (icon wrapper)

**hooks/:**
- Purpose: Custom React hooks for state management
- Contains: Single hook file `useRooms.ts` (multi-room localStorage)
- Key files: `useRooms.ts` (room list state, persistence)

**lib/:**
- Purpose: Shared utilities, clients, services
- Contains: Prisma client, Supabase clients, helper functions
- Key files: `prisma.ts` (ORM), `supabase-client.ts` (auth), `supabase-server.ts` (auth)

**prisma/:**
- Purpose: Database schema and migrations
- Contains: `schema.prisma` (models), auto-generated migration SQL files
- Key files: `schema.prisma` (Room, Participant, Session, Profile)

**public/:**
- Purpose: Static files served by Next.js
- Contains: PWA manifest, icons, theme script, MediaPipe assets
- Key files: `manifest.json` (PWA), `theme-init.js` (FOUC prevention)

## Key File Locations

**Entry Points:**

- `app/layout.tsx`: Root HTML structure, font loading, theme FOUC prevention
- `app/page.tsx`: Home page with create/join room forms (client-side router)
- `app/room/[code]/page.tsx`: Main app page with leaderboard/workout/profile tabs
- `middleware.ts`: Auth middleware protecting routes

**Configuration:**

- `package.json`: npm scripts (`npm run dev`, `npm run build`, `npm run lint`)
- `tsconfig.json`: TypeScript compiler options (baseUrl, paths)
- `tailwind.config.ts`: Tailwind CSS utilities
- `next.config.mjs`: Next.js config (minimal setup)
- `prisma.config.ts`: DATABASE_URL for Prisma CLI migrations

**Core Logic:**

- `components/CameraWorkout.tsx`: MediaPipe Pose detection, rep counting algorithm
- `hooks/useRooms.ts`: Multi-room state (localStorage + server sync)
- `lib/prisma.ts`: Prisma client with pg.Pool for connection management
- `app/api/rooms/[code]/route.ts`: Room data (GET) and deletion (DELETE)
- `app/api/sessions/route.ts`: Workout session creation (POST)

**Testing:**

- No test files in repo (not implemented)

**Utilities:**

- `lib/supabase-client.ts`: Browser-side Supabase Auth
- `lib/supabase-server.ts`: Server-side Supabase Auth
- `lib/verify-password.ts`: Password verification via Supabase admin
- `lib/profile.ts`: User profile creation/lookup
- `lib/emailRateLimit.ts`: Rate limiting for email resend endpoint
- `components/Icon.tsx`: Material Symbols Outlined icon wrapper
- `components/ThemeToggle.tsx`: Dark/light mode switcher

## Naming Conventions

**Files:**

- Pages: `page.tsx` (Next.js convention, located in route directories)
- Components: PascalCase + `.tsx` (e.g., `CameraWorkout.tsx`, `ThemeToggle.tsx`)
- Hooks: camelCase + `use` prefix + `.ts` (e.g., `useRooms.ts`)
- API routes: `route.ts` (Next.js convention, in directory matching the path)
- Utils/Services: camelCase + `.ts` (e.g., `verify-password.ts`, `emailRateLimit.ts`)

**Directories:**

- Feature routes: kebab-case inside `app/` (e.g., `app/room`, `app/login`)
- Dynamic routes: `[param]` syntax (e.g., `app/room/[code]`)
- API grouping: logical grouping by feature (e.g., `app/api/rooms/[code]/join`)

**Variables & Functions:**

- Constants: SCREAMING_SNAKE_CASE (e.g., `KEY`, `mediapipeModelPath`)
- Functions: camelCase (e.g., `generateCode()`, `handleCreate()`)
- React components: PascalCase (e.g., `CameraWorkout`, `RoomPage`)
- Interfaces: PascalCase (e.g., `Participant`, `RoomData`)

**CSS & Theme:**

- CSS variables: kebab-case with `--` prefix (e.g., `--bg`, `--text`, `--accent-default`)
- Tailwind classes: Following Tailwind convention (e.g., `flex flex-col px-4`)
- Theme colors: `#ff6b35` (accent), `#ef4444` (danger), `#22c55e` (success)

**Database:**

- Models: PascalCase (e.g., `Room`, `Participant`, `Session`)
- Table names: Lowercase plural (auto-generated from models)
- Fields: camelCase (e.g., `participantId`, `roomCode`, `createdAt`)

## Where to Add New Code

**New Feature (e.g., notifications):**
- Primary code: `app/api/notifications/route.ts` (API) + `components/NotificationBell.tsx` (UI)
- Tests: Not established (no test framework configured)
- State: If persistent: add to `hooks/useNotifications.ts`; if session-only: use `useState` in component

**New Component/Module:**
- Implementation: `components/[ComponentName].tsx`
- Import pattern: Use barrel import from same directory if multiple related components; otherwise direct import

**Utilities:**
- Shared helpers: `lib/[featureName].ts`
- Import pattern: `import { functionName } from '@/lib/featureName'`

**New API Endpoint:**
- Location: `app/api/[feature]/[operation]/route.ts`
- Pattern: Copy structure from existing endpoint (request validation, auth check, try-catch)
- Auth check: Include `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()`

**New Page:**
- Location: `app/[path]/page.tsx` (Next.js convention)
- Auth protection: Middleware already handles protected routes; see `middleware.ts` for matcher pattern
- Dynamic routes: Use `[param]` syntax; access via `useParams()` hook

**Database Changes:**
- Schema edits: `prisma/schema.prisma`
- Migration: Run `npm run dev` (auto-runs `prisma migrate deploy`)
- If migration fails (non-interactive shell): Create SQL manually + `prisma migrate deploy`

## Special Directories

**public/:**
- Purpose: Static files served by Next.js
- Generated: `icon-192.png`, `icon-512.png` (generated via `sharp` from `icon.svg`, not committed)
- Committed: `manifest.json`, `theme-init.js`, `icon.svg`, `apple-touch-icon.png`, `mediapipe/*` (CDN locally)

**.worktrees/:**
- Purpose: Git worktrees for feature branches (parallel feature development)
- Generated: Created by `git worktree add` commands
- Committed: No (git-internal directory)

**prisma/migrations/:**
- Purpose: Auto-generated SQL migration files
- Generated: Created by `prisma migrate create` or `prisma migrate dev`
- Committed: Yes (version-controlled for team consistency)

**.planning/:**
- Purpose: GSD planning documents for code generation
- Generated: Created manually or via `/gsd` commands
- Committed: Not in .gitignore (committed as documentation)

---

*Structure analysis: 2026-03-18*
