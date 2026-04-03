# Pre-Prod Status

## Current Phase

- `[~]` Release gate infrastructure

## Done

- `[x]` Введен явный env gate для review routes через `NEXT_PUBLIC_ENABLE_REVIEW_ROUTES`.
- `[x]` `render.yaml` фиксирует production contract для review routes и `APP_PUBLIC_URL`.
- `[x]` Local prod-like smoke подтверждает production contract для review routes.
- `[x]` Добавлены static release commands:
  - `npm run typecheck`
  - `npm run audit:legacy`
  - `npm run preprod:static`
- `[x]` Добавлены smoke entrypoints:
  - `npm run smoke:health`
  - `npm run smoke:browser`
- `[x]` Добавлен GitHub Actions workflow `preprod-gate`.
- `[x]` Добавлен baseline Playwright smoke suite для public routes и authenticated room checks.

## In Progress

- `[~]` Prod-direct release pack
  - workflow уже готов
  - нужен production URL и production-safe smoke secrets для post-deploy remote smoke

## Next

- `[ ]` Подготовить production env/signoff contract:
  - `NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=false`
  - `APP_PUBLIC_URL=<prod-host>`
- `[ ]` Выполнить DB backup / snapshot перед deploy.
- `[ ]` Выполнить `workflow_dispatch` для `preprod-gate` уже после prod deploy с `PROD_BASE_URL`.
- `[ ]` Закрыть или явно принять legacy warnings из `npm run audit:legacy`.
- `[ ]` Решить recovery upstream rate-limit UX до final prod signoff, если хотим убрать synthetic fallback полностью.

## Known Risks

- `LEGACY_PATH_ICONS` еще живет в icon layer и должен быть закрыт отдельным cleanup, если хотим нулевой legacy debt.
- `lib/exerciseConfigs.ts` содержит TODO про placeholder exercise icons.
- Browser smoke покрывает public flows всегда, а room/authenticated slices только при наличии production-safe smoke secrets и test room codes.
- Recovery flow уже production-shaped, но upstream Supabase email rate limit UX still needs explicit prod decision.
- Без staging риск выше обычного, поэтому rollback должен быть мгновенным, а не repair-on-prod.

## Commands

- Static gate:
  - `npm run preprod:static`
- Legacy audit only:
  - `npm run audit:legacy`
- Production health smoke:
  - `SMOKE_BASE_URL=https://<prod-host> npm run smoke:health`
- Production browser smoke:
  - `PLAYWRIGHT_BASE_URL=https://<prod-host> SMOKE_REVIEW_ROUTES_MODE=closed npm run smoke:browser`

## Release Blocking Checks

- auth: `/login`, `/register`, `/verify-email`, `/auth/confirm`, `/forgot-password`, `/reset-password`
- post-auth entry: `/`, create/join room
- room: `/room/[code]` tabs, refresh, mobile tabbar
- logout, recovery links, destructive confirms, `/api/health`
