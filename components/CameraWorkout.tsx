'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { IconCameraFilled } from '@tabler/icons-react'

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
  const sessionActiveRef = useRef(false)

  const [mpLoaded, setMpLoaded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [count, setCount] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState({ text: 'camera off', color: '#888880' })
  const [saving, setSaving] = useState(false)
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)

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
      setStatus({ text: 'searching...', color: '#f59e0b' })
    } catch (e) {
      console.error('MediaPipe load failed:', e)
      setStatus({ text: 'err: mediapipe failed', color: '#ef4444' })
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
      setStatus({ text: 'searching...', color: '#f59e0b' })
      return
    }

    const lm = result.landmarks[0]

    if (drawingRef.current) {
      try {
        const connections = [
          [11,13],[13,15],[12,14],[14,16],[11,12],[23,24],
          [11,23],[12,24],[23,25],[24,26],[25,27],[26,28]
        ]
        const ctx2 = canvas.getContext('2d')!
        ctx2.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx2.lineWidth = 1.5
        for (const [a, b] of connections) {
          if (lm[a] && lm[b]) {
            ctx2.beginPath()
            ctx2.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height)
            ctx2.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height)
            ctx2.stroke()
          }
        }
        ctx2.fillStyle = '#ff6b35'
        for (const point of lm) {
          ctx2.beginPath()
          ctx2.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, 2 * Math.PI)
          ctx2.fill()
        }
      } catch {}
    }

    const keyPoints = [11, 12, 13, 14, 15, 16]
    if (keyPoints.some(i => (lm[i]?.visibility ?? 0) < 0.5)) {
      setStatus({ text: 'searching...', color: '#f59e0b' })
      return
    }

    const shoulderXSpread = Math.abs(lm[11].x - lm[12].x)
    const isFrontFacing = shoulderXSpread > 0.15

    let isDown: boolean
    let isUp: boolean
    let statusText: string

    if (isFrontFacing) {
      const wristMidY = (lm[15].y + lm[16].y) / 2
      const shoulderMidY = (lm[11].y + lm[12].y) / 2
      const gap = wristMidY - shoulderMidY

      isDown = gap < 0.08
      isUp   = gap > 0.18
      statusText = `front · ${posePhaseRef.current === 'down' ? '↓ down' : '↑ up'}`
    } else {
      const shoulderMidY = (lm[11].y + lm[12].y) / 2
      const hipMidY      = (lm[23].y + lm[24].y) / 2
      if (Math.abs(shoulderMidY - hipMidY) > 0.15) {
        setStatus({ text: 'get in position', color: '#f59e0b' })
        return
      }

      const angleL = angleBetween(lm[11], lm[13], lm[15])
      const angleR = angleBetween(lm[12], lm[14], lm[16])
      const angle  = (angleL + angleR) / 2

      isDown = angle < 90
      isUp   = angle > 150
      statusText = `side · ${Math.round(angle)}°`
    }

    setStatus({ text: statusText, color: '#ff6b35' })

    if (isDown && posePhaseRef.current === 'up') {
      posePhaseRef.current = 'down'
    } else if (isUp && posePhaseRef.current === 'down') {
      posePhaseRef.current = 'up'
      if (sessionActiveRef.current) {
        countRef.current += 1
        setCount(countRef.current)
      }
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
      setStatus({ text: 'init...', color: '#f59e0b' })
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
      setStatus({ text: 'err: no camera access', color: '#ef4444' })
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setStatus({ text: 'camera off', color: '#888880' })
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function startSession() {
    countRef.current = 0
    setCount(0)
    setElapsed(0)
    sessionStartRef.current = Date.now()
    sessionActiveRef.current = true
    setSessionActive(true)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000))
    }, 1000)
  }

  function startHold() {
    holdStartRef.current = Date.now()
    setHolding(true)
    setHoldProgress(0)

    function tick() {
      const elapsed = Date.now() - (holdStartRef.current ?? Date.now())
      const progress = Math.min(elapsed / 2000, 1)
      setHoldProgress(progress)
      if (progress < 1) {
        holdRafRef.current = requestAnimationFrame(tick)
      } else {
        finishSession()
      }
    }
    holdRafRef.current = requestAnimationFrame(tick)
  }

  function cancelHold() {
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current)
    setHolding(false)
    setHoldProgress(0)
    holdStartRef.current = null
  }

  async function finishSession() {
    if (timerRef.current) clearInterval(timerRef.current)
    sessionActiveRef.current = false
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

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-3">

      {/* Camera container */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#0a0a0a',
          aspectRatio: '4/3',
          border: `1px solid ${cameraOn ? status.color : '#E5E3DC'}`,
          borderRadius: '2px',
          transition: 'border-color 0.2s',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', display: cameraOn ? 'block' : 'none' }}
          playsInline
          muted
          aria-label="камера для отжиманий"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)', display: cameraOn ? 'block' : 'none' }}
        />

        {/* Status badge — top left */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: '2px' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: status.color }}
          />
          <span style={{ color: status.color }}>[{status.text}]</span>
        </div>

        {/* Counter overlay — bottom center */}
        {cameraOn && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="font-bold text-white tabular-nums"
              style={{ fontSize: 88, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              {String(count).padStart(2, '0')}
            </div>
            {sessionActive && (
              <div
                className="text-base tabular-nums"
                style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}
              >
                {fmt(elapsed)}
              </div>
            )}
          </div>
        )}

        {/* Disable camera button — top right */}
        {cameraOn && (
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider text-white"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: '2px' }}
          >
            <IconCameraFilled size={13} />
            off
          </button>
        )}

        {/* Enable camera — center */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-2.5 px-8 py-5 text-white transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(255,107,53,0.9)',
                backdropFilter: 'blur(6px)',
                borderRadius: '2px',
              }}
            >
              <IconCameraFilled size={28} />
              <span className="text-[11px] tracking-widest">enable_camera()</span>
            </button>
          </div>
        )}
      </div>

      {/* Session controls */}
      {cameraOn && (
        !sessionActive ? (
          <button
            onClick={startSession}
            className="w-full py-3 rounded-[2px] text-sm font-bold text-white bg-[#22c55e] hover:opacity-85 transition-opacity"
          >
            start_session()
          </button>
        ) : (
          <button
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            disabled={saving}
            className="relative w-full py-3 rounded-[2px] text-sm font-bold text-white bg-[#ef4444] disabled:opacity-40 overflow-hidden select-none"
            style={{ touchAction: 'none' }}
          >
            <span
              className="absolute inset-0 bg-white/20 origin-left"
              style={{ transform: `scaleX(${holdProgress})`, transition: 'none' }}
            />
            <span className="relative">
              {saving
                ? '// сохраняем...'
                : holding
                ? '// удерживайте...'
                : `finish() · ${count} reps`}
            </span>
          </button>
        )
      )}
    </div>
  )
}
