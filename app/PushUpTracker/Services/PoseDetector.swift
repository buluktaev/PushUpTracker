import Vision
import AVFoundation
import Combine
import AppKit
/// Детектор отжиманий — анализирует позу через Apple Vision и считает повторения
class PoseDetector: ObservableObject {
    
    // MARK: - Published свойства
    
    @Published var count: Int = 0
    @Published var phase: PushUpPhase = .idle
    @Published var status: DetectionStatus = .notDetected
    @Published var elbowAngle: Double = 0  // текущий угол в локте
    @Published var confidence: Float = 0
    
    // MARK: - Настройки порогов
    
    /// Угол локтя для нижней позиции (руки согнуты)
    private let downAngleThreshold: Double = 90
    /// Угол локтя для верхней позиции (руки выпрямлены)
    private let upAngleThreshold: Double = 155
    /// Минимальная уверенность для точки
    private let minConfidence: Float = 0.3
    /// Минимальное время между повторениями (защита от дребезга)
    private let minRepInterval: TimeInterval = 0.4
    
    // MARK: - Приватные свойства
    
    private var lastRepTime: Date = .distantPast
    private var consecutiveFrames: Int = 0
    private let requiredConsecutiveFrames: Int = 3
    
    private lazy var poseRequest: VNDetectHumanBodyPoseRequest = {
        let request = VNDetectHumanBodyPoseRequest()
        return request
    }()
    
    // MARK: - Основной метод обработки кадра
    
    func processFrame(_ sampleBuffer: CMSampleBuffer) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
        
        do {
            try handler.perform([poseRequest])
            
            guard let observation = poseRequest.results?.first else {
                DispatchQueue.main.async {
                    self.status = .notDetected
                    self.consecutiveFrames = 0
                }
                return
            }
            
            analyzePose(observation)
            
        } catch {
            print("Vision error: \(error)")
        }
    }
    
    // MARK: - Анализ позы
    
    private func analyzePose(_ observation: VNHumanBodyPoseObservation) {
        do {
            // Получаем ключевые точки для обеих рук
            let rightShoulder = try observation.recognizedPoint(.rightShoulder)
            let rightElbow = try observation.recognizedPoint(.rightElbow)
            let rightWrist = try observation.recognizedPoint(.rightWrist)
            
            let leftShoulder = try observation.recognizedPoint(.leftShoulder)
            let leftElbow = try observation.recognizedPoint(.leftElbow)
            let leftWrist = try observation.recognizedPoint(.leftWrist)
            
            // Проверяем уверенность для хотя бы одной руки
            let rightArmValid = rightShoulder.confidence > minConfidence &&
                                rightElbow.confidence > minConfidence &&
                                rightWrist.confidence > minConfidence
            
            let leftArmValid = leftShoulder.confidence > minConfidence &&
                               leftElbow.confidence > minConfidence &&
                               leftWrist.confidence > minConfidence
            
            guard rightArmValid || leftArmValid else {
                DispatchQueue.main.async {
                    self.status = .lowConfidence
                }
                return
            }
            
            // Считаем угол для лучшей руки (или среднее обеих)
            var angle: Double = 0
            var avgConfidence: Float = 0
            
            if rightArmValid && leftArmValid {
                let rightAngle = calculateAngle(
                    shoulder: rightShoulder.location,
                    elbow: rightElbow.location,
                    wrist: rightWrist.location
                )
                let leftAngle = calculateAngle(
                    shoulder: leftShoulder.location,
                    elbow: leftElbow.location,
                    wrist: leftWrist.location
                )
                angle = (rightAngle + leftAngle) / 2.0
                avgConfidence = (rightElbow.confidence + leftElbow.confidence) / 2.0
            } else if rightArmValid {
                angle = calculateAngle(
                    shoulder: rightShoulder.location,
                    elbow: rightElbow.location,
                    wrist: rightWrist.location
                )
                avgConfidence = rightElbow.confidence
            } else {
                angle = calculateAngle(
                    shoulder: leftShoulder.location,
                    elbow: leftElbow.location,
                    wrist: leftWrist.location
                )
                avgConfidence = leftElbow.confidence
            }
            
            DispatchQueue.main.async {
                self.elbowAngle = angle
                self.confidence = avgConfidence
                self.updatePhase(angle: angle)
            }
            
        } catch {
            DispatchQueue.main.async {
                self.status = .lowConfidence
            }
        }
    }
    
    // MARK: - Подсчёт повторений
    
    private func updatePhase(angle: Double) {
        status = .tracking
        
        switch phase {
        case .idle:
            // Ждём начальной позиции (руки выпрямлены — верхняя точка)
            if angle > upAngleThreshold {
                consecutiveFrames += 1
                if consecutiveFrames >= requiredConsecutiveFrames {
                    phase = .up
                    consecutiveFrames = 0
                }
            } else {
                consecutiveFrames = 0
                status = .detected
            }
            
        case .up:
            // Из верхней позиции ждём опускания (руки сгибаются)
            if angle < downAngleThreshold {
                consecutiveFrames += 1
                if consecutiveFrames >= requiredConsecutiveFrames {
                    phase = .down
                    consecutiveFrames = 0
                }
            } else {
                consecutiveFrames = 0
            }
            
        case .down:
            // Из нижней позиции ждём подъёма (руки выпрямляются)
            if angle > upAngleThreshold {
                consecutiveFrames += 1
                if consecutiveFrames >= requiredConsecutiveFrames {
                    let now = Date()
                    if now.timeIntervalSince(lastRepTime) > minRepInterval {
                        count += 1
                        lastRepTime = now
                        // Тактильная обратная связь через звук
                        NSSound.beep()
                    }
                    phase = .up
                    consecutiveFrames = 0
                }
            } else {
                consecutiveFrames = 0
            }
        }
    }
    
    // MARK: - Геометрия
    
    /// Вычисляет угол в точке B (локоть) между лучами BA (плечо) и BC (запястье)
    private func calculateAngle(shoulder: CGPoint, elbow: CGPoint, wrist: CGPoint) -> Double {
        let vectorBA = CGPoint(x: shoulder.x - elbow.x, y: shoulder.y - elbow.y)
        let vectorBC = CGPoint(x: wrist.x - elbow.x, y: wrist.y - elbow.y)
        
        let dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y
        let magnitudeBA = sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y)
        let magnitudeBC = sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y)
        
        guard magnitudeBA > 0, magnitudeBC > 0 else { return 0 }
        
        let cosAngle = dotProduct / (magnitudeBA * magnitudeBC)
        let clampedCos = max(-1, min(1, cosAngle))
        
        return acos(clampedCos) * 180.0 / .pi
    }
    
    // MARK: - Управление
    
    func reset() {
        count = 0
        phase = .idle
        status = .notDetected
        elbowAngle = 0
        confidence = 0
        consecutiveFrames = 0
        lastRepTime = .distantPast
    }
}
