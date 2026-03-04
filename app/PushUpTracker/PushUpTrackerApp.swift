import SwiftUI
import UserNotifications

@main
struct PushUpTrackerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var statsManager = StatsManager()
    @StateObject private var reminderManager = ReminderManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(statsManager)
                .environmentObject(reminderManager)
                .frame(minWidth: 800, minHeight: 600)
        }
        .windowStyle(.titleBar)
        .defaultSize(width: 900, height: 700)
        
        // Строка меню для быстрого доступа
        MenuBarExtra("💪 PushUp Tracker", systemImage: "figure.strengthtraining.traditional") {
            MenuBarView()
                .environmentObject(statsManager)
                .environmentObject(reminderManager)
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }
    
    // Показываем уведомления даже когда приложение активно
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
