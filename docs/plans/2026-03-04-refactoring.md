# Рефакторинг PushUpTracker — Вариант A

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Мигрировать на `@Observable`, убрать дублирование в Leaderboard, улучшить дизайн UI.

**Architecture:** Три независимых шага: сначала архитектурная миграция (@Observable), затем качество кода (деduplication), затем дизайн. Каждый шаг компилируется и работает отдельно.

**Tech Stack:** SwiftUI, macOS 14+, `@Observable` macro (Observation framework)

---

## Task 1: Мигрировать StatsManager и ReminderManager на @Observable

**Files:**
- Modify: `app/PushUpTracker/Services/StatsManager.swift`
- Modify: `app/PushUpTracker/Services/ReminderManager.swift`
- Modify: `app/PushUpTracker/PushUpTrackerApp.swift`
- Modify: `app/PushUpTracker/Views/ContentView.swift`
- Modify: `app/PushUpTracker/Views/WorkoutView.swift`
- Modify: `app/PushUpTracker/Views/StatsView.swift`
- Modify: `app/PushUpTracker/Views/LeaderboardView.swift`
- Modify: `app/PushUpTracker/Views/SettingsView.swift`

### Step 1: Обновить StatsManager

Заменить заголовок класса и убрать `@Published`:

```swift
// БЫЛО:
import Combine
class StatsManager: ObservableObject {
    @Published var sessions: [PushUpSession] = []
    @Published var dailyStats: [DailyStats] = []
    @Published var players: [Player] = []
    @Published var currentPlayer: Player?
    @Published var serverPlayers: [ServerPlayer] = []
    @Published var serverConnected = false
    @Published var syncStatus: String = ""
    @Published var currentPlayerId: String?

// СТАЛО:
import Observation
@Observable
@MainActor
class StatsManager {
    var sessions: [PushUpSession] = []
    var dailyStats: [DailyStats] = []
    var players: [Player] = []
    var currentPlayer: Player?
    var serverPlayers: [ServerPlayer] = []
    var serverConnected = false
    var syncStatus: String = ""
    var currentPlayerId: String?
```

Убрать все `DispatchQueue.main.async { ... }` — заменить прямым присвоением.
Например в `checkServerAndSync()`:

```swift
// БЫЛО:
DispatchQueue.main.async {
    self.serverConnected = self.api.isConnected
}

// СТАЛО:
serverConnected = api.isConnected
```

То же самое для всех аналогичных блоков в `registerOnServer`, `submitSessionToServer`, `fetchLeaderboard`.

Убрать `import Combine` из `StatsManager.swift`.

### Step 2: Обновить ReminderManager

```swift
// Открыть файл ReminderManager.swift
// Заменить:
class ReminderManager: ObservableObject {
    @Published var permissionGranted = false
    @Published var settings: ReminderSettings = ...

// На:
import Observation
@Observable
@MainActor
class ReminderManager {
    var permissionGranted = false
    var settings: ReminderSettings = ...
```

Убрать все `DispatchQueue.main.async` внутри — заменить прямым присвоением.

### Step 3: Обновить PushUpTrackerApp.swift

```swift
// БЫЛО:
@StateObject private var statsManager = StatsManager()
@StateObject private var reminderManager = ReminderManager()
// ...
ContentView()
    .environmentObject(statsManager)
    .environmentObject(reminderManager)
// MenuBarView()
//    .environmentObject(statsManager)
//    .environmentObject(reminderManager)

// СТАЛО:
@State private var statsManager = StatsManager()
@State private var reminderManager = ReminderManager()
// ...
ContentView()
    .environment(statsManager)
    .environment(reminderManager)
// MenuBarView()
//    .environment(statsManager)
//    .environment(reminderManager)
```

### Step 4: Обновить все Views

В каждом View заменить:

```swift
// БЫЛО:
@EnvironmentObject var statsManager: StatsManager
@EnvironmentObject var reminderManager: ReminderManager

// СТАЛО:
@Environment(StatsManager.self) var statsManager
@Environment(ReminderManager.self) var reminderManager
```

Файлы для замены: `ContentView.swift`, `WorkoutView.swift`, `StatsView.swift`, `LeaderboardView.swift`, `SettingsView.swift`.

**Важно:** `WorkoutView` использует `@StateObject private var camera = CameraManager()` — его НЕ трогаем в этом шаге (CameraManager — отдельный сервис, он работает).

### Step 5: Собрать проект

В Xcode: `Cmd+B` или `Product → Build`.
Ожидаем: 0 ошибок, 0 предупреждений о deprecated API.

### Step 6: Коммит

```bash
git add app/PushUpTracker/Services/StatsManager.swift \
        app/PushUpTracker/Services/ReminderManager.swift \
        app/PushUpTracker/PushUpTrackerApp.swift \
        app/PushUpTracker/Views/ContentView.swift \
        app/PushUpTracker/Views/WorkoutView.swift \
        app/PushUpTracker/Views/StatsView.swift \
        app/PushUpTracker/Views/LeaderboardView.swift \
        app/PushUpTracker/Views/SettingsView.swift
git commit -m "refactor: migrate to @Observable macro"
```

---

## Task 2: Мигрировать APIClient на @Observable

**Files:**
- Modify: `app/PushUpTracker/Services/APIClient.swift`

### Step 1: Обновить APIClient

```swift
// БЫЛО:
import Combine
class APIClient: ObservableObject {
    static let shared = APIClient()
    @Published var isConnected = false
    @Published var lastError: String?

// СТАЛО:
import Observation
@Observable
@MainActor
class APIClient {
    static let shared = APIClient()
    var isConnected = false
    var lastError: String?
```

Метод `checkConnection()` — убрать `DispatchQueue.main.async`:

```swift
// БЫЛО:
func checkConnection() async {
    do {
        let _ = try await get("/")
        DispatchQueue.main.async {
            self.isConnected = true
            self.lastError = nil
        }
    } catch {
        DispatchQueue.main.async {
            self.isConnected = false
            self.lastError = error.localizedDescription
        }
    }
}

// СТАЛО:
func checkConnection() async {
    do {
        let _ = try await get("/")
        isConnected = true
        lastError = nil
    } catch {
        isConnected = false
        lastError = error.localizedDescription
    }
}
```

### Step 2: Собрать

`Cmd+B`. Ожидаем: сборка успешна.

### Step 3: Коммит

```bash
git add app/PushUpTracker/Services/APIClient.swift
git commit -m "refactor: migrate APIClient to @Observable"
```

---

## Task 3: Убрать дублирование в LeaderboardView

**Files:**
- Modify: `app/PushUpTracker/Models/Models.swift`
- Modify: `app/PushUpTracker/Services/APIClient.swift`
- Modify: `app/PushUpTracker/Views/LeaderboardView.swift`

### Step 1: Добавить протокол в Models.swift

В конец файла `Models.swift` добавить:

```swift
// MARK: - Протокол для лидерборда

protocol LeaderboardEntry: Identifiable {
    var id: String { get }
    var name: String { get }
    var totalPushUps: Int { get }
    var bestSession: Int { get }
    var streak: Int { get }
    var averagePerSession: Double { get }
    var sessionsCount: Int { get }
}
```

### Step 2: Сделать Player соответствующим протоколу

В `Models.swift`, в структуру `Player` добавить:

```swift
// Добавить computed property для id как String:
var id: String { uuid.uuidString }

// Переименовать существующий id: UUID → uuid: UUID
```

**Полная обновлённая структура Player:**

```swift
struct Player: Codable, Hashable, LeaderboardEntry {
    let uuid: UUID
    var name: String
    var totalPushUps: Int
    var bestSession: Int
    var sessionsCount: Int
    var streak: Int
    var lastActiveDate: Date

    // LeaderboardEntry
    var id: String { uuid.uuidString }
    var averagePerSession: Double {
        guard sessionsCount > 0 else { return 0 }
        return Double(totalPushUps) / Double(sessionsCount)
    }

    init(name: String) {
        self.uuid = UUID()
        self.name = name
        self.totalPushUps = 0
        self.bestSession = 0
        self.sessionsCount = 0
        self.streak = 0
        self.lastActiveDate = Date()
    }
}
```

**Важно:** Везде где использовался `player.id` как UUID (например `players.removeAll { $0.id == id }` в StatsManager), нужно заменить на `player.uuid`.

Проверить и обновить в `StatsManager.swift`:
- `removePlayer(id: UUID)` — параметр остаётся UUID, внутри: `players.removeAll { $0.uuid == id }`
- `setCurrentPlayer` — `statsManager.currentPlayer?.id` в Views → `statsManager.currentPlayer?.uuid`

### Step 3: Сделать ServerPlayer соответствующим протоколу

В `APIClient.swift`, обновить `ServerPlayer`:

```swift
struct ServerPlayer: Codable, LeaderboardEntry {
    let id: String
    let name: String
    var total_pushups: Int?
    var best_session: Int?
    var sessions_count: Int?
    var average_per_session: Double?
    var streak: Int?
    var last_active_date: String?
    var created: Bool?

    // LeaderboardEntry
    var totalPushUps: Int { total_pushups ?? 0 }
    var bestSession: Int { best_session ?? 0 }
    var sessionsCount: Int { sessions_count ?? 0 }
    var averagePerSession: Double { average_per_session ?? 0 }
}
```

### Step 4: Заменить LeaderboardRow + ServerLeaderboardRow одним компонентом

В `LeaderboardView.swift` удалить оба `struct LeaderboardRow` и `struct ServerLeaderboardRow`.
Добавить один компонент:

```swift
struct LeaderboardRow: View {
    let rank: Int
    let player: any LeaderboardEntry
    let isCurrentPlayer: Bool
    let sortBy: LeaderboardView.SortOption

    var body: some View {
        HStack(spacing: 12) {
            Text("\(rank)")
                .font(.title3.bold().monospacedDigit())
                .foregroundColor(rank <= 3 ? .accentColor : .secondary)
                .frame(width: 30)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(player.name).font(.body.bold())
                    if isCurrentPlayer {
                        Text("(ты)").font(.caption).foregroundColor(.accentColor)
                    }
                }
                if player.streak > 0 {
                    Text("🔥 \(player.streak) дн. подряд")
                        .font(.caption).foregroundColor(.orange)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                HStack(spacing: 4) {
                    Text(mainValue).font(.title3.bold().monospacedDigit())
                    Text(mainLabel).font(.caption).foregroundColor(.secondary)
                }
                Text("\(player.sessionsCount) тренировок")
                    .font(.caption).foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 8)
        .background(isCurrentPlayer ? Color.accentColor.opacity(0.05) : Color.clear)
        .cornerRadius(8)
    }

    var mainValue: String {
        switch sortBy {
        case .total: return "\(player.totalPushUps)"
        case .best: return "\(player.bestSession)"
        case .streak: return "\(player.streak)"
        case .average: return String(format: "%.1f", player.averagePerSession)
        }
    }

    var mainLabel: String {
        switch sortBy {
        case .total: return "всего"
        case .best: return "макс"
        case .streak: return "дней"
        case .average: return "сред"
        }
    }
}
```

### Step 5: Объединить функции сортировки

В `LeaderboardView`, удалить `sortServerPlayers` и `sortedPlayers`. Добавить одну:

```swift
func sorted(_ entries: [any LeaderboardEntry]) -> [any LeaderboardEntry] {
    switch sortBy {
    case .total:   return entries.sorted { $0.totalPushUps > $1.totalPushUps }
    case .best:    return entries.sorted { $0.bestSession > $1.bestSession }
    case .streak:  return entries.sorted { $0.streak > $1.streak }
    case .average: return entries.sorted { $0.averagePerSession > $1.averagePerSession }
    }
}
```

Обновить `serverLeaderboard` и `localLeaderboard` чтобы использовали `sorted(...)`.

Обновить `isCurrentPlayer` логику:
- Server: `player.id == statsManager.currentPlayerId`
- Local: `player.id == statsManager.currentPlayer?.uuid.uuidString`

### Step 6: Собрать

`Cmd+B`. Ожидаем: сборка успешна.

### Step 7: Коммит

```bash
git add app/PushUpTracker/Models/Models.swift \
        app/PushUpTracker/Services/APIClient.swift \
        app/PushUpTracker/Views/LeaderboardView.swift \
        app/PushUpTracker/Services/StatsManager.swift
git commit -m "refactor: unify LeaderboardRow via LeaderboardEntry protocol"
```

---

## Task 4: Улучшить дизайн WorkoutView

**Files:**
- Modify: `app/PushUpTracker/Views/WorkoutView.swift`

### Step 1: Добавить анимацию счётчика

В `WorkoutView`, добавить `@State`:
```swift
@State private var counterScale: CGFloat = 1.0
```

Найти блок с большим счётчиком (строки ~69-78) и добавить анимацию:

```swift
Text("\(detector.count)")
    .font(.system(size: 96, weight: .bold, design: .rounded))
    .foregroundColor(.white)
    .shadow(color: .black.opacity(0.5), radius: 4)
    .scaleEffect(counterScale)
    .onChange(of: detector.count) { _, _ in
        withAnimation(.spring(response: 0.2, dampingFraction: 0.5)) {
            counterScale = 1.15
        }
        withAnimation(.spring(response: 0.2, dampingFraction: 0.5).delay(0.1)) {
            counterScale = 1.0
        }
    }
```

### Step 2: Улучшить панель управления

Заменить фон правой панели с `NSColor.controlBackgroundColor` на градиент:

```swift
// БЫЛО:
.background(Color(NSColor.controlBackgroundColor))

// СТАЛО:
.background(
    LinearGradient(
        colors: [Color(NSColor.controlBackgroundColor), Color(NSColor.windowBackgroundColor)],
        startPoint: .top,
        endPoint: .bottom
    )
)
```

### Step 3: Улучшить StatCard

В `StatCard.body` добавить тень:

```swift
// Добавить в конец модификаторов:
.shadow(color: color.opacity(0.15), radius: 4, y: 2)
```

### Step 4: Собрать и проверить визуально

`Cmd+B`, запустить приложение, нажать "Начать тренировку", убедиться что счётчик пульсирует при отжиманиях.

### Step 5: Коммит

```bash
git add app/PushUpTracker/Views/WorkoutView.swift
git commit -m "design: add counter pulse animation and improve WorkoutView"
```

---

## Task 5: Улучшить дизайн LeaderboardView (подиум)

**Files:**
- Modify: `app/PushUpTracker/Views/LeaderboardView.swift`

### Step 1: Обновить функцию podiumPlace

Заменить обе функции `podiumPlace` и `serverPodiumPlace` (они теперь одна, т.к. задача 3 уже объединила Row).
Создать одну `podiumPlace` которая принимает `any LeaderboardEntry`:

```swift
func podiumPlace(player: any LeaderboardEntry, rank: Int, height: CGFloat) -> some View {
    let gradient: LinearGradient
    switch rank {
    case 1: gradient = LinearGradient(colors: [.yellow.opacity(0.6), .yellow.opacity(0.2)], startPoint: .top, endPoint: .bottom)
    case 2: gradient = LinearGradient(colors: [.gray.opacity(0.5), .gray.opacity(0.15)], startPoint: .top, endPoint: .bottom)
    default: gradient = LinearGradient(colors: [.orange.opacity(0.5), .orange.opacity(0.15)], startPoint: .top, endPoint: .bottom)
    }

    return VStack(spacing: 6) {
        Text(medalEmoji(rank)).font(.system(size: 28))
        Text(player.name)
            .font(.callout.bold())
            .lineLimit(1)
        Text("\(player.totalPushUps)")
            .font(.title3.bold().monospacedDigit())
        RoundedRectangle(cornerRadius: 10)
            .fill(gradient)
            .frame(width: 80, height: height)
            .overlay(
                Text("#\(rank)")
                    .font(.caption.bold())
                    .foregroundColor(.secondary)
            )
            .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
    }
    .frame(width: 100)
}
```

Обновить `serverPodiumView` и `localPodiumView` чтобы вызывали эту одну функцию.

### Step 2: Улучшить статус подключения

Обернуть статус-бар в карточку:

```swift
// БЫЛО: просто HStack с кружком
// СТАЛО:
HStack(spacing: 6) {
    Circle()
        .fill(statsManager.serverConnected ? .green : .secondary)
        .frame(width: 7, height: 7)
    Text(statsManager.serverConnected ? "Сервер подключён" : "Локальные данные")
        .font(.caption)
        .foregroundColor(.secondary)
    if !statsManager.syncStatus.isEmpty && statsManager.serverConnected {
        Text("· \(statsManager.syncStatus)")
            .font(.caption)
            .foregroundColor(.secondary)
    }
    Spacer()
}
.padding(.horizontal)
.padding(.vertical, 6)
.background(Color(NSColor.controlBackgroundColor).opacity(0.5))
```

### Step 3: Собрать

`Cmd+B`. Проверить визуально — подиум выглядит лучше.

### Step 4: Коммит

```bash
git add app/PushUpTracker/Views/LeaderboardView.swift
git commit -m "design: improve leaderboard podium with gradients"
```

---

## Task 6: Улучшить дизайн StatsView

**Files:**
- Modify: `app/PushUpTracker/Views/StatsView.swift`

### Step 1: Улучшить бар-чарт

Найти `chartSection`. Заменить бары:

```swift
// БЫЛО:
RoundedRectangle(cornerRadius: 3)
    .fill(barColor(for: stat.totalPushUps, max: maxValue))
    .frame(height: max(CGFloat(stat.totalPushUps) / CGFloat(maxValue) * 120, stat.totalPushUps > 0 ? 4 : 1))

// СТАЛО:
RoundedRectangle(cornerRadius: 4)
    .fill(
        stat.totalPushUps == 0
            ? Color.secondary.opacity(0.1)
            : LinearGradient(
                colors: [barColor(for: stat.totalPushUps, max: maxValue),
                         barColor(for: stat.totalPushUps, max: maxValue).opacity(0.5)],
                startPoint: .top,
                endPoint: .bottom
            )
    )
    .frame(height: max(CGFloat(stat.totalPushUps) / CGFloat(maxValue) * 160, stat.totalPushUps > 0 ? 4 : 2))
```

Увеличить высоту чарта: `.frame(height: 200)` вместо `160`.

### Step 2: Улучшить SummaryCard

```swift
// БЫЛО:
.background(color.opacity(0.08))
.cornerRadius(12)

// СТАЛО:
.background(color.opacity(0.08))
.cornerRadius(12)
.overlay(
    RoundedRectangle(cornerRadius: 12)
        .stroke(color.opacity(0.15), lineWidth: 1)
)
.shadow(color: color.opacity(0.1), radius: 6, y: 3)
```

### Step 3: Собрать

`Cmd+B`. Проверить визуально.

### Step 4: Коммит

```bash
git add app/PushUpTracker/Views/StatsView.swift
git commit -m "design: improve StatsView chart and summary cards"
```

---

## Task 7: Финальный осмотр

### Step 1: Запустить приложение

`Cmd+R`. Пройти все вкладки:
- Тренировка: видна камера, кнопка "Начать", анимация счётчика работает
- Статистика: карточки с тенями, градиентные бары
- Лидерборд: подиум с градиентами, одна строка на игрока
- Настройки: статус сервера, напоминания

### Step 2: Итоговый коммит

```bash
git add -A
git commit -m "refactor: complete variant A refactoring (Observable + dedup + design)"
```
