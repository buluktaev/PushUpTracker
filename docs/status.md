# Status

## Current phase
- Release candidate for `phase1-auth` is running on staging.
- Repo-side production config is now auth-ready and still protected by a manual deploy gate.

## Done
- Auth staging branch contains:
  - register/login flow
  - room hydration after login
  - `Profile` tab with `logout`, `leave_room`, owner `delete_room`
  - profile bootstrap for join/profile APIs
  - room delete no longer kills the current session
  - local MediaPipe runtime/model assets for Chrome and Safari parity
- Production blueprint updated in `render.yaml`:
  - manual deploy only
  - explicit `DATABASE_URL`
  - explicit `NEXT_PUBLIC_SUPABASE_URL`
  - explicit `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - optional `ADMIN_API_KEY`
- Added production env template in [`.env.production.example`](/Users/buluktaev/.codex/worktrees/phase1-auth-staging/.env.production.example).

## In progress
- Final staging smoke before merge to `main`.

## Next
- Redeploy staging if needed with latest `codex/phase1-auth-staging-smoke`.
- Run the final smoke from [`docs/test-plan.md`](/Users/buluktaev/.codex/worktrees/phase1-auth-staging/docs/test-plan.md).
- If staging is green, merge auth branch into `main`.
- Configure production Render env to match `.env.production.example`.
- Run manual production deploy and post-deploy smoke.

## Decisions
- `Confirm email` can remain disabled for initial testing/release if SMTP is still not ready.
- Production deploys must remain manual until auth rollout is proven stable.
- MediaPipe assets are first-party and must not regress to CDN/Google Storage.

## Known risks
- If production Supabase env points to the wrong project, auth and profile bootstrap will fail or write to the wrong backend.
- If `Confirm email` is enabled without working SMTP, signup testing and recovery flows will degrade immediately.
- No automated E2E coverage exists; release quality still depends on manual staging/prod smoke.

## Manual actions required
- Render production service:
  - set `DATABASE_URL`
  - set `NEXT_PUBLIC_SUPABASE_URL`
  - set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - optionally set `ADMIN_API_KEY`
- Supabase production project:
  - confirm `Site URL`
  - confirm `Redirect URLs`
  - confirm email mode (`Confirm email` on/off) matches release decision

## Commands
- `npm run lint`
- `DATABASE_URL='postgresql://dummy:dummy@localhost:5432/dummy' npm run build`

## Smoke/demo checks
- Staging:
  - auth works in clean browser
  - room list hydrates after login
  - join/leave/delete flows behave correctly
  - camera starts in Chrome without external MediaPipe fetches
- Production:
  - `/api/health` returns healthy
  - auth/room/camera smoke matches staging
