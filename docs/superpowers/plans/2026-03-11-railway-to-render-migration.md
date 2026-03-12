# Railway → Render Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перенести Next.js web service с Railway на Render, добавив health-check эндпоинт и конфиг Render.

**Architecture:** Без изменений в коде приложения. Добавляется один Route Handler для health check, создаётся `render.yaml` для Render IaC, удаляется `railway.toml`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Docker, Render free tier.

---

## Chunk 1: Код и конфиги

### Task 0: Создать worktree

- [ ] **Step 1:** Использовать skill `superpowers:using-git-worktrees` для создания изолированного worktree от `main`.

  Worktree должен называться `migrate-to-render`. Все последующие изменения делать в нём.

---

### Task 1: Создать health-check эндпоинт

**Files:**
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Создать файл**

```ts
// app/api/health/route.ts
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Проверить локально**

```bash
npm run dev
# В отдельном терминале:
curl http://localhost:3000/api/health
```

Ожидаемый результат:
```json
{"ok":true}
```

- [ ] **Step 3: Коммит**

```bash
git add app/api/health/route.ts
git commit -m "feat: add /api/health endpoint for Render health check"
```

---

### Task 2: Создать render.yaml

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Создать файл**

```yaml
# render.yaml
services:
  - type: web
    name: pushup-tracker
    runtime: docker
    dockerfilePath: ./Dockerfile
    plan: free
    region: frankfurt
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production  # намеренно дублирует ENV в Dockerfile — dashboard-значение имеет приоритет
    healthCheckPath: /api/health
    # startCommand не задан — Render использует CMD из Dockerfile:
    # "npx prisma migrate deploy && next start"
    # port не задан — Render берёт из EXPOSE 3000 в Dockerfile
```

- [ ] **Step 2: Коммит**

```bash
git add render.yaml
git commit -m "feat: add render.yaml for Render deployment"
```

---

### Task 3: Удалить railway.toml

**Files:**
- Delete: `railway.toml`

- [ ] **Step 1: Проверить что файл существует и удалить**

```bash
ls railway.toml && git rm railway.toml
git commit -m "chore: remove railway.toml (migrating to Render)"
```

---

### Task 4: Запушить ветку (не main)

> ⚠️ НЕ пушить в `main` напрямую. Создать PR или попросить пользователя дать команду на мерж.

- [ ] **Step 1:** Запушить worktree-ветку в origin и дождаться команды пользователя на мерж в main.

---

## Chunk 2: Настройка Render

> Выполняется после того как изменения смержены в `main`.

### Task 5: Подключить репозиторий на Render

- [ ] **Step 1:** Зайти на [render.com](https://render.com) → New → Web Service
- [ ] **Step 2:** Подключить GitHub аккаунт (если не подключён) → выбрать репозиторий `PushUpTracker`
- [ ] **Step 3:** Render автоматически обнаружит `render.yaml` — подтвердить настройки
- [ ] **Step 4:** В разделе **Environment** добавить переменную:
  - `DATABASE_URL` = значение из Supabase → Settings → Database → **Session pooler** (порт 5432, не 6543)
- [ ] **Step 5:** Нажать **Deploy**

---

### Task 6: Дождаться первого деплоя и проверить

- [ ] **Step 1:** Следить за логами в Render Dashboard (~5–7 мин на Docker build)

  Prisma 7 в логах выведет одно из:
  ```
  All migrations have been successfully applied.
  ```
  или если миграций нет:
  ```
  No pending migrations to apply.
  ```
  После этого Next.js выведет:
  ```
  ✓ Ready on http://0.0.0.0:3000
  ```

- [ ] **Step 2:** Smoke-тест после деплоя

  ```bash
  # Заменить <name> на реальное имя сервиса из Render
  curl https://<name>.onrender.com/api/health
  ```

  Ожидаемый результат:
  ```json
  {"ok":true}
  ```

- [ ] **Step 3:** Открыть главную страницу в браузере → создать тестовую комнату → убедиться что комната появилась (БД работает)

---

### Task 7: Обновить UptimeRobot

- [ ] **Step 1:** Зайти в UptimeRobot → найти монитор → изменить URL на:
  ```
  https://<name>.onrender.com/api/health
  ```
- [ ] **Step 2:** Убедиться что монитор показывает **Up**

---

### Task 8: Отключить Railway

> Выполнять только после того как Render работает стабильно (подождать 10–15 мин).

- [ ] **Step 1:** Зайти в Railway Dashboard → выбрать проект
- [ ] **Step 2:** Settings → Danger Zone → **Delete Service** (или Suspend)
