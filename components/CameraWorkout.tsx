'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision'
import NumberFlow from '@number-flow/react'
import Icon from '@/components/Icon'
import { getExerciseConfig } from '@/lib/exerciseConfigs'

interface Props {
  participantId: string
  discipline: string
  onSessionSaved: () => void
}

type AnyObj = any

export default function CameraWorkout({ participantId, discipline, onSessionSaved }: Props) {
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
  const angleBufferRef = useRef<number[]>([])
  const lastRepTimeRef = useRef<number>(0)
  const holdTimeRef = useRef(0)
  const lastHoldTickRef = useRef<number | null>(null)

  const config = getExerciseConfig(discipline)
  const isHoldMode = config?.mode === 'hold'

  const [mpLoaded, setMpLoaded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [count, setCount] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState({ text: 'camera off', color: '#888880' })
  const [saving, setSaving] = useState(false)
  const [holding, setHolding] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const [startDisabled, setStartDisabled] = useState(false)
  const startDisabledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mediapipeModelPath = '/mediapipe/models/pose_landmarker_full.task'

  const loadMP = useCallback(async () => {
    if (landmarkerRef.current) return
    try {
      const resolver = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
      landmarkerRef.current = await PoseLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath: mediapipeModelPath,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d')
        if (context) {
          drawingRef.current = new DrawingUtils(context)
        }
      }
      setMpLoaded(true)
      setStatus({ text: 'searching...', color: '#f59e0b' })
    } catch (e) {
      console.error('MediaPipe load failed:', e)
      setStatus({ text: 'err: local mediapipe failed', color: '#ef4444' })
    }
  }, [mediapipeModelPath])

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

    const lm = result.landmarks[0]          // image coords — for drawing
    const wlm = result.worldLandmarks?.[0]  // 3D world coords — for angle

    // Anti-cheat: determine body tilt (horizontal = valid push-up position)
    const hipVisible = lm[23]?.x != null && lm[24]?.x != null
    let isHorizontal = false
    if (hipVisible) {
      if (wlm) {
        const sY = (wlm[11].y + wlm[12].y) / 2
        const hY = (wlm[23].y + wlm[24].y) / 2
        const sX = (wlm[11].x + wlm[12].x) / 2
        const hX = (wlm[23].x + wlm[24].x) / 2
        const sZ = (wlm[11].z + wlm[12].z) / 2
        const hZ = (wlm[23].z + wlm[24].z) / 2
        const dy = sY - hY
        const torsoLen = Math.sqrt((sX - hX) ** 2 + dy ** 2 + (sZ - hZ) ** 2)
        isHorizontal = torsoLen > 0 ? Math.abs(dy / torsoLen) < 0.45 : false
      } else {
        const shoulderY = (lm[11].y + lm[12].y) / 2
        const hipY = (lm[23].y + lm[24].y) / 2
        isHorizontal = (hipY - shoulderY) < 0.25
      }
    }

    let bodyCheckPassed = true
    if (config!.bodyCheck === 'horizontal') {
      bodyCheckPassed = isHorizontal
    } else if (config!.bodyCheck === 'vertical') {
      bodyCheckPassed = !isHorizontal
    }

    if (drawingRef.current) {
      try {
        const connections = [
          [11,13],[13,15],[12,14],[14,16],[11,12],[23,24],
          [11,23],[12,24],[23,25],[24,26],[25,27],[26,28]
        ]
        const ctx2 = canvas.getContext('2d')!
        ctx2.strokeStyle = bodyCheckPassed ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.4)'
        ctx2.lineWidth = 1.5
        for (const [a, b] of connections) {
          if (lm[a] && lm[b]) {
            ctx2.beginPath()
            ctx2.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height)
            ctx2.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height)
            ctx2.stroke()
          }
        }
        ctx2.fillStyle = bodyCheckPassed ? '#4ade80' : '#ff6b35'
        for (const point of lm) {
          ctx2.beginPath()
          ctx2.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, 2 * Math.PI)
          ctx2.fill()
        }
      } catch {}
    }

    const src = wlm ?? lm
    const [lA, lB, lC] = config!.keypointsLeft
    const [rA, rB, rC] = config!.keypointsRight
    const leftAngle = angleBetween(src[lA], src[lB], src[lC])
    const rightAngle = angleBetween(src[rA], src[rB], src[rC])
    const rawAngle = (leftAngle + rightAngle) / 2

    // Median filter: buffer last 5 angles, remove ±2σ outliers, take median
    const buf = angleBufferRef.current
    buf.push(rawAngle)
    if (buf.length > 3) buf.shift()
    const mean = buf.reduce((s, v) => s + v, 0) / buf.length
    const std = Math.sqrt(buf.reduce((s, v) => s + (v - mean) ** 2, 0) / buf.length)
    const filtered = buf.filter(v => Math.abs(v - mean) <= 2 * std)
    const sorted = [...filtered].sort((a, b) => a - b)
    const angle = sorted[Math.floor(sorted.length / 2)] ?? rawAngle

    if (!hipVisible) {
      setStatus({ text: 'show full body', color: '#f59e0b' })
    } else if (!bodyCheckPassed) {
      setStatus({
        text: config!.bodyCheck === 'horizontal' ? 'get horizontal!' : 'get vertical!',
        color: '#ef4444',
      })
    } else if (isHoldMode) {
      setStatus({ text: 'hold position', color: '#22c55e' })
    } else {
      setStatus({ text: `angle: ${Math.round(angle)}°`, color: '#ff6b35' })
    }

    if (!isHoldMode) {
      // Reps mode: generic angle-based counting
      const isDown = config!.isInverted ? angle > config!.downAngle : angle < config!.downAngle
      const isUp = config!.isInverted ? angle < config!.upAngle : angle > config!.upAngle
      if (isDown && posePhaseRef.current === 'up') {
        posePhaseRef.current = 'down'
      } else if (isUp && posePhaseRef.current === 'down') {
        posePhaseRef.current = 'up'
        const now = Date.now()
        if (sessionActiveRef.current && bodyCheckPassed && now - lastRepTimeRef.current >= 500) {
          lastRepTimeRef.current = now
          countRef.current += 1
          setCount(countRef.current)
        }
      }
    } else if (sessionActiveRef.current) {
      // Hold mode: count seconds while pose is held
      if (bodyCheckPassed) {
        const now = Date.now()
        if (lastHoldTickRef.current !== null) {
          holdTimeRef.current += (now - lastHoldTickRef.current) / 1000
        }
        lastHoldTickRef.current = now
        countRef.current = Math.floor(holdTimeRef.current)
        setCount(countRef.current)
      } else {
        // Pose lost — pause timer
        lastHoldTickRef.current = null
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
    angleBufferRef.current = []
    lastRepTimeRef.current = 0
    holdTimeRef.current = 0
    lastHoldTickRef.current = null
    setCount(0)
    setElapsed(0)
    setCountdown(5)

    let remaining = 5
    countdownRef.current = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(countdownRef.current!)
        countdownRef.current = null
        setCountdown(null)
        sessionStartRef.current = Date.now()
        sessionActiveRef.current = true
        setSessionActive(true)
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000))
        }, 1000)
      } else {
        setCountdown(remaining)
      }
    }, 1000)
  }

  function cancelCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = null
    setCountdown(null)
    setCount(0)
    setElapsed(0)
  }

  function startHold() {
    holdStartRef.current = Date.now()
    setHolding(true)
    setHoldProgress(0)

    function tick() {
      const elapsed = Date.now() - (holdStartRef.current ?? Date.now())
      const progress = Math.min(elapsed / 1000, 1)
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
    setHolding(false)
    setHoldProgress(0)
    setStartDisabled(true)
    if (startDisabledTimerRef.current) clearTimeout(startDisabledTimerRef.current)
    startDisabledTimerRef.current = setTimeout(() => setStartDisabled(false), 800)
    const finalCount = countRef.current
    const duration = Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000)
    if (finalCount < (isHoldMode ? 5 : 1)) return
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, value: finalCount, duration }),
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
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div
      className="camera-wrapper flex flex-col gap-3 mx-auto w-full"
    >

      {/* Camera container — always dark bg regardless of theme */}
      <div
        className="camera-container relative overflow-hidden"
        style={{
          background: '#0a0a0a',
          aspectRatio: '4/3',
          border: `1px solid ${cameraOn ? status.color : 'var(--border)'}`,
          borderRadius: 0,
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
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: 0 }}
        >
          <span className="w-1.5 h-1.5 shrink-0" style={{ background: status.color }} />
          <span style={{ color: status.color }}>[{status.text}]</span>
        </div>

        {/* Counter overlay — bottom center */}
        {cameraOn && (countdown !== null || sessionActive) && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="font-bold text-white tabular-nums"
              style={{ fontSize: 88, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              <NumberFlow
                value={countdown !== null ? countdown : count}
                format={countdown !== null
                  ? undefined
                  : { minimumIntegerDigits: 2 }
                }
              />
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

        {/* Disable camera — top right */}
        {cameraOn && (
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider text-white"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: 0 }}
          >
            <Icon name="photo_camera" size={13} />
            off
          </button>
        )}

        {/* Enable camera — center */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-2.5 px-8 py-5 text-white transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,107,53,0.9)', backdropFilter: 'blur(6px)', borderRadius: 0 }}
            >
              <Icon name="photo_camera" size={28} />
              <span className="text-[11px] tracking-widest">enable_camera()</span>
            </button>
          </div>
        )}
      </div>

      {/* Session controls — placeholder сохраняет высоту когда камера выключена */}
      {cameraOn ? (
        countdown !== null ? (
          <button
            onClick={cancelCountdown}
            className="w-full py-3 text-sm font-normal text-[#888880] ring-1 ring-inset ring-[#888880] hover:opacity-60 transition-opacity"
          >
            cancel()
          </button>
        ) : !sessionActive ? (
          <button
            onClick={startSession}
            disabled={startDisabled}
            className="w-full py-3 text-sm font-normal text-white bg-[#22c55e] disabled:opacity-40 hover:opacity-85 transition-opacity"
          >
            start_session()
          </button>
        ) : (
          <button
            data-hold
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            disabled={saving}
            className="relative w-full py-3 text-sm font-normal text-white bg-[#ef4444] disabled:opacity-40 overflow-hidden select-none"
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
                : `finish() · ${isHoldMode ? fmt(count) : count + ' reps'}`}
            </span>
          </button>
        )
      ) : (
        <div className="w-full py-3 text-sm" aria-hidden="true" style={{ visibility: 'hidden' }}>&nbsp;</div>
      )}
    </div>
  )
}
