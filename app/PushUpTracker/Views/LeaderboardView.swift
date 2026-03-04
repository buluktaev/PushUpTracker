import SwiftUI

struct LeaderboardView: View {
    @Environment(StatsManager.self) var statsManager
    @State private var sortBy: SortOption = .total
    @State private var showAddPlayer = false
    @State private var newPlayerName = ""
    @State private var showServerBoard = true
    
    enum SortOption: String, CaseIterable {
        case total = "Всего"
        case best = "Рекорд"
        case streak = "Стрик"
        case average = "Среднее"
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Заголовок
            HStack {
                Text("🏆 Лидерборд")
                    .font(.title2.bold())
                
                Spacer()
                
                // Переключатель локальный/серверный
                if statsManager.serverConnected {
                    Picker("Источник", selection: $showServerBoard) {
                        Text("Команда").tag(true)
                        Text("Локально").tag(false)
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 180)
                }
                
                Picker("Сортировка", selection: $sortBy) {
                    ForEach(SortOption.allCases, id: \.self) { option in
                        Text(option.rawValue).tag(option)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 280)
                
                Button(action: {
                    Task { await statsManager.fetchLeaderboard() }
                }) {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.bordered)
                .help("Обновить")
            }
            .padding()
            
            // Статус подключения
            if statsManager.serverConnected {
                HStack(spacing: 4) {
                    Circle().fill(.green).frame(width: 8, height: 8)
                    Text("Сервер подключён")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    if !statsManager.syncStatus.isEmpty {
                        Text("• \(statsManager.syncStatus)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal)
            } else {
                HStack(spacing: 4) {
                    Circle().fill(.red).frame(width: 8, height: 8)
                    Text("Сервер недоступен — показаны локальные данные")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
            }
            
            Divider().padding(.top, 8)
            
            if showServerBoard && statsManager.serverConnected {
                serverLeaderboard
            } else {
                localLeaderboard
            }
        }
    }
    
    // MARK: - Серверный лидерборд
    
    var serverLeaderboard: some View {
        let sorted = sortServerPlayers(statsManager.serverPlayers)
        
        return Group {
            if sorted.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("Пока никого нет")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text("Завершите первую тренировку!")
                        .font(.callout)
                        .foregroundColor(.secondary)
                }
                Spacer()
            } else {
                // Подиум
                if sorted.count >= 3 {
                    serverPodiumView(sorted)
                        .padding(.vertical, 16)
                }
                
                Divider()
                
                // Полная таблица
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(Array(sorted.enumerated()), id: \.element.id) { index, player in
                            ServerLeaderboardRow(
                                rank: index + 1,
                                player: player,
                                isCurrentPlayer: player.id == statsManager.currentPlayerId,
                                sortBy: sortBy
                            )
                            if index < sorted.count - 1 {
                                Divider().padding(.horizontal)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
    }
    
    func serverPodiumView(_ players: [ServerPlayer]) -> some View {
        HStack(alignment: .bottom, spacing: 20) {
            if players.count > 1 {
                serverPodiumPlace(player: players[1], rank: 2, height: 70, color: .gray)
            }
            serverPodiumPlace(player: players[0], rank: 1, height: 100, color: .yellow)
            if players.count > 2 {
                serverPodiumPlace(player: players[2], rank: 3, height: 50, color: .orange)
            }
        }
    }
    
    func serverPodiumPlace(player: ServerPlayer, rank: Int, height: CGFloat, color: Color) -> some View {
        VStack(spacing: 6) {
            Text(medalEmoji(rank)).font(.system(size: 28))
            Text(player.name).font(.callout.bold()).lineLimit(1)
            Text("\(player.total_pushups ?? 0)").font(.title3.bold().monospacedDigit())
            RoundedRectangle(cornerRadius: 8)
                .fill(color.opacity(0.3))
                .frame(width: 80, height: height)
                .overlay(Text("#\(rank)").font(.caption.bold()).foregroundColor(.secondary))
        }
        .frame(width: 100)
    }
    
    func sortServerPlayers(_ players: [ServerPlayer]) -> [ServerPlayer] {
        switch sortBy {
        case .total: return players.sorted { ($0.total_pushups ?? 0) > ($1.total_pushups ?? 0) }
        case .best: return players.sorted { ($0.best_session ?? 0) > ($1.best_session ?? 0) }
        case .streak: return players.sorted { ($0.streak ?? 0) > ($1.streak ?? 0) }
        case .average: return players.sorted { ($0.average_per_session ?? 0) > ($1.average_per_session ?? 0) }
        }
    }
    
    // MARK: - Локальный лидерборд (тот же что был)
    
    var sortedPlayers: [Player] {
        switch sortBy {
        case .total: return statsManager.players.sorted { $0.totalPushUps > $1.totalPushUps }
        case .best: return statsManager.players.sorted { $0.bestSession > $1.bestSession }
        case .streak: return statsManager.players.sorted { $0.streak > $1.streak }
        case .average: return statsManager.players.sorted { $0.averagePerSession > $1.averagePerSession }
        }
    }
    
    var localLeaderboard: some View {
        Group {
            if statsManager.players.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("Пока никого нет")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Button("Добавить игрока") { showAddPlayer.toggle() }
                        .buttonStyle(.borderedProminent)
                }
                Spacer()
            } else {
                if sortedPlayers.count >= 3 {
                    localPodiumView.padding(.vertical, 16)
                }
                Divider()
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(Array(sortedPlayers.enumerated()), id: \.element.id) { index, player in
                            LeaderboardRow(
                                rank: index + 1,
                                player: player,
                                isCurrentPlayer: player.id == statsManager.currentPlayer?.id,
                                sortBy: sortBy
                            )
                            if index < sortedPlayers.count - 1 {
                                Divider().padding(.horizontal)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .sheet(isPresented: $showAddPlayer) {
            VStack(spacing: 16) {
                Text("Добавить игрока").font(.headline)
                TextField("Имя", text: $newPlayerName)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 250)
                    .onSubmit { addPlayer() }
                HStack(spacing: 12) {
                    Button("Отмена") { showAddPlayer = false }.buttonStyle(.bordered)
                    Button("Добавить") { addPlayer() }
                        .buttonStyle(.borderedProminent)
                        .disabled(newPlayerName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .padding(24)
        }
    }
    
    var localPodiumView: some View {
        HStack(alignment: .bottom, spacing: 20) {
            if sortedPlayers.count > 1 {
                podiumPlace(player: sortedPlayers[1], rank: 2, height: 70, color: .gray)
            }
            podiumPlace(player: sortedPlayers[0], rank: 1, height: 100, color: .yellow)
            if sortedPlayers.count > 2 {
                podiumPlace(player: sortedPlayers[2], rank: 3, height: 50, color: .orange)
            }
        }
    }
    
    func podiumPlace(player: Player, rank: Int, height: CGFloat, color: Color) -> some View {
        VStack(spacing: 6) {
            Text(medalEmoji(rank)).font(.system(size: 28))
            Text(player.name).font(.callout.bold()).lineLimit(1)
            Text("\(player.totalPushUps)").font(.title3.bold().monospacedDigit())
            RoundedRectangle(cornerRadius: 8)
                .fill(color.opacity(0.3))
                .frame(width: 80, height: height)
                .overlay(Text("#\(rank)").font(.caption.bold()).foregroundColor(.secondary))
        }
        .frame(width: 100)
    }
    
    private func addPlayer() {
        let name = newPlayerName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        statsManager.addPlayer(name: name)
        newPlayerName = ""
        showAddPlayer = false
    }
    
    private func medalEmoji(_ rank: Int) -> String {
        switch rank { case 1: return "🥇"; case 2: return "🥈"; case 3: return "🥉"; default: return "" }
    }
}

// MARK: - Серверная строка

struct ServerLeaderboardRow: View {
    let rank: Int
    let player: ServerPlayer
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
                if let streak = player.streak, streak > 0 {
                    Text("🔥 \(streak) дн. подряд").font(.caption).foregroundColor(.orange)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                HStack(spacing: 4) {
                    Text(mainValue).font(.title3.bold().monospacedDigit())
                    Text(mainLabel).font(.caption).foregroundColor(.secondary)
                }
                Text("\(player.sessions_count ?? 0) тренировок").font(.caption).foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 8)
        .background(isCurrentPlayer ? Color.accentColor.opacity(0.05) : Color.clear)
        .cornerRadius(8)
    }
    
    var mainValue: String {
        switch sortBy {
        case .total: return "\(player.total_pushups ?? 0)"
        case .best: return "\(player.best_session ?? 0)"
        case .streak: return "\(player.streak ?? 0)"
        case .average: return String(format: "%.1f", player.average_per_session ?? 0)
        }
    }
    
    var mainLabel: String {
        switch sortBy {
        case .total: return "всего"; case .best: return "макс"
        case .streak: return "дней"; case .average: return "сред"
        }
    }
}

// MARK: - Локальная строка

struct LeaderboardRow: View {
    let rank: Int
    let player: Player
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
                    if isCurrentPlayer { Text("(ты)").font(.caption).foregroundColor(.accentColor) }
                }
                if player.streak > 0 {
                    Text("🔥 \(player.streak) дн. подряд").font(.caption).foregroundColor(.orange)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                HStack(spacing: 4) {
                    Text(mainValue).font(.title3.bold().monospacedDigit())
                    Text(mainLabel).font(.caption).foregroundColor(.secondary)
                }
                Text("\(player.sessionsCount) тренировок").font(.caption).foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10).padding(.horizontal, 8)
        .background(isCurrentPlayer ? Color.accentColor.opacity(0.05) : Color.clear)
        .cornerRadius(8)
    }
    
    var mainValue: String {
        switch sortBy {
        case .total: return "\(player.totalPushUps)"; case .best: return "\(player.bestSession)"
        case .streak: return "\(player.streak)"; case .average: return String(format: "%.1f", player.averagePerSession)
        }
    }
    var mainLabel: String {
        switch sortBy {
        case .total: return "всего"; case .best: return "макс"
        case .streak: return "дней"; case .average: return "сред"
        }
    }
}
