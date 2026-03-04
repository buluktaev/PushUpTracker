import SwiftUI

struct WorkoutView: View {
    @Environment(StatsManager.self) var statsManager
    @StateObject private var camera = CameraManager()
    @StateObject private var detector = PoseDetector()
    
    @State private var isSessionActive = false
    @State private var sessionStart: Date?
    @State private var elapsedTime: TimeInterval = 0
    @State private var timer: Timer?
    @State private var playerName: String = ""
    @State private var showSaveSheet = false
    @State private var lastSessionCount = 0
    
    var body: some View {
        HStack(spacing: 0) {
            // Левая панель — камера
            cameraPanel
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Правая панель — управление
            controlPanel
                .frame(width: 280)
                .background(Color(NSColor.controlBackgroundColor))
        }
        .onAppear {
            // Загружаем имя последнего игрока
            if let player = statsManager.currentPlayer {
                playerName = player.name
            }
        }
        .sheet(isPresented: $showSaveSheet) {
            saveSessionSheet
        }
    }
    
    // MARK: - Камера
    
    var cameraPanel: some View {
        ZStack {
            if camera.permissionGranted {
                CameraPreview(session: camera.session)
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(statusBorderColor, lineWidth: 3)
                    )
                
                // Оверлей со счётчиком
                VStack {
                    // Статус
                    HStack {
                        Circle()
                            .fill(statusBorderColor)
                            .frame(width: 10, height: 10)
                        Text(detector.status.description)
                            .font(.callout.bold())
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(.ultraThinMaterial, in: Capsule())
                    
                    Spacer()
                    
                    // Большой счётчик
                    if isSessionActive {
                        VStack(spacing: 4) {
                            Text("\(detector.count)")
                                .font(.system(size: 96, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.5), radius: 4)
                            
                            Text(formatTime(elapsedTime))
                                .font(.title2.monospacedDigit())
                                .foregroundColor(.white.opacity(0.9))
                                .shadow(color: .black.opacity(0.5), radius: 2)
                        }
                        .padding(.bottom, 40)
                    }
                }
                .padding()
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "video.slash.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text(camera.error ?? "Нет доступа к камере")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                    
                    Button("Открыть настройки") {
                        NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera")!)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.black.opacity(0.05))
                .cornerRadius(12)
            }
        }
        .padding()
    }
    
    // MARK: - Панель управления
    
    var controlPanel: some View {
        VStack(spacing: 20) {
            // Имя игрока
            VStack(alignment: .leading, spacing: 6) {
                Text("Игрок")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Введи своё имя", text: $playerName)
                    .textFieldStyle(.roundedBorder)
                    .disabled(isSessionActive)
            }
            
            Divider()
            
            // Информация о сессии
            if isSessionActive {
                VStack(spacing: 12) {
                    StatCard(title: "Отжиманий", value: "\(detector.count)", icon: "flame.fill", color: .orange)
                    StatCard(title: "Время", value: formatTime(elapsedTime), icon: "timer", color: .blue)
                    StatCard(title: "Угол локтя", value: "\(Int(detector.elbowAngle))°", icon: "angle", color: .purple)
                    StatCard(title: "Точность", value: "\(Int(detector.confidence * 100))%", icon: "eye.fill", color: .green)
                }
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "figure.strengthtraining.traditional")
                        .font(.system(size: 40))
                        .foregroundColor(.accentColor)
                    Text("Готов к тренировке?")
                        .font(.headline)
                    Text("Встань перед камерой боком,\nчтобы были видны руки и торс")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.vertical, 20)
            }
            
            Divider()
            
            // Сегодня
            VStack(alignment: .leading, spacing: 4) {
                Text("Сегодня")
                    .font(.caption)
                    .foregroundColor(.secondary)
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                    Text("\(statsManager.todayTotal) отжиманий")
                        .font(.callout.bold())
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            Spacer()
            
            // Кнопки управления
            VStack(spacing: 10) {
                if isSessionActive {
                    Button(action: stopSession) {
                        Label("Завершить", systemImage: "stop.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
                    
                    Button(action: {
                        detector.reset()
                    }) {
                        Label("Сбросить счётчик", systemImage: "arrow.counterclockwise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                } else {
                    Button(action: startSession) {
                        Label("Начать тренировку", systemImage: "play.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .disabled(playerName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .padding()
    }
    
    // MARK: - Сохранение сессии
    
    var saveSessionSheet: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.green)
            
            Text("Отличная работа! 🎉")
                .font(.title2.bold())
            
            VStack(spacing: 8) {
                HStack {
                    Text("Отжиманий:")
                    Spacer()
                    Text("\(lastSessionCount)").bold()
                }
                HStack {
                    Text("Время:")
                    Spacer()
                    Text(formatTime(elapsedTime)).bold()
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(8)
            
            HStack(spacing: 12) {
                Button("Не сохранять") {
                    showSaveSheet = false
                }
                .buttonStyle(.bordered)
                
                Button("Сохранить") {
                    statsManager.recordSession(
                        playerName: playerName,
                        count: lastSessionCount,
                        duration: elapsedTime
                    )
                    showSaveSheet = false
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(30)
        .frame(width: 320)
    }
    
    // MARK: - Управление сессией
    
    private func startSession() {
        let name = playerName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        
        detector.reset()
        camera.onFrame = { buffer in
            detector.processFrame(buffer)
        }
        camera.start()
        
        isSessionActive = true
        sessionStart = Date()
        elapsedTime = 0
        
        // Таймер для обновления времени
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            if let start = sessionStart {
                elapsedTime = Date().timeIntervalSince(start)
            }
        }
    }
    
    private func stopSession() {
        camera.stop()
        camera.onFrame = nil
        timer?.invalidate()
        timer = nil
        
        lastSessionCount = detector.count
        isSessionActive = false
        
        if lastSessionCount > 0 {
            showSaveSheet = true
        }
    }
    
    // MARK: - Хелперы
    
    private var statusBorderColor: Color {
        switch detector.status {
        case .notDetected: return .red
        case .detected: return .yellow
        case .tracking: return .green
        case .lowConfidence: return .orange
        }
    }
    
    private func formatTime(_ interval: TimeInterval) -> String {
        let minutes = Int(interval) / 60
        let seconds = Int(interval) % 60
        let tenths = Int((interval.truncatingRemainder(dividingBy: 1)) * 10)
        return String(format: "%d:%02d.%d", minutes, seconds, tenths)
    }
}

// MARK: - Карточка статистики

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
            Text(title)
                .font(.callout)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.callout.bold().monospacedDigit())
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(color.opacity(0.08))
        .cornerRadius(8)
    }
}
