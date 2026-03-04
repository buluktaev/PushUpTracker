# 💪 PushUp Tracker — Server

Бэкенд для общего лидерборда. Node.js + Express + SQLite.

## Быстрый старт (локально)

```bash
cd PushUpTracker-Server
npm install
npm start
```

Сервер запустится на `http://localhost:3000`.

## Деплой на Railway

### 1. Подготовка

1. Зайди на [railway.app](https://railway.app) и залогинься через GitHub
2. Создай новый проект → **Deploy from GitHub Repo**
3. Подключи репозиторий с этой папкой

### 2. Добавь Volume (чтобы база не терялась)

1. В проекте нажми **+ New** → **Volume**
2. Mount Path: `/data`
3. Это сохранит SQLite-базу между деплоями

### 3. Переменные окружения

Railway подставит `PORT` автоматически. Но убедись, что есть:

```
DATABASE_PATH=/data/pushups.db
```

### 4. Получи URL

После деплоя Railway даст URL вроде:
```
https://pushup-tracker-server-production-xxxx.up.railway.app
```

Этот URL нужно вставить в Swift-приложение (в `APIClient.swift`).

## API Endpoints

### Players

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/players` | Все игроки со статистикой |
| POST | `/api/players` | Создать игрока `{ "name": "Иван" }` |
| DELETE | `/api/players/:id` | Удалить игрока |

### Sessions

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/sessions` | Записать сессию `{ "player_id": "...", "count": 25, "duration": 60 }` |
| GET | `/api/sessions/:playerId` | История сессий игрока |

### Leaderboard & Stats

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/leaderboard` | Лидерборд всей команды |
| GET | `/api/stats/team?days=7` | Командная статистика |
| GET | `/api/stats/:playerId?days=30` | Статистика игрока |

## Примеры запросов

```bash
# Создать игрока
curl -X POST http://localhost:3000/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Санан"}'

# Записать 25 отжиманий
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"player_id": "abc123", "count": 25, "duration": 45.5}'

# Лидерборд
curl http://localhost:3000/api/leaderboard

# Статистика команды за неделю
curl http://localhost:3000/api/stats/team?days=7
```

## Подключение к Swift-приложению

1. Открой `APIClient.swift`
2. Замени URL в `baseURL`:

```swift
return "https://your-app-name.up.railway.app"
```

3. В Xcode: **Signing & Capabilities** → App Sandbox → включи **Outgoing Connections (Client)**
4. Или обнови `PushUpTracker.entitlements` — ключ `com.apple.security.network.client` уже добавлен

## Как коллеги подключатся

1. Каждый скачивает и собирает приложение в Xcode (или ты раздаёшь .app файл)
2. При первом запуске вводят своё имя
3. Приложение регистрирует их на сервере
4. Все видят общий лидерборд!
