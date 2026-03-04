import SwiftUI

struct ContentView: View {
    @Environment(StatsManager.self) var statsManager
    @Environment(ReminderManager.self) var reminderManager
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Tab bar
            HStack(spacing: 2) {
                TabButton(title: "Тренировка", icon: "figure.strengthtraining.traditional", index: 0, selected: $selectedTab)
                TabButton(title: "Статистика",  icon: "chart.bar.fill",                    index: 1, selected: $selectedTab)
                TabButton(title: "Лидерборд",   icon: "trophy.fill",                       index: 2, selected: $selectedTab)
                TabButton(title: "Настройки",   icon: "gearshape.fill",                    index: 3, selected: $selectedTab)
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)

            Divider()

            Group {
                switch selectedTab {
                case 0: WorkoutView()
                case 1: StatsView()
                case 2: LeaderboardView()
                case 3: SettingsView()
                default: WorkoutView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Color(NSColor.windowBackgroundColor))
    }
}

// MARK: - Tab Button

struct TabButton: View {
    let title: String
    let icon: String
    let index: Int
    @Binding var selected: Int

    var isSelected: Bool { selected == index }

    var body: some View {
        Button(action: { selected = index }) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .medium))
                Text(title)
                    .font(.system(size: 13, weight: .medium))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(isSelected ? Color.primary.opacity(0.08) : Color.clear)
            )
            .foregroundColor(isSelected ? .primary : .secondary)
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}
