# Plans

## Phase 1 Auth -> Production Rollout

### Goal
- Safely promote the auth-enabled room flow from `codex/phase1-auth-staging-smoke` to production without losing current sessions, room membership semantics, or camera support in Chrome.

### Assumptions
- Production will continue to run on Render with the root `render.yaml`.
- Production will use a dedicated Supabase project and a dedicated Postgres database, separate from staging.
- `Confirm email` may remain disabled for the initial release if SMTP is still not ready; this is a product decision, not a code blocker.
- The current production service should deploy manually only after staging smoke is green.

### Milestone 1: Freeze release candidate
- Status: `[x]`
- Goal: ensure the auth staging branch contains all intended functional fixes.
- Tasks:
  - Keep the auth room/profile/delete flow on `codex/phase1-auth-staging-smoke`.
  - Confirm recent fixes are included:
    - profile bootstrap and join stability
    - room list hydration after login
    - `Profile` tab with `logout`, `leave_room`, `delete_room`
    - owner delete keeps current session alive
    - local MediaPipe assets for Chrome
- Done when:
  - Auth staging is the canonical release candidate branch.
  - No known blocking functional bugs remain from the staging smoke.
- Validation:
  - `git log --oneline -12`
- Stop-and-fix rule:
  - If a new staging blocker appears, do not merge to `main` until it is fixed and restaged.

### Milestone 2: Make production config auth-ready
- Status: `[x]`
- Goal: ensure the production Render blueprint can build and run the auth-enabled app.
- Tasks:
  - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `render.yaml`.
  - Keep `DATABASE_URL` and optional `ADMIN_API_KEY` explicit in the production blueprint.
  - Force production deploys to remain manual via `autoDeployTrigger: off`.
  - Add a production env template in `.env.production.example`.
- Done when:
  - Production blueprint contains the env contract required by the auth build/runtime.
  - Manual release gate is explicit in repo config.
- Validation:
  - `sed -n '1,220p' render.yaml`
  - `sed -n '1,200p' .env.production.example`
- Stop-and-fix rule:
  - If production auth env is incomplete, do not merge or deploy.

### Milestone 3: Stage and production release gate
- Status: `[~]`
- Goal: define the exact rollout sequence and validation gates.
- Tasks:
  - Update `docs/status.md` with current release candidate state and required manual actions.
  - Update `docs/test-plan.md` with final staging smoke and production smoke.
  - Prepare the merge/deploy order:
    1. deploy latest auth staging branch
    2. run final staging smoke
    3. merge auth branch to `main`
    4. set production env in Render
    5. run manual production deploy
    6. run production smoke
- Done when:
  - Release operator can deploy without reconstructing decisions from chat history.
- Validation:
  - `sed -n '1,260p' docs/status.md`
  - `sed -n '1,320p' docs/test-plan.md`
- Stop-and-fix rule:
  - If any production dependency or step is ambiguous, update docs before rollout.

### Milestone 4: Manual rollout
- Status: `[ ]`
- Goal: release auth to production.
- Tasks:
  - Merge `codex/phase1-auth-staging-smoke` into `main`.
  - Ensure Render production service is synced with `render.yaml`.
  - Set production env:
    - `DATABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - optional `ADMIN_API_KEY`
  - Run manual deploy on production.
  - Execute production smoke from `docs/test-plan.md`.
- Done when:
  - Production healthcheck is green.
  - Auth flow, room flow, and camera smoke all pass on production.
- Validation:
  - `/api/health`
  - final browser smoke
- Stop-and-fix rule:
  - If production smoke fails, stop rollout and fix on branch before retrying.
