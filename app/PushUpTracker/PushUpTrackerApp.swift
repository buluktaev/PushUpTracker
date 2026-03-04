import SwiftUI
import UserNotifications

@main
struct PushUpTrackerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var statsManager = StatsManager()
    @State private var reminderManager = ReminderManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(statsManager)
                .environment(reminderManager)
                .frame(minWidth: 800, minHeight: 600)
        }
        .windowStyle(.titleBar)
        .defaultSize(width: 900, height: 700)
        
        // Строка меню для быстрого доступа
        MenuBarExtra("💪 PushUp Tracker", systemImage: "figure.strengthtraining.traditional") {
            MenuBarView()
                .environment(statsManager)
                .environment(reminderManager)
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
