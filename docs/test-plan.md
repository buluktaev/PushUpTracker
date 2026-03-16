# Test Plan

## Final staging smoke

### 1. Auth
- Зарегистрировать нового пользователя.
- Если `Confirm email` выключен: пользователь должен сразу уметь логиниться.
- Если `Confirm email` включён: письмо должно вести не на `localhost`, а на staging URL.
- В чистом браузере/инкогнито выполнить логин.
- Ожидание:
  - нет redirect loop;
  - открывается home screen;
  - список доступных комнат гидрируется с сервера.

### 2. Room lifecycle
- Пользователь A создаёт комнату.
- Ожидание:
  - открывается `/room/<CODE>`;
  - в `Profile` роль `owner`.
- Пользователь B в инкогнито входит в комнату по коду.
- Ожидание:
  - join проходит без `Profile not found` и без `500`;
  - в `Profile` роль `member`.
- Пользователь B сохраняет тренировку.
- Ожидание:
  - нет `403`;
  - лидерборд обновляется.
- Пользователь B выполняет `leave_room()`.
- Ожидание:
  - редирект на `/`;
  - комната исчезает из списка;
  - после refresh и в новом чистом окне комната не возвращается.
- Пользователь A удаляет комнату через `delete_room()`.
- Ожидание:
  - требуется точное название комнаты и пароль;
  - после успешного удаления пользователь остаётся залогинен;
  - попадает на `/`;
  - видит обычный state `create_room()` / `join_room()`, а не экран логина.

### 3. Account behavior
- Внутри `Profile` выполнить `logout()`.
- Ожидание:
  - происходит только logout;
  - комнаты и статистика не удаляются;
  - после повторного логина комнаты возвращаются.

### 4. MediaPipe / camera
- Открыть staging в Chrome.
- Включить камеру в `Workout`.
- Ожидание:
  - статус не падает в `err: local mediapipe failed`;
  - в `Network` MediaPipe грузится только с:
    - `/mediapipe/wasm/...`
    - `/mediapipe/models/pose_landmarker_full.task`
  - нет запросов к `cdn.jsdelivr.net` и `storage.googleapis.com`.
- Повторить тот же сценарий в Safari.
- Проверить, что старт/стоп камеры работает и сохранение тренировки не ломается.

## Production rollout smoke

### Pre-deploy gate
- Убедиться, что staging smoke зелёный.
- Убедиться, что production Render env совпадает с `.env.production.example`.
- Убедиться, что production Supabase project и production DB не указывают на staging ресурсы.

### Post-deploy gate
- Проверить `GET /api/health`.
- В чистом браузере пройти:
  - login/register (по выбранному email-confirm mode)
  - создание комнаты
  - join вторым пользователем
  - save workout
  - `leave_room()` для member
  - `delete_room()` для owner
- В Chrome отдельно проверить старт камеры и отсутствие внешних MediaPipe fetch.

## Release decision
- Rollout is green only if:
  - auth works in clean browser;
  - room list hydrates after login;
  - join/leave/delete flows pass;
  - delete room does not log the owner out;
  - camera works in Chrome on first-party MediaPipe assets.
