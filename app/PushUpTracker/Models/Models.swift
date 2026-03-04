import Foundation

// MARK: - Сессия отжиманий

struct PushUpSession: Codable, Identifiable {
    let id: UUID
    let playerName: String
    let count: Int
    let duration: TimeInterval // секунды
    let date: Date
    
    init(playerName: String, count: Int, duration: TimeInterval, date: Date = Date()) {
        self.id = UUID()
        self.playerName = playerName
        self.count = count
        self.duration = duration
        self.date = date
    }
    
    var formattedDuration: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    var pushUpsPerMinute: Double {
        guard duration > 0 else { return 0 }
        return Double(count) / (duration / 60.0)
    }
}

// MARK: - Дневная статистика

struct DailyStats: Codable, Identifiable {
    var id: String { dateKey }
    let dateKey: String // "yyyy-MM-dd"
    var totalPushUps: Int
    var sessionsCount: Int
    var totalDuration: TimeInterval
    var bestSession: Int // максимум за одну сессию
    
    static func key(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
    
    var displayDate: Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: dateKey) ?? Date()
    }
}

// MARK: - Игрок лидерборда

struct Player: Codable, Identifiable, Hashable {
    let id: UUID
    var name: String
    var totalPushUps: Int
    var bestSession: Int
    var sessionsCount: Int
    var streak: Int // дней подряд
    var lastActiveDate: Date
    
    init(name: String) {
        self.id = UUID()
        self.name = name
        self.totalPushUps = 0
        self.bestSession = 0
        self.sessionsCount = 0
        self.streak = 0
        self.lastActiveDate = Date()
    }
    
    var averagePerSession: Double {
        guard sessionsCount > 0 else { return 0 }
        return Double(totalPushUps) / Double(sessionsCount)
    }
}

// MARK: - Состояние детектора

enum PushUpPhase {
    case idle       // Начальное состояние
    case down       // Нижняя позиция (руки согнуты)
    case up         // Верхняя позиция (руки выпрямлены)
}

enum DetectionStatus: Equatable {
    case notDetected
    case detected
    case tracking
    case lowConfidence
    
    var description: String {
        switch self {
        case .notDetected: return "Человек не обнаружен"
        case .detected: return "Обнаружен! Примите позицию"
        case .tracking: return "Отслеживание отжиманий..."
        case .lowConfidence: return "Плохая видимость. Подвиньтесь"
        }
    }
    
    var color: String {
        switch self {
        case .notDetected: return "red"
        case .detected: return "yellow"
        case .tracking: return "green"
        case .lowConfidence: return "orange"
        }
    }
}

// MARK: - Настройки напоминаний

struct ReminderSettings: Codable {
    var isEnabled: Bool
    var intervalMinutes: Int
    var startHour: Int
    var endHour: Int
    var workDaysOnly: Bool
    var targetDaily: Int
    
    static var `default`: ReminderSettings {
        ReminderSettings(
            isEnabled: false,
            intervalMinutes: 60,
            startHour: 9,
            endHour: 18,
            workDaysOnly: true,
            targetDaily: 50
        )
    }
}
