import Foundation
import UserNotifications
import Observation

/// Менеджер напоминаний — планирует уведомления об отжиманиях
@Observable @MainActor class ReminderManager {

    var settings: ReminderSettings {
        didSet { saveSettings(); scheduleReminders() }
    }
    var permissionGranted = false
    
    private let settingsKey = "pushup_reminder_settings"
    private let notificationCategory = "PUSHUP_REMINDER"
    
    private let motivationalMessages = [
        "💪 Время отжиманий! Покажи на что способен!",
        "🔥 Перерыв на отжимания! Твои мышцы скучают",
        "⚡ Давай 10 отжиманий прямо сейчас!",
        "🏋️ Рабочий перерыв = время для отжиманий",
        "💥 Не забывай про отжимания! Коллеги уже жмут",
        "🎯 Мини-тренировка! Отожмись и возвращайся к работе",
        "🚀 Быстрый сет отжиманий для заряда энергии!",
        "😤 Тебя обгоняют в лидерборде! Время наверстать",
    ]
    
    init() {
        if let data = UserDefaults.standard.data(forKey: settingsKey),
           let saved = try? JSONDecoder().decode(ReminderSettings.self, from: data) {
            self.settings = saved
        } else {
            self.settings = .default
        }
        
        checkPermission()
    }
    
    // MARK: - Разрешения
    
    func checkPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            Task { @MainActor in
                self.permissionGranted = settings.authorizationStatus == .authorized
            }
        }
    }

    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            Task { @MainActor in
                self.permissionGranted = granted
                if granted {
                    self.scheduleReminders()
                }
            }
        }
    }
    
    // MARK: - Планирование уведомлений
    
    func scheduleReminders() {
        let center = UNUserNotificationCenter.current()
        
        // Удаляем старые уведомления
        center.removeAllPendingNotificationRequests()
        
        guard settings.isEnabled, permissionGranted else { return }
        
        // Создаём уведомления для каждого интервала в течение дня
        // Планируем на неделю вперёд
        let calendar = Calendar.current
        
        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: dayOffset, to: Date()) else { continue }
            
            let weekday = calendar.component(.weekday, from: date)
            // Пн-Пт = 2-6, если включены только рабочие дни
            if settings.workDaysOnly && (weekday == 1 || weekday == 7) {
                continue
            }
            
            var hour = settings.startHour
            while hour < settings.endHour {
                var components = calendar.dateComponents([.year, .month, .day], from: date)
                components.hour = hour
                components.minute = 0
                
                let message = motivationalMessages.randomElement() ?? motivationalMessages[0]
                
                let content = UNMutableNotificationContent()
                content.title = "PushUp Tracker"
                content.body = message
                content.sound = .default
                content.categoryIdentifier = notificationCategory
                
                let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
                let id = "pushup_\(dayOffset)_\(hour)"
                let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
                
                center.add(request) { error in
                    if let error = error {
                        print("Failed to schedule notification: \(error)")
                    }
                }
                
                hour += settings.intervalMinutes / 60
                if settings.intervalMinutes % 60 > 0 && settings.intervalMinutes < 60 {
                    // Для интервалов меньше часа
                    break // Упрощённая логика — один раз в час минимум
                }
            }
        }
    }
    
    // MARK: - Быстрое напоминание
    
    func scheduleQuickReminder(minutes: Int) {
        let content = UNMutableNotificationContent()
        content.title = "PushUp Tracker"
        content.body = "⏰ Напоминание! Время для сета отжиманий"
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(minutes * 60), repeats: false)
        let request = UNNotificationRequest(identifier: "quick_reminder_\(Date())", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Persistence
    
    private func saveSettings() {
        if let data = try? JSONEncoder().encode(settings) {
            UserDefaults.standard.set(data, forKey: settingsKey)
        }
    }
}
