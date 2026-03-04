import Foundation
import Combine

/// Менеджер статистики — хранит локально + синхронизирует с сервером
class StatsManager: ObservableObject {
    
    @Published var sessions: [PushUpSession] = []
    @Published var dailyStats: [DailyStats] = []
    @Published var players: [Player] = []
    @Published var currentPlayer: Player?
    
    // Серверные данные
    @Published var serverPlayers: [ServerPlayer] = []
    @Published var serverConnected = false
    @Published var syncStatus: String = ""
    @Published var currentPlayerId: String? // ID игрока на сервере
    
    private let sessionsKey = "pushup_sessions"
    private let dailyStatsKey = "pushup_daily_stats"
    private let playersKey = "pushup_players"
    private let currentPlayerKey = "pushup_current_player"
    private let serverPlayerIdKey = "pushup_server_player_id"
    
    let api = APIClient.shared
    
    init() {
        loadAll()
        currentPlayerId = UserDefaults.standard.string(forKey: serverPlayerIdKey)
        Task { await checkServerAndSync() }
    }
    
    // MARK: - Серверная синхронизация
    
    func checkServerAndSync() async {
        await api.checkConnection()
        DispatchQueue.main.async {
            self.serverConnected = self.api.isConnected
        }
        if api.isConnected {
            await fetchLeaderboard()
        }
    }
    
    func registerOnServer(name: String) async {
        do {
            let player = try await api.registerPlayer(name: name)
            DispatchQueue.main.async {
                self.currentPlayerId = player.id
                UserDefaults.standard.set(player.id, forKey: self.serverPlayerIdKey)
                self.syncStatus = "✅ Зарегистрирован: \(player.name)"
            }
        } catch {
            DispatchQueue.main.async {
                self.syncStatus = "❌ Ошибка регистрации: \(error.localizedDescription)"
            }
        }
    }
    
    func submitSessionToServer(count: Int, duration: TimeInterval) async {
        guard let playerId = currentPlayerId else {
            DispatchQueue.main.async { self.syncStatus = "⚠️ Сначала зарегистрируйтесь" }
            return
        }
        do {
            let _ = try await api.submitSession(playerId: playerId, count: count, duration: duration)
            DispatchQueue.main.async { self.syncStatus = "✅ Отправлено на сервер" }
            await fetchLeaderboard()
        } catch {
            DispatchQueue.main.async {
                self.syncStatus = "❌ Ошибка отправки: \(error.localizedDescription)"
            }
        }
    }
    
    func fetchLeaderboard() async {
        do {
            let players = try await api.getLeaderboard()
            DispatchQueue.main.async { self.serverPlayers = players }
        } catch {
            DispatchQueue.main.async {
                self.syncStatus = "❌ Ошибка загрузки лидерборда"
            }
        }
    }
    
    // MARK: - Запись сессии (локально + сервер)
    
    func recordSession(playerName: String, count: Int, duration: TimeInterval) {
        guard count > 0 else { return }
        
        let session = PushUpSession(playerName: playerName, count: count, duration: duration)
        sessions.append(session)
        updateDailyStats(session: session)
        updatePlayer(name: playerName, session: session)
        saveAll()
        
        // Отправляем на сервер в фоне
        Task {
            if currentPlayerId == nil {
                await registerOnServer(name: playerName)
            }
            await submitSessionToServer(count: count, duration: duration)
        }
    }
    
    // MARK: - Дневная статистика
    
    private func updateDailyStats(session: PushUpSession) {
        let key = DailyStats.key(for: session.date)
        if let index = dailyStats.firstIndex(where: { $0.dateKey == key }) {
            dailyStats[index].totalPushUps += session.count
            dailyStats[index].sessionsCount += 1
            dailyStats[index].totalDuration += session.duration
            dailyStats[index].bestSession = max(dailyStats[index].bestSession, session.count)
        } else {
            let stats = DailyStats(dateKey: key, totalPushUps: session.count, sessionsCount: 1, totalDuration: session.duration, bestSession: session.count)
            dailyStats.append(stats)
        }
        dailyStats.sort { $0.dateKey > $1.dateKey }
    }
    
    // MARK: - Локальный лидерборд
    
    private func updatePlayer(name: String, session: PushUpSession) {
        if let index = players.firstIndex(where: { $0.name.lowercased() == name.lowercased() }) {
            players[index].totalPushUps += session.count
            players[index].sessionsCount += 1
            players[index].bestSession = max(players[index].bestSession, session.count)
            let calendar = Calendar.current
            let lastDate = calendar.startOfDay(for: players[index].lastActiveDate)
            let today = calendar.startOfDay(for: Date())
            let daysDiff = calendar.dateComponents([.day], from: lastDate, to: today).day ?? 0
            if daysDiff == 1 { players[index].streak += 1 }
            else if daysDiff > 1 { players[index].streak = 1 }
            players[index].lastActiveDate = Date()
        } else {
            var player = Player(name: name)
            player.totalPushUps = session.count
            player.bestSession = session.count
            player.sessionsCount = 1
            player.streak = 1
            players.append(player)
        }
        players.sort { $0.totalPushUps > $1.totalPushUps }
    }
    
    func addPlayer(name: String) {
        guard !name.isEmpty else { return }
        guard !players.contains(where: { $0.name.lowercased() == name.lowercased() }) else { return }
        players.append(Player(name: name))
        saveAll()
    }
    
    func removePlayer(id: UUID) {
        players.removeAll { $0.id == id }
        saveAll()
    }
    
    func setCurrentPlayer(_ player: Player) {
        currentPlayer = player
        if let encoded = try? JSONEncoder().encode(player) {
            UserDefaults.standard.set(encoded, forKey: currentPlayerKey)
        }
    }
    
    // MARK: - Агрегированные данные
    
    var todayTotal: Int {
        let key = DailyStats.key(for: Date())
        return dailyStats.first(where: { $0.dateKey == key })?.totalPushUps ?? 0
    }
    
    var weekTotal: Int {
        let calendar = Calendar.current
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        let weekKey = DailyStats.key(for: weekAgo)
        return dailyStats.filter { $0.dateKey >= weekKey }.reduce(0) { $0 + $1.totalPushUps }
    }
    
    var allTimeTotal: Int {
        dailyStats.reduce(0) { $0 + $1.totalPushUps }
    }
    
    func statsForLastDays(_ n: Int) -> [DailyStats] {
        let calendar = Calendar.current
        var result: [DailyStats] = []
        for i in (0..<n).reversed() {
            guard let date = calendar.date(byAdding: .day, value: -i, to: Date()) else { continue }
            let key = DailyStats.key(for: date)
            if let stats = dailyStats.first(where: { $0.dateKey == key }) {
                result.append(stats)
            } else {
                result.append(DailyStats(dateKey: key, totalPushUps: 0, sessionsCount: 0, totalDuration: 0, bestSession: 0))
            }
        }
        return result
    }
    
    // MARK: - Persistence
    
    private func saveAll() {
        save(sessions, forKey: sessionsKey)
        save(dailyStats, forKey: dailyStatsKey)
        save(players, forKey: playersKey)
    }
    
    private func loadAll() {
        sessions = load(forKey: sessionsKey) ?? []
        dailyStats = load(forKey: dailyStatsKey) ?? []
        players = load(forKey: playersKey) ?? []
        if let data = UserDefaults.standard.data(forKey: currentPlayerKey),
           let player = try? JSONDecoder().decode(Player.self, from: data) {
            currentPlayer = player
        }
    }
    
    private func save<T: Codable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) { UserDefaults.standard.set(data, forKey: key) }
    }
    
    private func load<T: Codable>(forKey key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
    
    func resetAll() {
        sessions = []; dailyStats = []; players = []; currentPlayer = nil
        currentPlayerId = nil; serverPlayers = []
        for key in [sessionsKey, dailyStatsKey, playersKey, currentPlayerKey, serverPlayerIdKey] {
            UserDefaults.standard.removeObject(forKey: key)
        }
    }
}
