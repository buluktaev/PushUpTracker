'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  participantId: string
  onSessionSaved: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any

export default function CameraWorkout({ participantId, onSessionSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const landmarkerRef = useRef<AnyObj>(null)
  const drawingRef = useRef<AnyObj>(null)
  const lastVideoTimeRef = useRef(-1)
  const posePhaseRef = useRef<'up' | 'down'>('up')
  const sessionStartRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef = useRef(0)

  const [mpLoaded, setMpLoaded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [count, setCount] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState({ text: 'Камера выкл.', color: '#666' })
  const [saving, setSaving] = useState(false)

  const loadMP = useCallback(async () => {
    if (landmarkerRef.current) return
    try {
      const vision: AnyObj = await import(
        /* webpackIgnore: true */
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/vision_bundle.mjs' as AnyObj
      )
      const { PoseLandmarker, FilesetResolver, DrawingUtils } = vision
      const resolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
      )
      landmarkerRef.current = await PoseLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
      if (canvasRef.current) {
        drawingRef.current = new DrawingUtils(canvasRef.current.getContext('2d'))
      }
      setMpLoaded(true)
      setStatus({ text: 'Поза не найдена', color: '#f59e0b' })
    } catch (e) {
      console.error('MediaPipe load failed:', e)
      setStatus({ text: 'Ошибка загрузки MediaPipe', color: '#ef4444' })
    }
  }, [])

  function angleBetween(a: AnyObj, b: AnyObj, c: AnyObj): number {
    const ab = { x: b.x - a.x, y: b.y - a.y }
    const cb = { x: b.x - c.x, y: b.y - c.y }
    const dot = ab.x * cb.x + ab.y * cb.y
    const cross = ab.x * cb.y - ab.y * cb.x
    return Math.abs((Math.atan2(cross, dot) * 180) / Math.PI)
  }

  const processResult = useCallback((result: AnyObj) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!result.landmarks?.length) {
      setStatus({ text: 'Поза не найдена', color: '#f59e0b' })
      return
    }

    const lm = result.landmarks[0]

    if (drawingRef.current) {
      try {
        // Draw skeleton connectors
        const connections = [
          [11,13],[13,15],[12,14],[14,16],[11,12],[23,24],
          [11,23],[12,24],[23,25],[24,26],[25,27],[26,28]
        ]
        const ctx2 = canvas.getContext('2d')!
        ctx2.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx2.lineWidth = 2
        for (const [a, b] of connections) {
          if (lm[a] && lm[b]) {
            ctx2.beginPath()
            ctx2.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height)
            ctx2.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height)
            ctx2.stroke()
          }
        }
        // Draw landmarks
        ctx2.fillStyle = '#ff6b35'
        for (const point of lm) {
          ctx2.beginPath()
          ctx2.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI)
          ctx2.fill()
        }
      } catch {}
    }

    // Use left side: shoulder(11) - elbow(13) - wrist(15)
    const angle = angleBetween(lm[11], lm[13], lm[15])
    setStatus({ text: `Угол локтя: ${Math.round(angle)}°`, color: '#22c55e' })

    if (angle < 90 && posePhaseRef.current === 'up') {
      posePhaseRef.current = 'down'
    } else if (angle > 150 && posePhaseRef.current === 'down') {
      posePhaseRef.current = 'up'
      countRef.current += 1
      setCount(countRef.current)
    }
  }, [])

  const runFrame = useCallback((ts: number) => {
    const video = videoRef.current
    if (!video || !landmarkerRef.current) return

    const canvas = canvasRef.current
    if (canvas && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime
      try {
        const result = landmarkerRef.current.detectForVideo(video, ts)
        processResult(result)
      } catch {}
    }

    rafRef.current = requestAnimationFrame(runFrame)
  }, [processResult])

  useEffect(() => {
    if (cameraOn && mpLoaded) {
      rafRef.current = requestAnimationFrame(runFrame)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }
  }, [cameraOn, mpLoaded, runFrame])

  async function startCamera() {
    try {
      setStatus({ text: 'Инициализация...', color: '#f59e0b' })
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setCameraOn(true)
      await loadMP()
    } catch (e) {
      console.error(e)
      setStatus({ text: 'Нет доступа к камере', color: '#ef4444' })
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setStatus({ text: 'Камера выкл.', color: '#666' })
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function startSession() {
    countRef.current = 0
    setCount(0)
    setElapsed(0)
    sessionStartRef.current = Date.now()
    setSessionActive(true)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000))
    }, 1000)
  }

  async function finishSession() {
    if (timerRef.current) clearInterval(timerRef.current)
    setSessionActive(false)
    const finalCount = countRef.current
    const duration = Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000)
    if (finalCount === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, count: finalCount, duration }),
      })
      if (res.ok) {
        onSessionSaved()
      } else {
        console.error('Failed to save session:', res.status)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative rounded-xl overflow-hidden border-2"
        style={{ background: '#000', aspectRatio: '4/3', borderColor: cameraOn ? status.color : '#2a2a2a' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', display: cameraOn ? 'block' : 'none' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)', display: cameraOn ? 'block' : 'none' }}
        />

        {/* Status badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: status.color }} />
          {status.text}
        </div>

        {/* Counter */}
        {cameraOn && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div
              className="font-black text-white"
              style={{ fontSize: 80, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
            >
              {count}
            </div>
            {sessionActive && (
              <div className="text-white/80 text-lg">{fmt(elapsed)}</div>
            )}
          </div>
        )}

        {/* Camera toggle */}
        <button
          onClick={cameraOn ? stopCamera : startCamera}
          className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-lg text-white"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: 'none' }}
        >
          {cameraOn ? '📷 Выкл.' : '📷 Вкл.'}
        </button>

        {/* Placeholder */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#666]">
            <span className="text-4xl">📷</span>
            <span className="text-sm">Включите камеру для трекинга</span>
          </div>
        )}
      </div>

      {cameraOn && (
        !sessionActive ? (
          <button
            onClick={startSession}
            className="w-full py-3 rounded-xl font-semibold text-black bg-[#22c55e]"
          >
            Начать сессию
          </button>
        ) : (
          <button
            onClick={finishSession}
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#ef4444] disabled:opacity-40"
          >
            {saving ? 'Сохраняем...' : `Завершить (${count} отжиманий)`}
          </button>
        )
      )}
    </div>
  )
}
