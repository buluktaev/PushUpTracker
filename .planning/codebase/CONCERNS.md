# Codebase Concerns

**Analysis Date:** 2026-03-18

## Tech Debt

**Type Safety with MediaPipe types:**
- Issue: CameraWorkout uses `type AnyObj = any` alias for MediaPipe types (PoseLandmarker, DrawingUtils) due to incomplete @mediapipe/tasks-vision type definitions
- Files: `components/CameraWorkout.tsx` (lines 13, 20-21)
- Impact: No type checking on landmark coordinates, angle calculations, or drawing operations. Runtime errors could occur if MediaPipe API changes or returns unexpected structures
- Fix approach: Create proper TypeScript interfaces for landmark objects, detection results, and world coordinates. Gradually replace `AnyObj` with specific types or migrate to typed MediaPipe wrapper library

**Bare catch() statements without error logging:**
- Issue: Multiple `catch() {}` blocks silently swallow errors without logging or handling
- Files: `components/CameraWorkout.tsx` (lines 143, 195), `hooks/useRooms.ts` (lines 32, 45, 109), `app/page.tsx` (lines 69)
- Impact: Debugging becomes difficult; network failures, parsing errors, and camera issues are invisible to developers. Users see no feedback when operations fail silently
- Fix approach: Replace all `catch() {}` with `catch(e) { console.error(...) }` or appropriate error state updates. Add user-facing error messages for critical operations

**Generic error responses in API routes:**
- Issue: All API error handlers return `{ error: 'Server error' }` with status 500, masking actual error causes (network, validation, permission, database)
- Files: All routes in `app/api/` (rooms, sessions, health, auth, admin)
- Impact: Clients cannot distinguish between different failure modes. Debugging production issues requires server logs. Impossible for frontend to implement proper error recovery
- Fix approach: Create typed error responses; return specific status codes (400 for validation, 401 for auth, 403 for permission, 500 for server errors) with meaningful error codes. Document error contract

**No input validation on participantId in session creation:**
- Issue: `/api/sessions` accepts `participantId` from JSON body without verifying it belongs to the current user
- Files: `app/api/sessions/route.ts` (lines 6-22)
- Impact: User A can create sessions for User B's participantIds if they know the IDs. While damage is limited (adds to leaderboard), it violates data ownership principle
- Fix approach: Add Supabase auth check; verify participantId belongs to room owned/joined by authenticated user. Query participant's room and check user's membership

**Admin DELETE endpoint hardcoded secret:**
- Issue: `/api/admin/rooms/[code]/route.ts` uses hardcoded hex string `SECRET = 'e88c8c1bacebc8934b689120243a18ed'` for authentication
- Files: `app/api/admin/rooms/[code]/route.ts` (line 4)
- Impact: Secret exposed in source code (git history, any clone). If leaked, attacker can delete any room. No audit trail of who deleted what
- Fix approach: Move to `process.env.ADMIN_API_KEY`, rotate in Render Dashboard. Add timestamped logging for delete operations. Consider OAuth/session-based admin auth instead

**Room code generation collision risk:**
- Issue: Loop in `/api/rooms` does only 10 attempts to generate unique code, then throws generic "Cannot generate unique code"
- Files: `app/api/rooms/route.ts` (lines 60-66)
- Impact: If database has accumulated many rooms (edge case), code generation could fail, and user gets opaque error. No metrics to detect this condition
- Fix approach: Increase attempts to 50-100, or switch to sequential code scheme (collision-free). Add counter to application metrics

## Known Bugs

**#49 Production data loss (2026-03-17):**
- Symptoms: Leaderboard is empty; all participant records from production are gone
- Files: Database (Yandex Cloud Managed PostgreSQL)
- Trigger: Unknown; hypothesized `/api/admin/clear` endpoint was called or database was manually dropped
- Workaround: No data recovery; backups not enabled on free tier. Must restart from scratch
- Root cause: Supabase free tier has no automatic backups; no backup policy documented
- Prevention: Enable manual backups on Yandex Cloud, or implement application-level backup strategy

## Security Considerations

**Password verification for room deletion:**
- Risk: Room owner can delete room only by re-entering password. If password reset is not implemented (see later), owner cannot delete room if password is forgotten
- Files: `app/api/rooms/[code]/route.ts` (lines 86-100)
- Current mitigation: Supabase Auth handles password management; user can reset via email
- Recommendations: Implement password reset in auth flow; add "forgot password" link. Or allow deletion via email confirmation instead

**Admin key in source code:**
- Risk: Hardcoded `x-admin-key` exposed to anyone with repo access. CI/CD logs may retain it
- Files: `app/api/admin/rooms/[code]/route.ts` (line 4)
- Current mitigation: None
- Recommendations: (1) Immediately rotate `ADMIN_API_KEY` in Render Dashboard, (2) Move to env var, (3) Remove hardcoded key from git history (`git filter-branch` or `git-filter-repo`), (4) Document key rotation process

**Supabase anon key visible in frontend:**
- Risk: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally public but limits attack surface only via RLS policies on database
- Files: `.env.test`, Render Dashboard
- Current mitigation: Supabase Auth + RLS on all tables
- Recommendations: Audit RLS policies on Profile and Participant tables to ensure users cannot query/update other users' data. Test with malicious queries

**No rate limiting on session creation:**
- Risk: Attacker can POST unlimited sessions for a participantId, inflating leaderboard or exhausting database quota
- Files: `app/api/sessions/route.ts`
- Current mitigation: None
- Recommendations: Implement per-user rate limit (e.g., 1 session/second). Use Redis or Upstash for distributed rate limiting on Render

## Performance Bottlenecks

**Full leaderboard query on every room load:**
- Problem: `/api/rooms/[code]` fetches all participants and all sessions for a room, even if only leaderboard is displayed
- Files: `app/api/rooms/[code]/route.ts` (lines 16-19)
- Cause: Eager loading of nested `sessions` array. Room with 100 participants × 50 sessions each = 5000 rows fetched and sorted in memory
- Improvement path: Add pagination to leaderboard (load top 10, lazy-load more). Use database-level sorting/limiting. Or cache leaderboard snapshot (regenerated on each new session)

**MediaPipe model loaded on every camera start:**
- Problem: `loadMP()` in CameraWorkout fetches 350+MB pose_landmarker_full.task model from `/mediapipe/wasm` on every component mount
- Files: `components/CameraWorkout.tsx` (lines 48-75)
- Cause: Model is loaded into browser memory, not persisted across navigations. Re-downloading from public CDN on every room visit
- Improvement path: Cache model in IndexedDB or Service Worker. Preload model on app shell render. Or use Pose Lite (~1MB) instead of Full if accuracy permits
- Impact: 5-10 second load time on 4G mobile networks; battery drain from repeated downloads

**Angle buffer recalculates stats every frame:**
- Problem: `processResult()` computes mean, std dev, filtering on 3-element buffer every frame (~60fps = 60 calculations/sec)
- Files: `components/CameraWorkout.tsx` (lines 149-157)
- Cause: No memoization; repeated allocation and calculation
- Improvement path: Pre-allocate buffer, reuse numeric arrays. Use fast statistical approximations. Consider lower frame rate for pose detection (30fps sufficient for pushups)

**No caching of room metadata:**
- Problem: Every room page load calls `/api/rooms/[code]` to fetch leaderboard, even if nothing changed
- Files: `app/room/[code]/page.tsx` (likely calls this on mount)
- Cause: No cache headers or client-side cache
- Improvement path: Add `Cache-Control: max-age=10` on leaderboard endpoint. Implement client-side SWR or React Query with 30-second stale time

## Fragile Areas

**CameraWorkout component state machine:**
- Files: `components/CameraWorkout.tsx`
- Why fragile: 15+ useRef and useState variables managing overlapping concerns (camera, MediaPipe, pose phase, session, countdown, hold). Transitions between states (off → searching → up/down → counting) are implicit in callbacks
- Safe modification: Document state diagram before making changes. Add invariant checks (e.g., if `mpLoaded` is false, `cameraOn` should also be false). Test all state transition paths
- Test coverage: No automated tests. Manual testing required for: camera on/off, countdown cancel, hold progress, session save failure, MediaPipe model failure

**localStorage <-> server sync in useRooms():**
- Files: `hooks/useRooms.ts` (lines 54-109)
- Why fragile: Merge logic between localStorage and API response is simple but doesn't handle: (1) room deleted on server but exists locally, (2) user removed from room on server, (3) race condition if user joins room while hydrating. Merge uses only `roomCode` as key; if room owner changes it, old entry orphaned
- Safe modification: Add logic to detect and handle server deletions (compare local with server, mark orphaned). Add userId validation before merging
- Test coverage: No tests. Manual testing required for multi-room scenarios with concurrent operations

**MediaPipe pose thresholds are global constants:**
- Files: `components/CameraWorkout.tsx` (lines 59-61, 100-112, 167-170)
- Why fragile: Detection confidence (0.5), horizontal threshold (0.45), angle thresholds (100°/140°) are hardcoded. If accuracy drops (e.g., poor lighting), no way to adjust without code change. If user feedback indicates false negatives, can't iterate
- Safe modification: Extract thresholds to constants at top of file. Load from API at component mount. Add UI to adjust in future
- Test coverage: No A/B testing framework. Thresholds were manually tuned based on dev testing (see MEMORY.md); no data on how they perform at scale

**verifyPassword function not exposed:**
- Files: `lib/verify-password.ts` (imported in app/api/rooms/[code]/route.ts)
- Why fragile: Implementation unknown; assumed to call Supabase Auth API. If function returns incorrect result, room deletion can be bypassed or locked forever
- Safe modification: Read implementation of `lib/verify-password.ts` before making auth changes. Document its contract (what happens if user has no password, if auth provider is different)
- Test coverage: No visible tests; integration test needed for password verification flow

**Phase 2 groups worktree diverging from main:**
- Files: `.worktrees/phase2-groups/` — entire codebase copied
- Why fragile: Every fix to main must be manually ported to phase2. If main and phase2 stay separate for >2 weeks, merge becomes high-risk. Bug fixes get lost
- Safe modification: If working on phase2, regularly rebase from main. If working on main after phase2 branched, cherry-pick critical fixes to phase2
- Test coverage: Phase2 has untested new API endpoints and UI logic (see phase2-groups branch notes)

## Scaling Limits

**Leaderboard query performance at scale:**
- Current capacity: ~1000 participants × 100 sessions = 100k rows fetched/sorted in-memory per request
- Limit: Query timeout (> 10 sec) or OOM on Render free tier (0.5GB)
- Scaling path: Add database indexes on (roomId, participantId). Implement leaderboard materialization (pre-computed, updated on each session creation). Use Render Pro tier with dedicated database

**Session storage grows unbounded:**
- Current capacity: ~10GB free tier Yandex Cloud storage. At 1 rep/second for 1 hour = 3600 sessions × 5 bytes/row = 18KB per hour-long session. 1000 participants = 18MB/day
- Limit: Will hit Yandex Cloud quota in ~500 days; then writes fail
- Scaling path: Implement session archival (export to S3, delete old sessions). Add cron job to clean up sessions > 1 year old. Monitor storage usage

**Free tier Render will restart on deployments:**
- Current capacity: One deployment = ~3-5min downtime (Render free tier lacks zero-downtime deploy)
- Limit: If multiple deployments/day, users experience frequent "service unavailable"
- Scaling path: Use Render Pro with background workers for DB migrations. Or use Railway/Vercel with faster cold start

**Supabase Auth free tier session limits:**
- Current capacity: Supabase free tier supports 50,000 MAU
- Limit: If user base grows, costs spike or users get rate-limited
- Scaling path: Monitor monthly active user count. Plan migration to self-hosted auth or Auth0 before hitting limit

## Dependencies at Risk

**@mediapipe/tasks-vision 0.10.32 - inactive maintenance:**
- Risk: MediaPipe is under active development, but `tasks-vision` package has had minimal updates since v0.10. Newer versions may break API
- Impact: If Google deprecates v0.10, app will fail on new deployments (npm ci will fetch deprecated package)
- Migration plan: Monitor MediaPipe releases. Test newer versions quarterly. Prepare fallback to `@tensorflow-models/pose-detection` or `MediaPipe Lite` if needed

**Next.js 14.2.35 - EOL approaching:**
- Risk: Next.js 15 is released; v14 enters maintenance mode. Security patches may stop within 6-12 months
- Impact: New vulnerabilities in Next.js won't be patched; cold starts may degrade
- Migration plan: Upgrade to Next.js 15 after Phase 2 merge. Run `next upgrade` and test

**Prisma 7.4.2 - adapter-pg may have breaking changes:**
- Risk: `@prisma/adapter-pg` is new (Prisma 6 only used native PostgreSQL driver). Breaking changes possible in v8
- Impact: Database operations fail on next major upgrade
- Migration plan: Lock Prisma to 7.x in package.json until v8 is stable (3+ months). Test v8 in phase branch before upgrading

## Missing Critical Features

**No password reset functionality:**
- Problem: User cannot reset forgotten password. If password is forgotten, user is locked out of account and cannot access rooms
- Blocks: User onboarding for new users who forget credentials immediately; critical for production UX
- Workaround: Supabase Auth UI has password reset, but link is not exposed in custom login page
- Priority: **High** — implement before public launch

**No session validation or anti-cheat verification:**
- Problem: Frontend counts reps and sends to `/api/sessions` without server-side verification. Client can send fake count=999
- Blocks: Leaderboard integrity in competitive scenarios
- Workaround: None; trust clients entirely
- Priority: **Medium** — add pose detection verification or challenge-response scheme if leaderboards are used for competitions

**No email notifications:**
- Problem: Users cannot be notified of room activity, leaderboard changes, or room deletion
- Blocks: Engagement features (friend notifications), multi-room experience
- Workaround: None
- Priority: **Low** — add after phase 3

**No room settings (private/public, participant limits):**
- Problem: All rooms are public-join (anyone with code can join). No way to cap participants or make room invite-only
- Blocks: Use cases where host wants to control membership
- Workaround: Host can manually remove participants (if endpoint exists in phase 2)
- Priority: **Low** — in scope for Phase 2/3

## Test Coverage Gaps

**API input validation not tested:**
- What's not tested: /api/rooms POST (roomName edge cases), /api/sessions POST (negative duration, invalid participantId), /api/rooms/[code]/join (code case handling)
- Files: `app/api/rooms/route.ts`, `app/api/sessions/route.ts`, `app/api/rooms/[code]/join/route.ts`
- Risk: Regression on validation logic; boundary conditions fail silently. Example: roomName with newlines could break UI
- Priority: **High** — write Jest/Vitest integration tests for all validation rules

**MediaPipe pose detection not tested:**
- What's not tested: Angle calculations with edge cases (very close joints, out-of-frame body parts), anti-cheat horizontal check with extreme poses, buffer outlier filtering
- Files: `components/CameraWorkout.tsx` (lines 77-178)
- Risk: New thresholds introduced in phase could break rep counting for certain body types or camera angles
- Priority: **Medium** — create test fixtures with mock MediaPipe results, unit test angle and outlier detection logic

**Room ownership and access control not tested:**
- What's not tested: User A cannot delete User B's room, user cannot join without auth, only owner can delete room
- Files: `app/api/rooms/[code]/route.ts` DELETE, `app/api/rooms/route.ts` POST, middleware auth checks
- Risk: Authorization bypass; attacker could delete rooms or modify others' data
- Priority: **High** — write E2E tests with multiple user accounts and attempt unauthorized operations

**useRooms hook migration logic not tested:**
- What's not tested: Old localStorage format migration, merge conflict resolution, race conditions on initial load
- Files: `hooks/useRooms.ts` (lines 14-36, 54-109)
- Risk: Users with old localStorage data could lose room history. Concurrent operations could corrupt state
- Priority: **Medium** — write unit tests for migrate(), load(), mergeRooms() with fixture data

**Error recovery and offline behavior not tested:**
- What's not tested: App behavior when camera fails, when API returns 500, when /api/rooms returns invalid JSON, when user goes offline mid-session
- Files: All API-calling components, `components/CameraWorkout.tsx`
- Risk: User frustration; unclear which errors are recoverable. Sessions may not save if network dies at wrong moment
- Priority: **Medium** — add error state tests in Storybook or Vitest

---

*Concerns audit: 2026-03-18*
