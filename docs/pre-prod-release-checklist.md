# Pre-Prod Release Checklist

## Scope

- Этот checklist относится ко всему продукту, а не только к redesign-дельте.
- Текущий путь выката: `release candidate -> production`.
- Отдельного staging-стенда нет, поэтому риск снимается не средой, а жестким pre-prod gate и быстрым rollback contract.
- `/components`, `/screens`, `/design-preview` считаются review-only surface и не должны быть доступны в production.

## Env Contract

### Production

- `NODE_ENV=production`
- `NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=false`
- `APP_PUBLIC_URL=https://<prod-host>`
- рабочие `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- рабочий `DATABASE_URL`
- рабочий `ADMIN_API_KEY`

## Pre-Merge Review

- [ ] Нет старых route-level UI веток рядом с новыми production flows.
- [ ] Shared components не расходятся между live route и review surface.
- [ ] Loading/disabled contract не отпускает форму до route takeover.
- [ ] Auth/session/cookie/middleware contract не сломан.
- [ ] Env-specific логика не зашита продово в коде.
- [ ] Destructive flows имеют field validation, disabled state и mobile visibility contract.
- [ ] `npm run preprod:static` проходит локально или в CI.

## Pre-Deploy Checks

- [ ] Production env совпадает по required vars и redirect URL contract.
- [ ] `APP_PUBLIC_URL` и Supabase redirect URLs указывают на production host.
- [ ] Review routes закрыты в production contract (`NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=false`).
- [ ] В runtime/config больше нет tunnel fallback и stale staging host marker.
- [ ] Legacy audit просмотрен: warnings либо закрыты, либо явно приняты в release notes.
- [ ] Сделан backup / snapshot production DB перед релизом.
- [ ] Если backup делается из терминала, используется project-wide backup contract:
  - `pg_dump`
  - host `rc1a-7633vqts157enmle.mdb.yandexcloud.net`
  - port `6432`
  - db `selectywellness_app`
  - user `selectywellness_app`
  - `sslmode=require`
  - после dump выполнен `pg_restore --list`
- [ ] Определены smoke account и test room codes для post-deploy проверки.

## Production Rollout

- [ ] Назначено окно выката и ответственный за rollback.
- [ ] Выполнен deploy release candidate на production.
- [ ] Сразу после deploy пройден `npm run smoke:health` против production URL.
- [ ] Сразу после deploy пройден `npm run smoke:browser` против production URL.
- [ ] Проверены auth flows: `/login`, `/register`, `/verify-email`, `/auth/confirm`, `/forgot-password`, `/reset-password`.
- [ ] Проверен post-auth entry flow: `0`, `1`, `2+` rooms, create/join room, `?add=1`.
- [ ] Проверен room flow: workout, leaderboard, profile, settings, `?tab=...`, refresh.
- [ ] Проверены logout, recovery links, destructive confirms, mobile bottom tabs/autoscroll.
- [ ] Проверены реальные email flows Supabase уже на production host.

## Rollback Criteria

- rollback обязателен, если:
  - auth flow не пускает пользователя в приложение;
  - room route ломает workout/leaderboard/profile/settings shell;
  - `/api/health` не healthy;
  - recovery links ведут не на актуальный public host;
  - production accidentally exposes review routes.

## Notes

- Playwright smoke делится на:
  - public smoke, который идет всегда;
  - authenticated room smoke, который включается только если заданы production-safe smoke secrets:
    - `SMOKE_LOGIN_EMAIL`
    - `SMOKE_LOGIN_PASSWORD`
    - `SMOKE_ROOM_CODE`
    - `SMOKE_OWNER_ROOM_CODE`
