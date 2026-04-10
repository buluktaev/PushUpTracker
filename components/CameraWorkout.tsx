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
  const smoothedLandmarksRef = useRef<AnyObj[] | null>(null)
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
  const poseReadyForTrackingRef = useRef(false)

  const config = getExerciseConfig(discipline)
  const isHoldMode = config?.mode === 'hold'
  const positionHint = config?.positionHint ?? 'займите нужное положение'
  const positionHintMobile = config?.positionHintMobile ?? positionHint
  const cameraGuidance = config?.cameraGuidance ?? 'Расположитесь перед камерой так, чтобы нужные части тела были в кадре.'
  const cameraGuidanceMobile = config?.cameraGuidanceMobile ?? cameraGuidance
  const cameraStatusText: Record<'off' | 'searching' | 'ready', string> = {
    off: 'камера выключена',
    searching: 'поиск позы',
    ready: 'камера включена',
  }

  const [mpLoaded, setMpLoaded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [count, setCount] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState({ text: cameraStatusText.off, color: 'var(--status-warning-default)' })
  const [saving, setSaving] = useState(false)
  const [holding, setHolding] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const [startDisabled, setStartDisabled] = useState(false)
  const startDisabledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [poseReadyForTracking, setPoseReadyForTracking] = useState(false)
  const mediapipeModelPath = '/mediapipe/models/pose_landmarker_full.task'

  const updatePoseReadyForTracking = useCallback((nextValue: boolean) => {
    if (poseReadyForTrackingRef.current === nextValue) return
    poseReadyForTrackingRef.current = nextValue
    setPoseReadyForTracking(nextValue)
  }, [])

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
      setStatus({ text: cameraStatusText.searching, color: 'var(--status-warning-default)' })
    } catch (e) {
      console.error('MediaPipe load failed:', e)
      setStatus({ text: 'ошибка mediapipe', color: 'var(--status-danger-default)' })
    }
  }, [cameraStatusText.off, cameraStatusText.searching, mediapipeModelPath])

  function angleBetween(a: AnyObj, b: AnyObj, c: AnyObj): number {
    const ab = { x: b.x - a.x, y: b.y - a.y }
    const cb = { x: b.x - c.x, y: b.y - c.y }
    const dot = ab.x * cb.x + ab.y * cb.y
    const cross = ab.x * cb.y - ab.y * cb.x
    return Math.abs((Math.atan2(cross, dot) * 180) / Math.PI)
  }

  function smoothLandmarks(current: AnyObj[]) {
    const previous = smoothedLandmarksRef.current
    if (!previous || previous.length !== current.length) {
      const seeded = current.map(point => ({ ...point }))
      smoothedLandmarksRef.current = seeded
      return seeded
    }

    const alpha = 0.32
    const smoothed = current.map((point, index) => {
      const prevPoint = previous[index]
      return {
        ...point,
        x: prevPoint.x + (point.x - prevPoint.x) * alpha,
        y: prevPoint.y + (point.y - prevPoint.y) * alpha,
        z: typeof point.z === 'number' && typeof prevPoint.z === 'number'
          ? prevPoint.z + (point.z - prevPoint.z) * alpha
          : point.z,
      }
    })

    smoothedLandmarksRef.current = smoothed
    return smoothed
  }

  const processResult = useCallback((result: AnyObj) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!result.landmarks?.length) {
      updatePoseReadyForTracking(false)
      setStatus({ text: cameraStatusText.searching, color: 'var(--status-warning-default)' })
      return
    }

    const lm = result.landmarks[0]          // image coords — for logic
    const drawLm = smoothLandmarks(lm)      // smoothed image coords — for drawing
    const wlm = result.worldLandmarks?.[0]  // 3D world coords — for angle
    const hasLandmark = (index: number, minVisibility = 0.35) => {
      const point = lm[index]
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return false
      return typeof point.visibility !== 'number' || point.visibility >= minVisibility
    }
    const hasLeftArm = hasLandmark(11) && hasLandmark(13) && hasLandmark(15)
    const hasRightArm = hasLandmark(12) && hasLandmark(14) && hasLandmark(16)
    const hasAnyArm = hasLeftArm || hasRightArm
    const hasBothArms = hasLeftArm && hasRightArm
    const hasLegs = hasLandmark(23) && hasLandmark(24) && hasLandmark(25) && hasLandmark(26) && hasLandmark(27) && hasLandmark(28)
    const hasCoreLine = (hasLandmark(11) && hasLandmark(23) && hasLandmark(27)) || (hasLandmark(12) && hasLandmark(24) && hasLandmark(28))

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
    let poseCheckPassed = true
    switch (config!.poseCheck) {
      case 'pushups':
        poseCheckPassed = hipVisible && hasAnyArm
        break
      case 'squats':
        poseCheckPassed = hasLegs
        break
      case 'crunches':
        poseCheckPassed = hipVisible && hasCoreLine && hasLandmark(27) && hasLandmark(28)
        break
      case 'armVisibility':
        poseCheckPassed = hasAnyArm
        break
      case 'lateralRaise':
        poseCheckPassed = hasBothArms
        break
      case 'plank':
        poseCheckPassed = hipVisible && hasCoreLine
        break
    }
    const requiresHipVisibility = config!.poseCheck !== 'armVisibility' && config!.poseCheck !== 'lateralRaise'
    const poseReady = bodyCheckPassed && poseCheckPassed
    updatePoseReadyForTracking(poseReady)

    if (drawingRef.current) {
      try {
        const successColor =
          getComputedStyle(document.documentElement).getPropertyValue('--status-success-default').trim() || '#22c55e'
        const connections = [
          [11,13],[13,15],[12,14],[14,16],[11,12],[23,24],
          [11,23],[12,24],[23,25],[24,26],[25,27],[26,28]
        ]
        const pointIndexes = Array.from(new Set(connections.flat()))
        const ctx2 = canvas.getContext('2d')!
        ctx2.strokeStyle = successColor
        ctx2.lineWidth = 2.75
        for (const [a, b] of connections) {
          if (lm[a] && lm[b]) {
            ctx2.beginPath()
            ctx2.moveTo(drawLm[a].x * canvas.width, drawLm[a].y * canvas.height)
            ctx2.lineTo(drawLm[b].x * canvas.width, drawLm[b].y * canvas.height)
            ctx2.stroke()
          }
        }
        ctx2.fillStyle = '#ffffff'
        for (const pointIndex of pointIndexes) {
          const point = drawLm[pointIndex]
          if (!point) continue
          ctx2.beginPath()
          ctx2.arc(point.x * canvas.width, point.y * canvas.height, 4.5, 0, 2 * Math.PI)
          ctx2.fill()
        }
      } catch {}
    }

    const src = wlm ?? lm
    const [lA, lB, lC] = config!.keypointsLeft
    const [rA, rB, rC] = config!.keypointsRight
    const leftAngle = angleBetween(src[lA], src[lB], src[lC])
    const rightAngle = angleBetween(src[rA], src[rB], src[rC])
    const leftChainVisibility = [lA, lB, lC].reduce((sum, index) => {
      const point = lm[index]
      if (!point || typeof point.visibility !== 'number') return sum + 1
      return sum + Math.max(point.visibility, 0)
    }, 0)
    const rightChainVisibility = [rA, rB, rC].reduce((sum, index) => {
      const point = lm[index]
      if (!point || typeof point.visibility !== 'number') return sum + 1
      return sum + Math.max(point.visibility, 0)
    }, 0)
    const rawAngle = config!.angleStrategy === 'bestVisibleSide'
      ? leftChainVisibility >= rightChainVisibility
        ? leftAngle
        : rightAngle
      : (leftAngle + rightAngle) / 2

    // Median filter: buffer last 5 angles, remove ±2σ outliers, take median
    const buf = angleBufferRef.current
    buf.push(rawAngle)
    if (buf.length > 3) buf.shift()
    const mean = buf.reduce((s, v) => s + v, 0) / buf.length
    const std = Math.sqrt(buf.reduce((s, v) => s + (v - mean) ** 2, 0) / buf.length)
    const filtered = buf.filter(v => Math.abs(v - mean) <= 2 * std)
    const sorted = [...filtered].sort((a, b) => a - b)
    const angle = sorted[Math.floor(sorted.length / 2)] ?? rawAngle

    if (requiresHipVisibility && !hipVisible) {
      setStatus({ text: 'покажите себя полностью', color: 'var(--status-warning-default)' })
    } else if (!poseReady) {
      setStatus({
        text: positionHint,
        color: 'var(--status-danger-default)',
      })
    } else if (isHoldMode) {
      setStatus({ text: 'держите позицию', color: 'var(--status-success-default)' })
    } else if (sessionActiveRef.current) {
      setStatus({ text: 'держите позицию', color: 'var(--status-success-default)' })
    } else {
      setStatus({ text: `угол: ${Math.round(angle)}°`, color: 'var(--accent-default)' })
    }

    if (!isHoldMode) {
      const maybeCountRep = (angleValue: number) => {
        const isDown = config!.isInverted ? angleValue > config!.downAngle : angleValue < config!.downAngle
        const isUp = config!.isInverted ? angleValue < config!.upAngle : angleValue > config!.upAngle

        if (isDown && posePhaseRef.current === 'up') {
          posePhaseRef.current = 'down'
        } else if (isUp && posePhaseRef.current === 'down') {
          posePhaseRef.current = 'up'
          const now = Date.now()
          if (sessionActiveRef.current && poseReady && now - lastRepTimeRef.current >= 500) {
            lastRepTimeRef.current = now
            countRef.current += 1
            setCount(countRef.current)
          }
        }
      }

      // Reps mode: generic angle-based counting
      maybeCountRep(angle)
    } else if (sessionActiveRef.current) {
      // Hold mode: count seconds while pose is held
      if (poseReady) {
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
  }, [cameraStatusText.searching, config, isHoldMode, positionHint, updatePoseReadyForTracking])

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
      setStatus({ text: 'включение камеры', color: 'var(--status-warning-default)' })
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
      setStatus({ text: cameraStatusText.ready, color: 'var(--status-success-default)' })
      await loadMP()
    } catch (e) {
      console.error(e)
      setStatus({ text: 'нет доступа к камере', color: 'var(--status-danger-default)' })
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    poseReadyForTrackingRef.current = false
    setPoseReadyForTracking(false)
    setStatus({ text: cameraStatusText.off, color: 'var(--status-warning-default)' })
    smoothedLandmarksRef.current = null
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function startSession() {
    countRef.current = 0
    angleBufferRef.current = []
    smoothedLandmarksRef.current = null
    lastRepTimeRef.current = 0
    holdTimeRef.current = 0
    lastHoldTickRef.current = null
    posePhaseRef.current = 'up'
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
  const showSessionControls = cameraOn
  const counterTextStyle = {
    fontFamily: 'var(--font-family-secondary)',
    fontWeight: 500,
    fontSize: 72,
    lineHeight: '80px',
    textShadow: '0 4px 8px rgba(38,38,38,0.32)',
  } as const
  const elapsedTextStyle = {
    fontFamily: 'var(--font-family-secondary)',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '24px',
    color: 'var(--text-on-accent)',
    textShadow: '0 1px 3px #262626',
  } as const
  const controlButtonLabel = countdown !== null
    ? 'Отмена'
    : !sessionActive
      ? 'Начать сессию'
      : saving
        ? 'Сохраняем...'
        : holding
          ? 'удерживайте...'
          : 'закончить сессию'
  const statusBadgeTone = !cameraOn
    ? { color: 'var(--accent-default)' }
    : status.color === 'var(--status-success-default)'
      ? { color: status.color }
      : { color: 'var(--status-warning-default)' }
  const isIdleCameraState = cameraOn && countdown === null && !sessionActive && !saving
  const displayStatus = isIdleCameraState
    ? {
        text: positionHint,
        color: 'var(--status-warning-default)',
      }
    : {
        text: status.text,
        color: statusBadgeTone.color,
      }
  const showGuidanceOverlay = cameraOn && !sessionActive && !saving
  const showMovementArrow =
    cameraOn &&
    sessionActive &&
    !isHoldMode &&
    !saving &&
    poseReadyForTracking
  const movementArrowName = posePhaseRef.current === 'up' ? 'arrow_down' : 'arrow_up'

  return (
    <div
      className="camera-wrapper mx-auto w-full max-w-[1024px]"
    >

      {/* Camera container — off-state follows reviewed Figma geometry */}
      <div
        className="camera-container relative mx-auto w-full max-w-[1024px] aspect-[3/4] overflow-hidden bg-[#171717] p-4 app-web:aspect-[4/3]"
        style={{
          borderRadius: 0,
          transition: 'none',
        }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
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
          className="absolute left-4 top-4 flex items-center pl-1 pr-2"
          style={{ background: 'var(--surface)', borderRadius: 0 }}
        >
          <span className="flex h-6 items-center justify-center px-1">
            <span className="h-1.5 w-1.5 shrink-0" style={{ background: displayStatus.color }} />
          </span>
          <span className="py-[3px] text-[12px] leading-[18px]" style={{ color: displayStatus.color }}>
            {displayStatus.text === positionHint && positionHintMobile !== positionHint ? (
              <>
                <span className="app-mobile:inline app-web:hidden">{positionHintMobile}</span>
                <span className="hidden app-web:inline">{positionHint}</span>
              </>
            ) : (
              displayStatus.text
            )}
          </span>
        </div>

        {showGuidanceOverlay ? (
          <div
            className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-[var(--accent-default)] px-6 py-4 text-center app-web:left-[112px] app-web:right-[112px] app-web:top-auto app-web:bottom-[112px] app-web:translate-y-0"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="app-mobile:inline text-[16px] font-normal leading-6 tracking-[0] text-[var(--text-on-accent)] app-web:hidden">
              {cameraGuidanceMobile}
            </span>
            <span className="hidden text-[18px] font-medium leading-[26px] tracking-[0] text-[var(--text-on-accent)] app-web:inline">
              {cameraGuidance}
            </span>
          </div>
        ) : null}

        {showMovementArrow ? (
          <div
            className="absolute left-1/2 top-[230px] flex h-10 w-10 -translate-x-1/2 items-center justify-center bg-[var(--surface)] app-web:top-[364px]"
            aria-hidden="true"
          >
            <Icon name={movementArrowName} size={24} style={{ color: 'var(--status-success-default)' }} />
          </div>
        ) : null}

        {/* Counter overlay — bottom center */}
        {cameraOn && (countdown !== null || sessionActive) && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="text-white tabular-nums"
              style={counterTextStyle}
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
                className="tabular-nums"
                style={elapsedTextStyle}
              >
                {fmt(elapsed)}
              </div>
            )}
          </div>
        )}

        {/* Disable camera — top right */}
        {cameraOn && !sessionActive && !saving && (
          <button
            onClick={stopCamera}
            className="absolute right-4 top-4 flex items-center pl-1 pr-2 text-[var(--text-secondary)] transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface)', borderRadius: 0 }}
          >
            <span className="flex h-6 items-center justify-center pr-1">
              <Icon name="photo_camera" size={16} />
            </span>
            <span className="py-[3px] text-[12px] leading-[18px]">отключить камеру</span>
          </button>
        )}

        {/* Enable camera — center */}
        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startCamera}
              className="flex h-[72px] w-[140px] flex-col items-center justify-center bg-[var(--accent-default)] p-3 text-white transition-opacity hover:opacity-80"
              style={{ borderRadius: 0 }}
            >
              <div className="relative shrink-0 p-1">
                <Icon name="photo_camera" size={16} />
              </div>
              <div className="flex items-center justify-center px-[10px] py-[3px]">
                <span className="text-[12px] leading-[18px]">включить камеру</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {showSessionControls ? (
        <div className="mt-4 px-4 app-web:mt-2 app-web:px-0">
          {countdown !== null ? (
            <button
              onClick={cancelCountdown}
              className="h-10 w-full text-[16px] leading-6 font-normal text-[var(--text-primary)] hover:opacity-60 transition-opacity"
              style={{ background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--border-primary-default)' }}
            >
              отмена
            </button>
          ) : !sessionActive ? (
            <button
              onClick={startSession}
              disabled={startDisabled}
              className="h-10 w-full text-[16px] leading-6 font-normal text-white disabled:opacity-40 hover:opacity-85 transition-opacity"
              style={{ background: 'var(--accent-default)' }}
            >
              начать сессию
            </button>
          ) : (
            <button
              data-hold
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              disabled={saving}
              className="relative h-10 w-full overflow-hidden select-none text-[16px] font-normal leading-6 text-white disabled:opacity-40"
              style={{ background: 'var(--accent-default)', touchAction: 'none' }}
            >
              <span
                className="absolute inset-0 bg-white/20 origin-left"
                style={{ transform: `scaleX(${holdProgress})`, transition: 'none' }}
              />
              <span className="relative">{controlButtonLabel}</span>
            </button>
          )}
        </div>
      ) : (
        null
      )}
    </div>
  )
}
