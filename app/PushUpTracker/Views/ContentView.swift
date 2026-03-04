import SwiftUI

struct ContentView: View {
    @Environment(StatsManager.self) var statsManager
    @Environment(ReminderManager.self) var reminderManager
    @State private var selectedTab = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Верхняя панель навигации
            HStack(spacing: 0) {
                TabButton(title: "Тренировка", icon: "figure.strengthtraining.traditional", index: 0, selected: $selectedTab)
                TabButton(title: "Статистика", icon: "chart.bar.fill", index: 1, selected: $selectedTab)
                TabButton(title: "Лидерборд", icon: "trophy.fill", index: 2, selected: $selectedTab)
                TabButton(title: "Настройки", icon: "gearshape.fill", index: 3, selected: $selectedTab)
            }
            .padding(.horizontal)
            .padding(.top, 8)
            
            Divider()
                .padding(.top, 8)
            
            // Контент
            Group {
                switch selectedTab {
                case 0:
                    WorkoutView()
                case 1:
                    StatsView()
                case 2:
                    LeaderboardView()
                case 3:
                    SettingsView()
                default:
                    WorkoutView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Color(NSColor.windowBackgroundColor))
    }
}

// MARK: - Кнопка таба

struct TabButton: View {
    let title: String
    let icon: String
    let index: Int
    @Binding var selected: Int
    
    var isSelected: Bool { selected == index }
    
    var body: some View {
        Button(action: { selected = index }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                Text(title)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(isSelected ? Color.accentColor.opacity(0.15) : Color.clear)
            .foregroundColor(isSelected ? .accentColor : .secondary)
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}
