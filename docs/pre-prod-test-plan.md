# Pre-Prod Test Plan

## 1. Static Gates

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run audit:legacy`

## 2. Automated Smoke

### Public browser smoke (`npm run smoke:browser`)

- `/login` renders heading and submit CTA
- `/register` renders heading and submit CTA
- `/forgot-password` required validation works on live route
- `/reset-password` without marker lands in invalid-link state
- `/` without session redirects to `/login`
- `/room/[code]` without session redirects to `/login?next=...`
- review route contract is checked against `SMOKE_REVIEW_ROUTES_MODE`

### Authenticated browser smoke (`npm run smoke:browser` with secrets)

- login succeeds with production-safe smoke account
- room tabs switch between workout/leaderboard/profile
- `?tab=` survives refresh
- owner settings destructive confirm opens with empty fields

### Health smoke (`npm run smoke:health`)

- `GET /api/health`
- response must be `200`
- DB status must be healthy

## 3. Manual Production QA

### Auth

- регистрация -> verify email -> auth confirm -> welcome/name path
- логин success + invalid credentials
- forgot-password submit
- forgot-password sent-state / resend cooldown / blocked
- reset-password fresh recovery link
- reset-password invalid/expired link

### Post-auth Entry

- `0 rooms` path
- `1 room` auto redirect
- `2+ rooms` returning rooms chooser
- `?add=1` compact add-room flow
- create room
- join room
- add room from existing room (`fromRoom`)

### Room

- workout shell and basic start/finish session flow
- leaderboard/profile/settings render
- desktop tabs + mobile bottom tabs
- refresh preserves active `?tab=...`
- delete room confirm
- logout / leave room confirm

## 4. Production Hygiene

- production host returns `404` for:
  - `/components`
  - `/screens`
  - `/design-preview`
- no tunnel URLs or stale staging host markers remain in runtime/config files
- no review/debug copy leaks into live product flows
- Render healthcheck stays on `/api/health`

## 5. Required Secrets / Vars For Full Production Smoke

- GitHub Actions variable:
  - `PROD_BASE_URL`
- GitHub Actions secrets:
  - `SMOKE_LOGIN_EMAIL`
  - `SMOKE_LOGIN_PASSWORD`
  - `SMOKE_ROOM_CODE`
  - `SMOKE_OWNER_ROOM_CODE`

## 6. Acceptance Gate

Release candidate can be considered successful on production only if:

- static gates green
- production health smoke green
- browser smoke green for available public/authenticated slices
- manual production QA for email/recovery/create-join/workout completed
- no unresolved release-blocking findings remain
