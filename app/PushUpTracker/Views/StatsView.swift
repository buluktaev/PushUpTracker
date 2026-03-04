import SwiftUI

struct StatsView: View {
    @Environment(StatsManager.self) var statsManager
    @State private var selectedPeriod = 0  // 0: неделя, 1: месяц, 2: всё время
    
    private let periodLabels = ["7 дней", "30 дней", "Всё время"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Сводка
                summaryCards
                
                // Переключатель периода
                Picker("Период", selection: $selectedPeriod) {
                    ForEach(0..<periodLabels.count, id: \.self) { i in
                        Text(periodLabels[i]).tag(i)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                
                // График
                chartSection
                
                // Дневная таблица
                dailyTable
            }
            .padding()
        }
    }
    
    // MARK: - Сводка
    
    var summaryCards: some View {
        HStack(spacing: 12) {
            SummaryCard(
                title: "Сегодня",
                value: "\(statsManager.todayTotal)",
                subtitle: "отжиманий",
                icon: "flame.fill",
                color: .orange
            )
            SummaryCard(
                title: "Неделя",
                value: "\(statsManager.weekTotal)",
                subtitle: "отжиманий",
                icon: "calendar",
                color: .blue
            )
            SummaryCard(
                title: "Всего",
                value: "\(statsManager.allTimeTotal)",
                subtitle: "отжиманий",
                icon: "star.fill",
                color: .purple
            )
            
            let bestEver = statsManager.dailyStats.map(\.bestSession).max() ?? 0
            SummaryCard(
                title: "Рекорд",
                value: "\(bestEver)",
                subtitle: "за сессию",
                icon: "trophy.fill",
                color: .yellow
            )
        }
    }
    
    // MARK: - График
    
    var chartSection: some View {
        let days = selectedPeriod == 0 ? 7 : (selectedPeriod == 1 ? 30 : min(statsManager.dailyStats.count, 90))
        let data = statsManager.statsForLastDays(max(days, 1))
        let maxValue = max(data.map(\.totalPushUps).max() ?? 1, 1)
        
        return VStack(alignment: .leading, spacing: 8) {
            Text("Отжимания по дням")
                .font(.headline)
            
            if data.isEmpty || data.allSatisfy({ $0.totalPushUps == 0 }) {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        Image(systemName: "chart.bar")
                            .font(.system(size: 32))
                            .foregroundColor(.secondary)
                        Text("Пока нет данных")
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 40)
                    Spacer()
                }
            } else {
                // Простой столбиковый график
                HStack(alignment: .bottom, spacing: 2) {
                    ForEach(data) { stat in
                        VStack(spacing: 2) {
                            if stat.totalPushUps > 0 {
                                Text("\(stat.totalPushUps)")
                                    .font(.system(size: 8))
                                    .foregroundColor(.secondary)
                            }
                            
                            RoundedRectangle(cornerRadius: 3)
                                .fill(barColor(for: stat.totalPushUps, max: maxValue))
                                .frame(height: max(CGFloat(stat.totalPushUps) / CGFloat(maxValue) * 120, stat.totalPushUps > 0 ? 4 : 1))
                            
                            Text(shortDate(stat.dateKey))
                                .font(.system(size: 7))
                                .foregroundColor(.secondary)
                                .rotationEffect(.degrees(-45))
                                .frame(height: 16)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 160)
                .padding(.vertical, 8)
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Таблица по дням
    
    var dailyTable: some View {
        let days = selectedPeriod == 0 ? 7 : (selectedPeriod == 1 ? 30 : 365)
        let data = statsManager.statsForLastDays(days).filter { $0.totalPushUps > 0 }.reversed()
        
        return VStack(alignment: .leading, spacing: 8) {
            Text("Детализация")
                .font(.headline)
            
            if data.isEmpty {
                Text("Ещё нет завершённых тренировок")
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                // Заголовок
                HStack {
                    Text("Дата").frame(maxWidth: .infinity, alignment: .leading)
                    Text("Всего").frame(width: 60, alignment: .trailing)
                    Text("Сессий").frame(width: 60, alignment: .trailing)
                    Text("Лучшая").frame(width: 60, alignment: .trailing)
                    Text("Время").frame(width: 70, alignment: .trailing)
                }
                .font(.caption.bold())
                .foregroundColor(.secondary)
                .padding(.horizontal, 8)
                
                Divider()
                
                ForEach(Array(data)) { stat in
                    HStack {
                        Text(displayDate(stat.dateKey))
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Text("\(stat.totalPushUps)")
                            .frame(width: 60, alignment: .trailing)
                            .bold()
                        Text("\(stat.sessionsCount)")
                            .frame(width: 60, alignment: .trailing)
                        Text("\(stat.bestSession)")
                            .frame(width: 60, alignment: .trailing)
                        Text(formatDuration(stat.totalDuration))
                            .frame(width: 70, alignment: .trailing)
                    }
                    .font(.callout.monospacedDigit())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    
                    Divider()
                }
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Хелперы
    
    private func barColor(for value: Int, max: Int) -> Color {
        let ratio = Double(value) / Double(max)
        if ratio > 0.75 { return .green }
        if ratio > 0.5 { return .blue }
        if ratio > 0.25 { return .orange }
        return .red.opacity(0.6)
    }
    
    private func shortDate(_ key: String) -> String {
        let parts = key.split(separator: "-")
        guard parts.count == 3 else { return key }
        return "\(parts[2]).\(parts[1])"
    }
    
    private func displayDate(_ key: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: key) else { return key }
        formatter.dateFormat = "d MMMM"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter.string(from: date)
    }
    
    private func formatDuration(_ interval: TimeInterval) -> String {
        let minutes = Int(interval) / 60
        let seconds = Int(interval) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Карточка сводки

struct SummaryCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            Text(value)
                .font(.title.bold().monospacedDigit())
            VStack(spacing: 2) {
                Text(title)
                    .font(.caption.bold())
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.08))
        .cornerRadius(12)
    }
}
