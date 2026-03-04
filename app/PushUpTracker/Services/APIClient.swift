import Foundation
import Observation

/// API-клиент для синхронизации с сервером
@Observable
@MainActor
class APIClient {

    static let shared = APIClient()

    var isConnected = false
    var lastError: String?

    private nonisolated var baseURL: String {
        if let saved = UserDefaults.standard.string(forKey: "api_base_url"), !saved.isEmpty {
            return saved
        }
        return "http://localhost:3000"
    }

    func setBaseURL(_ url: String) {
        UserDefaults.standard.set(url, forKey: "api_base_url")
    }

    // MARK: - Players

    /// Регистрация / получение игрока по имени
    func registerPlayer(name: String) async throws -> ServerPlayer {
        let body = ["name": name]
        let data = try await post("/api/players", body: body)
        return try JSONDecoder().decode(ServerPlayer.self, from: data)
    }

    /// Получить лидерборд
    func getLeaderboard() async throws -> [ServerPlayer] {
        let data = try await get("/api/leaderboard")
        return try JSONDecoder().decode([ServerPlayer].self, from: data)
    }

    // MARK: - Sessions

    /// Отправить результат сессии
    func submitSession(playerId: String, count: Int, duration: Double) async throws -> ServerSession {
        let body: [String: Any] = [
            "player_id": playerId,
            "count": count,
            "duration": duration,
            "date": todayDateString()
        ]
        let data = try await post("/api/sessions", body: body)
        return try JSONDecoder().decode(ServerSession.self, from: data)
    }

    /// Получить историю сессий игрока
    func getSessions(playerId: String, limit: Int = 50) async throws -> [ServerSession] {
        let data = try await get("/api/sessions/\(playerId)?limit=\(limit)")
        return try JSONDecoder().decode([ServerSession].self, from: data)
    }

    // MARK: - Stats

    /// Статистика команды
    func getTeamStats(days: Int = 7) async throws -> TeamStats {
        let data = try await get("/api/stats/team?days=\(days)")
        return try JSONDecoder().decode(TeamStats.self, from: data)
    }

    /// Статистика игрока
    func getPlayerStats(playerId: String, days: Int = 30) async throws -> PlayerStats {
        let data = try await get("/api/stats/\(playerId)?days=\(days)")
        return try JSONDecoder().decode(PlayerStats.self, from: data)
    }

    // MARK: - Health Check

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

    // MARK: - HTTP Helpers

    private nonisolated func get(_ path: String) async throws -> Data {
        let url = URL(string: baseURL + path)!
        var request = URLRequest(url: url)
        request.timeoutInterval = 10

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            let http = response as? HTTPURLResponse
            throw APIError.serverError(http?.statusCode ?? 0)
        }

        return data
    }

    private nonisolated func post(_ path: String, body: [String: Any]) async throws -> Data {
        let url = URL(string: baseURL + path)!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            let http = response as? HTTPURLResponse
            throw APIError.serverError(http?.statusCode ?? 0)
        }

        return data
    }

    private nonisolated func todayDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }
}

// MARK: - Ошибки

enum APIError: LocalizedError {
    case serverError(Int)

    var errorDescription: String? {
        switch self {
        case .serverError(let code): return "Ошибка сервера: \(code)"
        }
    }
}

// MARK: - Серверные модели

struct ServerPlayer: Codable, Identifiable {
    let id: String
    let name: String
    var total_pushups: Int?
    var best_session: Int?
    var sessions_count: Int?
    var average_per_session: Double?
    var streak: Int?
    var last_active_date: String?
    var created: Bool?
}

struct ServerSession: Codable, Identifiable {
    let id: String
    let player_id: String
    let count: Int
    let duration: Double
    let date: String
}

struct TeamStats: Codable {
    let today: Int
    let period: PeriodStats
    let daily: [DailyServerStats]
}

struct PeriodStats: Codable {
    let days: Int
    let total_pushups: Int
    let active_players: Int
    let total_sessions: Int
}

struct DailyServerStats: Codable {
    let date: String
    let total_pushups: Int
    let sessions_count: Int
    let total_duration: Double
    let best_session: Int
}

struct PlayerStats: Codable {
    let player: String
    let streak: Int
    let daily: [DailyServerStats]
}
