import SwiftUI

struct LeaderboardView: View {
    @Environment(StatsManager.self) var statsManager
    @State private var sortBy: SortOption = .total
    @State private var showAddPlayer = false
    @State private var newPlayerName = ""
    @State private var showServerBoard = true

    enum SortOption: String, CaseIterable {
        case total   = "Всего"
        case best    = "Рекорд"
        case streak  = "Стрик"
        case average = "Среднее"
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            filterBar
            statusBar
            Divider()

            if showServerBoard && statsManager.serverConnected {
                leaderboardContent(entries: sorted(statsManager.serverPlayers),
                                   currentId: statsManager.currentPlayerId)
            } else {
                leaderboardContent(entries: sorted(statsManager.players),
                                   currentId: statsManager.currentPlayer?.uuid.uuidString)
                    .sheet(isPresented: $showAddPlayer) { addPlayerSheet }
            }
        }
    }

    // MARK: - Header

    var header: some View {
        HStack(alignment: .center) {
            HStack(spacing: 8) {
                Image(systemName: "trophy.fill")
                    .foregroundStyle(.yellow)
                    .font(.system(size: 15, weight: .semibold))
                Text("Лидерборд")
                    .font(.system(size: 17, weight: .semibold))
            }
            Spacer()
            Button {
                Task { await statsManager.fetchLeaderboard() }
            } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .help("Обновить")
        }
        .padding(.horizontal, 20)
        .padding(.top, 14)
        .padding(.bottom, 10)
    }

    // MARK: - Filter bar (кастомные pills вместо Picker)

    var filterBar: some View {
        HStack(spacing: 10) {
            if statsManager.serverConnected {
                FilterPills(
                    options: ["Команда", "Локально"],
                    selected: showServerBoard ? 0 : 1
                ) { i in showServerBoard = i == 0 }
            }

            FilterPills(
                options: SortOption.allCases.map(\.rawValue),
                selected: SortOption.allCases.firstIndex(of: sortBy) ?? 0
            ) { i in sortBy = SortOption.allCases[i] }

            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Status bar

    var statusBar: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(statsManager.serverConnected ? Color.green : Color.secondary.opacity(0.5))
                .frame(width: 6, height: 6)
            Text(statsManager.serverConnected ? "Сервер подключён" : "Локальные данные")
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
            if !statsManager.syncStatus.isEmpty && statsManager.serverConnected {
                Text("·")
                    .foregroundStyle(.secondary.opacity(0.5))
                    .font(.system(size: 11))
                Text(statsManager.syncStatus)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Content

    @ViewBuilder
    func leaderboardContent(entries: [any LeaderboardEntry], currentId: String?) -> some View {
        if entries.isEmpty {
            Spacer()
            VStack(spacing: 10) {
                Image(systemName: "person.3")
                    .font(.system(size: 36))
                    .foregroundStyle(.tertiary)
                Text("Пока никого нет")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.secondary)
                Text("Завершите первую тренировку!")
                    .font(.system(size: 12))
                    .foregroundStyle(.tertiary)
            }
            Spacer()
        } else {
            ScrollView {
                LazyVStack(spacing: 0, pinnedViews: []) {
                    // Подиум
                    if entries.count >= 3 {
                        podiumView(entries)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 20)

                        Divider()
                            .padding(.horizontal, 20)
                    }

                    // Полная таблица
                    ForEach(Array(entries.enumerated()), id: \.element.id) { index, player in
                        LeaderboardRow(
                            rank: index + 1,
                            player: player,
                            isCurrentPlayer: player.id == currentId,
                            sortBy: sortBy
                        )
                        if index < entries.count - 1 {
                            Divider()
                                .padding(.leading, 60)
                        }
                    }
                }
                .padding(.bottom, 16)
            }
        }
    }

    // MARK: - Podium

    func podiumView(_ entries: [any LeaderboardEntry]) -> some View {
        HStack(alignment: .bottom, spacing: 12) {
            if entries.count > 1 {
                podiumPlace(player: entries[1], rank: 2, height: 64)
            }
            podiumPlace(player: entries[0], rank: 1, height: 90)
            if entries.count > 2 {
                podiumPlace(player: entries[2], rank: 3, height: 48)
            }
        }
        .frame(maxWidth: .infinity)
    }

    func podiumPlace(player: any LeaderboardEntry, rank: Int, height: CGFloat) -> some View {
        let accent: Color = rank == 1 ? .yellow : rank == 2 ? Color(.systemGray) : .orange
        return VStack(spacing: 5) {
            Text(medalEmoji(rank))
                .font(.system(size: 22))
            Text(player.name)
                .font(.system(size: 12, weight: .semibold))
                .lineLimit(1)
                .foregroundStyle(.primary)
            Text("\(player.totalPushUps)")
                .font(.system(size: 15, weight: .bold).monospacedDigit())
                .foregroundStyle(.primary)
            RoundedRectangle(cornerRadius: 8)
                .fill(LinearGradient(
                    colors: [accent.opacity(0.5), accent.opacity(0.1)],
                    startPoint: .top, endPoint: .bottom
                ))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(accent.opacity(0.3), lineWidth: 1)
                )
                .frame(width: 70, height: height)
                .overlay(
                    Text("#\(rank)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.secondary)
                )
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Helpers

    func sorted(_ entries: [any LeaderboardEntry]) -> [any LeaderboardEntry] {
        switch sortBy {
        case .total:   return entries.sorted { $0.totalPushUps > $1.totalPushUps }
        case .best:    return entries.sorted { $0.bestSession > $1.bestSession }
        case .streak:  return entries.sorted { $0.streak > $1.streak }
        case .average: return entries.sorted { $0.averagePerSession > $1.averagePerSession }
        }
    }

    private func medalEmoji(_ rank: Int) -> String {
        switch rank { case 1: return "🥇"; case 2: return "🥈"; case 3: return "🥉"; default: return "" }
    }

    // MARK: - Add player sheet

    var addPlayerSheet: some View {
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

    private func addPlayer() {
        let name = newPlayerName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        statsManager.addPlayer(name: name)
        newPlayerName = ""
        showAddPlayer = false
    }
}

// MARK: - Filter Pills

struct FilterPills: View {
    let options: [String]
    let selected: Int
    let onSelect: (Int) -> Void

    var body: some View {
        HStack(spacing: 1) {
            ForEach(options.indices, id: \.self) { i in
                Button { onSelect(i) } label: {
                    Text(options[i])
                        .font(.system(size: 12, weight: .medium))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 5)
                                .fill(i == selected
                                      ? Color.primary.opacity(0.1)
                                      : Color.clear)
                        )
                        .foregroundStyle(i == selected ? AnyShapeStyle(.primary) : AnyShapeStyle(.secondary))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(3)
        .background(
            RoundedRectangle(cornerRadius: 7)
                .fill(Color.primary.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 7)
                        .stroke(Color.primary.opacity(0.08), lineWidth: 1)
                )
        )
    }
}

// MARK: - Leaderboard Row

struct LeaderboardRow: View {
    let rank: Int
    let player: any LeaderboardEntry
    let isCurrentPlayer: Bool
    let sortBy: LeaderboardView.SortOption

    var rankColor: Color {
        switch rank {
        case 1: return .yellow
        case 2: return Color(.systemGray)
        case 3: return .orange
        default: return .secondary
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            // Rank
            Text(rank <= 3 ? medalEmoji(rank) : "\(rank)")
                .font(rank <= 3
                      ? .system(size: 18)
                      : .system(size: 14, weight: .semibold).monospacedDigit())
                .foregroundStyle(rank <= 3 ? AnyShapeStyle(.primary) : AnyShapeStyle(.tertiary))
                .frame(width: 28, alignment: .center)

            // Name + streak
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(player.name)
                        .font(.system(size: 14, weight: .semibold))
                    if isCurrentPlayer {
                        Text("ты")
                            .font(.system(size: 10, weight: .medium))
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1)
                            .background(Color.accentColor.opacity(0.15))
                            .foregroundStyle(Color.accentColor)
                            .clipShape(Capsule())
                    }
                }
                if player.streak > 0 {
                    HStack(spacing: 3) {
                        Image(systemName: "flame.fill")
                            .font(.system(size: 9))
                            .foregroundStyle(.orange)
                        Text("\(player.streak) дн. подряд")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()

            // Stats
            VStack(alignment: .trailing, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 3) {
                    Text(mainValue)
                        .font(.system(size: 16, weight: .bold).monospacedDigit())
                    Text(mainLabel)
                        .font(.system(size: 11))
                        .foregroundStyle(.tertiary)
                }
                Text("\(player.sessionsCount) трен.")
                    .font(.system(size: 11))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(isCurrentPlayer ? Color.accentColor.opacity(0.04) : Color.clear)
    }

    var mainValue: String {
        switch sortBy {
        case .total:   return "\(player.totalPushUps)"
        case .best:    return "\(player.bestSession)"
        case .streak:  return "\(player.streak)"
        case .average: return String(format: "%.1f", player.averagePerSession)
        }
    }

    var mainLabel: String {
        switch sortBy {
        case .total:   return "всего"
        case .best:    return "макс"
        case .streak:  return "дн."
        case .average: return "ср."
        }
    }

    private func medalEmoji(_ rank: Int) -> String {
        switch rank { case 1: return "🥇"; case 2: return "🥈"; case 3: return "🥉"; default: return "" }
    }
}
