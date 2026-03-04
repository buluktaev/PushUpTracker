# Рефакторинг PushUpTracker — Вариант A

**Дата:** 2026-03-04
**Scope:** Архитектура + Качество кода + Дизайн UI

## Цели

1. Перейти на современный `@Observable` вместо `ObservableObject`
2. Убрать дублирование кода в `LeaderboardView`
3. Улучшить визуальный дизайн приложения

---

## Секция 1 — Архитектура (@Observable)

**Проблема:** `StatsManager` и `APIClient` используют `ObservableObject` + `@Published` + `DispatchQueue.main.async` — устаревший паттерн.

**Решение:** Миграция на макрос `@Observable` (macOS 14+):
- Убрать `import Combine` там где не нужен
- Заменить `@Published var` на просто `var`
- Убрать `DispatchQueue.main.async` — `@Observable` обновляет UI автоматически на main actor
- Аннотировать классы `@MainActor`

**Файлы:** `StatsManager.swift`, `APIClient.swift`

---

## Секция 2 — Качество кода

**Проблема:** `LeaderboardView.swift` содержит `ServerLeaderboardRow` и `LeaderboardRow` — ~80 строк дублированного кода. Логика сортировки продублирована.

**Решение:**
- Ввести протокол `LeaderboardEntry` с полями: `id`, `name`, `totalPushUps`, `bestSession`, `streak`, `averagePerSession`, `sessionsCount`
- Сделать `ServerPlayer` и `Player` соответствующими этому протоколу
- Один компонент `LeaderboardRow` принимает `any LeaderboardEntry`
- Одна функция сортировки `sorted(_:by:)`

**Файлы:** `LeaderboardView.swift`, `Models.swift`, `APIClient.swift`

---

## Секция 3 — Дизайн UI

**Проблема:** Приложение выглядит как системная macOS-утилита: серые фоны, базовые кнопки, нет визуальных акцентов.

**Решение:**

### WorkoutView
- Счётчик отжиманий с анимацией `.scaleEffect` при каждом новом отжимании
- Цветной градиентный фон панели управления вместо `NSColor.controlBackgroundColor`

### StatsView
- Бар-чарт с акцентным цветом и hover-эффектами
- Цифры статистики в крупных карточках с цветными иконками

### LeaderboardView
- Подиум с лёгкими градиентами (gold/silver/bronze) вместо flat-прямоугольников
- Строки с hover-highlight

### Общее
- Консистентный corner radius: 10pt везде
- Тени `.shadow(radius: 2)` на карточках
- Убрать emoji из заголовков (🏆, 🎉) — использовать SF Symbols

**Файлы:** `WorkoutView.swift`, `StatsView.swift`, `LeaderboardView.swift`, `ContentView.swift`
