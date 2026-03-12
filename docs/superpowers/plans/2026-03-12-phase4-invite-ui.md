# Phase 4: Invite UI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Зависимость:** Phase 1 (Auth) должна быть завершена перед началом.

**Goal:** Упростить приглашение в комнату — копировать полную ссылку вместо кода, автозаполнять код при переходе по invite-ссылке.

**Architecture:** Кнопка копирования формирует URL с `?code=XXXXXX`. При загрузке лендинга `useSearchParams` читает `code` и автоматически открывает join форму. Изменения только во фронтенде — API не меняется.

**Tech Stack:** Next.js 14, `navigator.clipboard`, `useSearchParams`

---

## Chunk 1: Копирование полной ссылки

### Task 1: Обновить кнопку copy в switcher dropdown

**Files:**
- Modify: `app/room/[code]/page.tsx`

- [ ] Найти кнопку с иконкой `content_copy` в switcher dropdown.

- [ ] Заменить логику копирования — формировать полный URL:
```typescript
async function handleCopy(code: string) {
  const url = `${window.location.origin}/room/${code}?join=1`
  await navigator.clipboard.writeText(url)
  // показать краткое подтверждение (например сменить иконку на check на 1.5 сек)
}
```

- [ ] Добавить визуальный feedback: при нажатии на кнопку временно показывать иконку `check` вместо `content_copy`:
```typescript
const [copied, setCopied] = useState<string | null>(null)

async function handleCopy(code: string) {
  const url = `${window.location.origin}/room/${code}?join=1`
  await navigator.clipboard.writeText(url)
  setCopied(code)
  setTimeout(() => setCopied(null), 1500)
}
// В JSX: <Icon name={copied === room.roomCode ? 'check' : 'content_copy'} size={...} />
```

- [ ] Убедиться что параметр `?join=1` не мешает текущей логике комнаты (он игнорируется, т.к. роут `/room/[code]` уже существует и `/room/[code]?join=1` тоже ведёт в комнату для залогиненных).

---

## Chunk 2: Автозаполнение кода из URL

### Task 2: Читать ?code из searchParams на лендинге

**Files:**
- Modify: `app/page.tsx`

- [ ] На лендинге при наличии параметра `?code=XXXXXX` в URL — автоматически открывать форму join с предзаполненным кодом.

  Логика в `HomePageContent`:
  ```typescript
  const joinCodeParam = searchParams.get('code')

  useEffect(() => {
    if (joinCodeParam && mounted && loaded) {
      setJoinCode(joinCodeParam.toUpperCase())
      setMode('join')
    }
  }, [joinCodeParam, mounted, loaded])
  ```

- [ ] Проверить сценарий вручную:
  1. Скопировать invite-ссылку из комнаты (получим `https://host/room/ABC123?join=1`)
  2. Открыть `/room/ABC123?join=1` — если залогинен, попадаем в комнату как обычно
  3. Если не залогинен → редирект `/login` → после входа нас перебросит обратно на `/`
  4. Открыть `/?code=ABC123` напрямую → форма join открывается с предзаполненным кодом

> **Примечание:** Invite URL ведёт на `/room/[code]?join=1`, не на `/?code=`. Это означает что автозаполнение работает только если пользователь вручную переходит на `/?code=`. Для полного flow нужно либо:
> - Изменить invite URL на `/?code=XXXXXX` вместо `/room/XXXXXX?join=1`
> - Или добавить редирект в middleware: если `/room/[code]?join=1` и пользователь не является участником → редирект на `/?code=[code]`
>
> **Рекомендация:** Использовать invite URL `/?code=XXXXXX` — проще и надёжнее.

- [ ] Обновить `handleCopy` из Task 1 чтобы формировал `/?code=XXXXXX`:
```typescript
const url = `${window.location.origin}/?code=${code}`
```

- [ ] Commit:
```bash
git add app/room/ app/page.tsx
git commit -m "feat: copy full invite link and auto-fill join code from URL"
```

---

## Chunk 3: Финальная проверка

### Task 3: E2E проверка invite flow

- [ ] Запустить dev-сервер: `npm run dev`

- [ ] Сценарий 1 — залогиненный пользователь:
  1. Войти в комнату ABC123
  2. Открыть switcher dropdown → нажать кнопку copy
  3. Вставить скопированный URL в новой вкладке → должен открыться лендинг с предзаполненным кодом в форме join
  4. Нажать `execute()` → попасть в комнату

- [ ] Сценарий 2 — незалогиненный пользователь по invite-ссылке:
  1. Открыть invite URL в режиме инкогнито → редирект на `/login`
  2. Войти → попасть на `/` (без кода, т.к. URL изменился после редиректа)
  3. Открыть invite URL снова → попасть на лендинг с кодом → join

- [ ] Commit:
```bash
git add -A
git commit -m "feat: complete Phase 4 — invite UI improvements"
```
