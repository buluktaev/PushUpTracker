import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var reminderManager: ReminderManager
    @EnvironmentObject var statsManager: StatsManager
    @State private var showResetConfirm = false
    @State private var serverURL: String = UserDefaults.standard.string(forKey: "api_base_url") ?? ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Сервер
                serverSection
                
                // Напоминания
                reminderSection
                
                // Быстрое напоминание
                quickReminderSection
                
                // Текущий игрок
                playerSection
                
                Divider()
                
                // Сброс
                dangerZone
            }
            .padding()
        }
    }
    
    // MARK: - Секция сервера
    
    var serverSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "server.rack")
                    .foregroundColor(.purple)
                Text("Сервер")
                    .font(.headline)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Circle()
                        .fill(statsManager.serverConnected ? .green : .red)
                        .frame(width: 8, height: 8)
                    Text(statsManager.serverConnected ? "Подключён" : "Не подключён")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                TextField("https://your-app.up.railway.app", text: $serverURL)
                    .textFieldStyle(.roundedBorder)
                
                Button("Сохранить") {
                    let url = serverURL.trimmingCharacters(in: .whitespacesAndNewlines)
                    // Убираем trailing slash
                    let cleanURL = url.hasSuffix("/") ? String(url.dropLast()) : url
                    APIClient.shared.setBaseURL(cleanURL)
                    serverURL = cleanURL
                    
                    Task { await statsManager.checkServerAndSync() }
                }
                .buttonStyle(.borderedProminent)
            }
            
            if !statsManager.syncStatus.isEmpty {
                Text(statsManager.syncStatus)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            if let playerId = statsManager.currentPlayerId {
                HStack {
                    Text("ID на сервере:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(playerId)
                        .font(.caption.monospaced())
                        .foregroundColor(.secondary)
                        .textSelection(.enabled)
                }
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Секция напоминаний
    
    var reminderSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "bell.fill")
                    .foregroundColor(.blue)
                Text("Напоминания")
                    .font(.headline)
            }
            
            if !reminderManager.permissionGranted {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text("Уведомления отключены")
                        .foregroundColor(.secondary)
                    Spacer()
                    Button("Включить") {
                        reminderManager.requestPermission()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            }
            
            Toggle("Регулярные напоминания", isOn: $reminderManager.settings.isEnabled)
            
            if reminderManager.settings.isEnabled {
                VStack(spacing: 12) {
                    HStack {
                        Text("Интервал")
                        Spacer()
                        Picker("", selection: $reminderManager.settings.intervalMinutes) {
                            Text("30 мин").tag(30)
                            Text("1 час").tag(60)
                            Text("1.5 часа").tag(90)
                            Text("2 часа").tag(120)
                        }
                        .frame(width: 150)
                    }
                    
                    HStack {
                        Text("С")
                        Picker("", selection: $reminderManager.settings.startHour) {
                            ForEach(6..<22, id: \.self) { hour in
                                Text("\(hour):00").tag(hour)
                            }
                        }
                        .frame(width: 80)
                        
                        Text("до")
                        Picker("", selection: $reminderManager.settings.endHour) {
                            ForEach(6..<23, id: \.self) { hour in
                                Text("\(hour):00").tag(hour)
                            }
                        }
                        .frame(width: 80)
                    }
                    
                    Toggle("Только рабочие дни (Пн-Пт)", isOn: $reminderManager.settings.workDaysOnly)
                    
                    HStack {
                        Text("Дневная цель")
                        Spacer()
                        TextField("", value: $reminderManager.settings.targetDaily, format: .number)
                            .textFieldStyle(.roundedBorder)
                            .frame(width: 80)
                        Text("отжиманий")
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.leading, 8)
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Быстрое напоминание
    
    var quickReminderSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "timer")
                    .foregroundColor(.orange)
                Text("Быстрое напоминание")
                    .font(.headline)
            }
            
            HStack(spacing: 8) {
                QuickReminderButton(minutes: 5, manager: reminderManager)
                QuickReminderButton(minutes: 15, manager: reminderManager)
                QuickReminderButton(minutes: 30, manager: reminderManager)
                QuickReminderButton(minutes: 60, manager: reminderManager)
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Текущий игрок
    
    var playerSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "person.fill")
                    .foregroundColor(.green)
                Text("Текущий игрок")
                    .font(.headline)
            }
            
            if statsManager.players.isEmpty {
                Text("Начни тренировку, чтобы создать профиль")
                    .foregroundColor(.secondary)
            } else {
                ForEach(statsManager.players) { player in
                    HStack {
                        Text(player.name)
                        if player.id == statsManager.currentPlayer?.id {
                            Text("✓")
                                .foregroundColor(.green)
                        }
                        Spacer()
                        Text("\(player.totalPushUps) отжиманий")
                            .foregroundColor(.secondary)
                        
                        Button(action: { statsManager.setCurrentPlayer(player) }) {
                            Text("Выбрать")
                        }
                        .buttonStyle(.bordered)
                        .disabled(player.id == statsManager.currentPlayer?.id)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(12)
    }
    
    // MARK: - Зона опасности
    
    var dangerZone: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                Text("Зона опасности")
                    .font(.headline)
            }
            
            Button(action: { showResetConfirm = true }) {
                Label("Сбросить все данные", systemImage: "trash.fill")
            }
            .buttonStyle(.bordered)
            .tint(.red)
        }
        .padding()
        .background(Color.red.opacity(0.05))
        .cornerRadius(12)
        .alert("Удалить все данные?", isPresented: $showResetConfirm) {
            Button("Отмена", role: .cancel) {}
            Button("Удалить", role: .destructive) {
                statsManager.resetAll()
            }
        } message: {
            Text("Все сессии, статистика и лидерборд будут удалены. Это действие нельзя отменить.")
        }
    }
}

// MARK: - Кнопка быстрого напоминания

struct QuickReminderButton: View {
    let minutes: Int
    let manager: ReminderManager
    @State private var scheduled = false
    
    var label: String {
        if minutes < 60 { return "\(minutes) мин" }
        return "\(minutes / 60) ч"
    }
    
    var body: some View {
        Button(action: {
            manager.scheduleQuickReminder(minutes: minutes)
            scheduled = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                scheduled = false
            }
        }) {
            VStack(spacing: 4) {
                Image(systemName: scheduled ? "checkmark.circle.fill" : "bell.badge")
                    .foregroundColor(scheduled ? .green : .primary)
                Text(label)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
        .buttonStyle(.bordered)
    }
}

// MARK: - Вью для Menu Bar

struct MenuBarView: View {
    @EnvironmentObject var statsManager: StatsManager
    @EnvironmentObject var reminderManager: ReminderManager
    
    var body: some View {
        VStack(spacing: 8) {
            Text("💪 Сегодня: \(statsManager.todayTotal) отжиманий")
            Text("📊 Неделя: \(statsManager.weekTotal)")
            
            Divider()
            
            Button("Напомнить через 15 мин") {
                reminderManager.scheduleQuickReminder(minutes: 15)
            }
            
            Button("Напомнить через 30 мин") {
                reminderManager.scheduleQuickReminder(minutes: 30)
            }
            
            Divider()
            
            Button("Выход") {
                NSApplication.shared.terminate(nil)
            }
            .keyboardShortcut("q")
        }
        .padding(8)
    }
}
