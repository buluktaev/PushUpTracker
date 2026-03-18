# Architecture

**Analysis Date:** 2026-03-18

## Pattern Overview

**Overall:** Next.js 14 App Router with multi-room collaborative fitness tracking

**Key Characteristics:**
- Stateless auth via Supabase Auth (email+password)
- Client-side room state management with localStorage (multi-room support)
- Real-time MediaPipe Pose detection for pushup counting
- PostgreSQL backend (Yandex Cloud managed) with Prisma 7 ORM
- Responsive dual-platform: desktop browser + PWA mobile

## Layers

**Presentation (Client):**
- Purpose: React components with form UI, camera overlay, leaderboards, user authentication
- Location: `app/`, `components/`, `hooks/`
- Contains: Page components (`.tsx`), reusable UI components, custom hooks
- Depends on: Next.js runtime, Supabase Auth client, localStorage APIs
- Used by: Browsers (desktop) and PWA (mobile)

**Business Logic (Client):**
- Purpose: Multi-room state management, MediaPipe Pose integration, session timing
- Location: `hooks/useRooms.ts`, `components/CameraWorkout.tsx`
- Contains: State hooks, MediaPipe lifecycle, rep counting algorithm
- Depends on: Browser APIs (localStorage, WebGL for canvas), MediaPipe Vision library
- Used by: Page components and auth flow

**API Gateway (Server):**
- Purpose: Route handling, request validation, authentication checks
- Location: `app/api/*/route.ts`
- Contains: Next.js API Route handlers (GET/POST/DELETE)
- Depends on: Supabase Auth (server-side), Prisma client
- Used by: Client-side fetch calls

**Data Access (Server):**
- Purpose: Prisma ORM operations, database queries
- Location: `lib/prisma.ts`, `prisma/schema.prisma`
- Contains: Prisma client singleton, schema definitions (Room, Participant, Session, Profile)
- Depends on: PostgreSQL via pg.Pool (Yandex Cloud)
- Used by: All API routes

**Authentication (Server + Client):**
- Purpose: User identity verification, session management
- Location: `lib/supabase-client.ts`, `lib/supabase-server.ts`, `middleware.ts`
- Contains: Supabase Auth clients (browser/server), route protection middleware
- Depends on: Supabase Auth service, cookies
- Used by: All protected routes and API endpoints

## Data Flow

**New User Registration:**

1. User visits `/register` → `app/register/page.tsx`
2. Form submission → `POST /api/auth` (Supabase `signUp()`)
3. Supabase sends verification email
4. User clicks link → `/auth/confirm?code=...` → verifies token
5. On first login, `Profile` record created via `ensureProfile()` in `lib/profile.ts`
6. Middleware redirects to `/` (home page)

**Create Room Flow:**

1. User on `/` → clicks `create_room()` button
2. Form submission → `POST /api/rooms` with room name
3. Server generates unique 6-char code (alphanumeric, no confusing chars)
4. Creates `Room` record with `ownerId = user.id`
5. Responds with code → client redirects to `/room/[CODE]?created=1`
6. Auto-joins room via `POST /api/rooms/[code]/join` (called on mount with `created=1`)
7. `Participant` record created, saved to `useRooms()` hook (localStorage)

**Join Room Flow:**

1. User enters room code → submits join form
2. `POST /api/rooms/[CODE]/join` → checks auth, finds room, creates participant
3. Server returns `participantId`, client calls `useRooms().addRoom()` to persist
4. Redirects to `/room/[CODE]`

**Workout Session Flow:**

1. User on `/room/[CODE]` → clicks "workout" tab
2. `CameraWorkout` component initializes MediaPipe (`loadMP()`)
3. User clicks start → 3-second countdown (NumberFlow animation)
4. Video stream processed in RAF loop: landmarks extracted → angles calculated
5. Rep detection: angle threshold crossing (100° ↔ 140°) with anti-cheat body check
6. Real-time counter updates, session timer running
7. User clicks stop → validates rep count > 0
8. `POST /api/sessions` sends `{ participantId, count, duration }`
9. Server creates `Session` record, leaderboard updates on page refresh

**Leaderboard Refresh:**

1. User clicks `refresh()` or navigates away/back
2. `GET /api/rooms/[CODE]` fetches room with all participants + sessions
3. Computed metrics: total reps, best session, active today (by date)
4. Leaderboard sorted by totalPushups descending

**Multi-Room Switching:**

1. User has multiple room entries in `useRooms()` hook
2. Clicks dropdown in header → switcher panel shows all rooms
3. Selects different room → `router.push(/room/[CODE])`
4. Page state reset (tab, loading), new room data fetched

**State Management:**

- **Client state**: React hooks in components (`useState`, `useCallback`, `useRef`)
- **Persistent state**: localStorage via `useRooms()` hook (array of SavedRoom objects)
- **Remote state**: PostgreSQL via Prisma queries (source of truth for leaderboards/sessions)
- **Hydration**: On home page load, `useRooms()` loads localStorage → fetches from `GET /api/rooms` to sync server state

## Key Abstractions

**Room (Entity):**
- Purpose: Container for collaborative workout group
- Examples: `prisma/schema.prisma` (model), `app/api/rooms/route.ts` (creation), `app/room/[code]/page.tsx` (display)
- Pattern: Owner-based access control; code-based join mechanism; cascade delete of participants/sessions

**Participant (Entity):**
- Purpose: User membership in a room with associated workout history
- Examples: `prisma/schema.prisma` (model), `app/api/rooms/[code]/join/route.ts` (join), `app/room/[code]/page.tsx` (leaderboard display)
- Pattern: Links `userId` (Supabase Auth) to room; nullable for legacy data; cascade delete of sessions

**Session (Entity):**
- Purpose: Single workout event with rep count and duration
- Examples: `app/api/sessions/route.ts` (creation), `components/CameraWorkout.tsx` (initiation)
- Pattern: Immutable once created; grouped by date for "active today" tracking

**SavedRoom (Client Cache):**
- Purpose: Local representation of room membership (avoids API call on every page load)
- Examples: `hooks/useRooms.ts` (type definition + management)
- Pattern: localStorage-backed; merged with server state on hydration; removed on leave/logout

**Profile (Entity):**
- Purpose: User identity separate from Supabase Auth session
- Examples: `prisma/schema.prisma` (model), `lib/profile.ts` (creation via `ensureProfile()`)
- Pattern: Created lazily on first API call; immutable name/email for audit trail

## Entry Points

**Web (Browser):**
- Location: `app/layout.tsx` (root layout with fonts + theme init)
- Triggers: User opens URL or navigates
- Responsibilities: Font loading (Geist Mono, Material Symbols), theme FOUC prevention, metadata

**API (Server):**
- Location: `app/api/*/route.ts` (10 endpoints total)
- Triggers: Client-side `fetch()` calls
- Responsibilities: Auth checks, database operations, response formatting

**Middleware:**
- Location: `middleware.ts`
- Triggers: Every request matching `[/, /room/*, /profile/*, /login, /register]`
- Responsibilities: Auth verification, redirect unauthenticated users to `/login`, prevent auth users from accessing login/register

**Worker (Background):**
- Location: MediaPipe (client-side, no server worker)
- Triggers: CameraWorkout component mounts
- Responsibilities: Load PoseLandmarker model, run inference on video frames

## Error Handling

**Strategy:** Try-catch at API boundaries, error messages propagated to client

**Patterns:**

- API routes catch exceptions → return `{ error: '...' }` with appropriate HTTP status
  - `401`: Unauthorized (missing user)
  - `403`: Forbidden (owner-only operations)
  - `404`: Room/participant not found
  - `400`: Invalid input
  - `500`: Server error (logged to console)

- Client components handle fetch errors with try-catch:
  - Set error state on `!res.ok`
  - Display human-readable error message to user
  - Log error to browser console

- MediaPipe errors:
  - Fallback to "err: local mediapipe failed" status message
  - Camera stays off if model load fails

## Cross-Cutting Concerns

**Logging:** Console-only (`console.error()` in API routes and client components)

**Validation:**
- Server-side: Input validation in API routes (e.g., room name length, password requirements)
- Client-side: Basic form validation (empty checks, code format)

**Authentication:**
- Supabase Auth for user identity (email+password, email verification)
- Middleware protects `/room/*`, `/profile` routes
- API routes check `supabase.auth.getUser()` before database operations
- No refresh token rotation; relies on Supabase session cookies

**Authorization:**
- Room owner check: `room.ownerId === user.id` for delete operations
- Participant check: User must be joined to access room data
- No role-based permissions beyond owner/member distinction

**Concurrency:**
- No mutex/lock on participant join (upsert pattern: findFirst → createIfNotExists)
- Session creation is non-atomic (fetch participant → create session); risk of orphaned sessions if participant deleted mid-flow

**Rate Limiting:**
- Email resend endpoint: 3 requests per 15 minutes (stored in `emailRateLimit.ts`)
- No rate limiting on workout session creation or room joins

---

*Architecture analysis: 2026-03-18*
