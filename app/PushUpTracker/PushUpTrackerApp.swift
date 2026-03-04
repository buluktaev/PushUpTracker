import SwiftUI
import UserNotifications

// MARK: - Тема приложения

enum AppTheme: String, CaseIterable {
    case system, light, dark

    var title: String {
        switch self {
        case .system: return "Системная"
        case .light:  return "Светлая"
        case .dark:   return "Тёмная"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light:  return .light
        case .dark:   return .dark
        }
    }
}

// MARK: - App

@main
struct PushUpTrackerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var statsManager = StatsManager()
    @State private var reminderManager = ReminderManager()
    @AppStorage("app_theme") private var appThemeRaw: String = AppTheme.system.rawValue

    private var appTheme: AppTheme {
        AppTheme(rawValue: appThemeRaw) ?? .system
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(statsManager)
                .environment(reminderManager)
                .frame(minWidth: 800, minHeight: 600)
                .preferredColorScheme(appTheme.colorScheme)
        }
        .windowStyle(.titleBar)
        .defaultSize(width: 900, height: 700)

        MenuBarExtra("💪 PushUp Tracker", systemImage: "figure.strengthtraining.traditional") {
            MenuBarView()
                .environment(statsManager)
                .environment(reminderManager)
        }
    }
}

// MARK: - AppDelegate

class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, error in
            if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
