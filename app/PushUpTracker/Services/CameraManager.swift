import Combine
import AVFoundation
import SwiftUI
import Vision

/// Менеджер камеры — захватывает видео с веб-камеры и передаёт кадры для анализа позы
class CameraManager: NSObject, ObservableObject {
    @Published var isRunning = false
    @Published var permissionGranted = false
    @Published var error: String?
    
    let session = AVCaptureSession()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let processingQueue = DispatchQueue(label: "com.pushuptracker.camera", qos: .userInteractive)
    
    /// Колбэк для обработки каждого кадра
    var onFrame: ((CMSampleBuffer) -> Void)?
    
    override init() {
        super.init()
        checkPermission()
    }
    
    func checkPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            DispatchQueue.main.async { self.permissionGranted = true }
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async { self.permissionGranted = granted }
                if granted { self.setupSession() }
            }
        default:
            DispatchQueue.main.async {
                self.permissionGranted = false
                self.error = "Доступ к камере запрещён. Откройте Системные настройки → Конфиденциальность → Камера"
            }
        }
    }
    
    private func setupSession() {
        session.beginConfiguration()
        session.sessionPreset = .medium
        
        // Находим встроенную камеру
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .unspecified) else {
            DispatchQueue.main.async { self.error = "Камера не найдена" }
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: camera)
            if session.canAddInput(input) {
                session.addInput(input)
            }
        } catch {
            DispatchQueue.main.async { self.error = "Ошибка подключения камеры: \(error.localizedDescription)" }
            return
        }
        
        // Настраиваем вывод видео
        videoOutput.setSampleBufferDelegate(self, queue: processingQueue)
        videoOutput.alwaysDiscardsLateVideoFrames = true
        videoOutput.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]
        
        if session.canAddOutput(videoOutput) {
            session.addOutput(videoOutput)
        }
        
        session.commitConfiguration()
    }
    
    func start() {
        guard !session.isRunning else { return }
        processingQueue.async { [weak self] in
            self?.session.startRunning()
            DispatchQueue.main.async { self?.isRunning = true }
        }
    }
    
    func stop() {
        guard session.isRunning else { return }
        processingQueue.async { [weak self] in
            self?.session.stopRunning()
            DispatchQueue.main.async { self?.isRunning = false }
        }
    }
}

// MARK: - Обработка кадров

extension CameraManager: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        onFrame?(sampleBuffer)
    }
}

// MARK: - NSViewRepresentable для отображения камеры в SwiftUI

struct CameraPreview: NSViewRepresentable {
    let session: AVCaptureSession
    
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = view.bounds
        previewLayer.autoresizingMask = [.layerWidthSizable, .layerHeightSizable]
        
        // Зеркалим видео (как селфи-камера)
        previewLayer.connection?.automaticallyAdjustsVideoMirroring = false
        previewLayer.connection?.isVideoMirrored = true
        
        view.layer = CALayer()
        view.layer?.addSublayer(previewLayer)
        view.wantsLayer = true
        
        return view
    }
    
    func updateNSView(_ nsView: NSView, context: Context) {
        if let layer = nsView.layer?.sublayers?.first as? AVCaptureVideoPreviewLayer {
            layer.frame = nsView.bounds
        }
    }
}
