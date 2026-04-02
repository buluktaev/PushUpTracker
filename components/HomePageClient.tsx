'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CreateRoomDisciplineStep,
  CreateRoomNameStep,
  JoinRoomCodeStep,
  NewRoomActionStep,
  ReturningRoomsStep,
  CreateRoomActionStep,
  type CreateRoomAction,
} from '@/components/CreateRoomFlowScreens'
import AuthThemeSync from '@/components/AuthThemeSync'
import { useRooms } from '@/hooks/useRooms'

type FlowStep = 'action' | 'discipline' | 'name' | 'join'

function HomePageContent({ initialProfileName = '' }: { initialProfileName?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms, loaded, addRoom } = useRooms()
  const [mounted, setMounted] = useState(false)
  const [profileName] = useState(initialProfileName)
  const [showNew, setShowNew] = useState(false)
  const [flowStep, setFlowStep] = useState<FlowStep>('action')
  const [newRoomAction, setNewRoomAction] = useState<CreateRoomAction | null>(null)
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null)
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomNameSubmitted, setRoomNameSubmitted] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [roomNameServerError, setRoomNameServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const addMode = searchParams.get('add') === '1'
  const fromRoom = searchParams.get('fromRoom')?.trim().toUpperCase() || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (addMode && rooms.length >= 1) {
      resetNewFlow()
      setShowNew(true)
    }
  }, [addMode, mounted, rooms.length])

  useEffect(() => {
    if (!mounted || !loaded) return
    if (addMode) return
    if (rooms.length !== 1) return

    router.replace(`/room/${rooms[0].roomCode}`)
  }, [addMode, loaded, mounted, rooms, router])

  const showCreateFlow = rooms.length === 0 || showNew
  const showReturningRooms = rooms.length >= 2 && !showNew
  const shouldRedirectToSingleRoom = !addMode && rooms.length === 1
  const greetingName = useMemo(() => {
    const trimmed = profileName.trim()
    return trimmed ? trimmed : undefined
  }, [profileName])

  function resetNewFlow() {
    setFlowStep('action')
    setNewRoomAction(null)
    setSelectedDiscipline(null)
    setRoomName('')
    setJoinCode('')
    setRoomNameSubmitted(false)
    setJoinError('')
    setRoomNameServerError('')
    setLoading(false)
  }

  function handleContinueFromDiscipline() {
    if (!selectedDiscipline) return
    setFlowStep('name')
  }

  function handleContinueFromAction() {
    if (!newRoomAction) return
    setFlowStep(newRoomAction === 'create' ? 'discipline' : 'join')
  }

  function handleExitAddFlow() {
    resetNewFlow()

    if (fromRoom) {
      router.push(`/room/${fromRoom}`)
      return
    }

    setShowNew(false)
  }

  async function handleCreate() {
    setRoomNameSubmitted(true)
    setRoomNameServerError('')

    const trimmedName = roomName.trim()
    if (trimmedName.length < 2 || !selectedDiscipline) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, discipline: selectedDiscipline }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания комнаты')
      }
      router.push(`/room/${data.code}?created=1&name=${encodeURIComponent(trimmedName)}`)
    } catch (error: unknown) {
      setRoomNameServerError(error instanceof Error ? error.message : 'Ошибка создания комнаты')
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) {
      setJoinError('поле обязательно для заполнения')
      return
    }

    setLoading(true)
    setJoinError('')

    try {
      const code = joinCode.trim().toUpperCase()
      const response = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа в комнату')
      }

      let fetchedRoomName = code
      let fetchedDiscipline: string | undefined
      try {
        const roomResponse = await fetch(`/api/rooms/${code}`)
        if (roomResponse.ok) {
          const roomData = await roomResponse.json()
          if (typeof roomData?.name === 'string' && roomData.name.trim()) {
            fetchedRoomName = roomData.name
          }
          if (typeof roomData?.discipline === 'string' && roomData.discipline.trim()) {
            fetchedDiscipline = roomData.discipline
          }
        }
      } catch {}

      addRoom({
        roomCode: code,
        participantId: data.id,
        name: data.name,
        roomName: fetchedRoomName,
        discipline: fetchedDiscipline,
      })

      router.push(`/room/${code}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка входа в комнату'
      setJoinError(message === 'Комната не найдена' ? 'комната не найдена' : message)
      setLoading(false)
    }
  }

  if (!mounted || !loaded) return null
  if (shouldRedirectToSingleRoom) return null

  return (
    <main className="min-h-dvh bg-[var(--bg-surface)]">
      <AuthThemeSync />

      {showReturningRooms ? (
        <ReturningRoomsStep
          profileName={greetingName}
          rooms={rooms.map(room => ({
            roomCode: room.roomCode,
            roomName: room.roomName,
            discipline: room.discipline,
          }))}
          loading={loading}
          onRoomSelect={roomCode => router.push(`/room/${roomCode}`)}
          onCreateNew={() => {
            resetNewFlow()
            setShowNew(true)
          }}
        />
      ) : null}

      {showCreateFlow ? (
        <>
          {flowStep === 'action' ? (
            rooms.length === 0 ? (
              <CreateRoomActionStep
                profileName={greetingName}
                selectedAction={newRoomAction}
                onSelectAction={setNewRoomAction}
                onContinue={handleContinueFromAction}
              />
            ) : (
              <NewRoomActionStep
                selectedAction={newRoomAction}
                loading={loading}
                onSelectAction={setNewRoomAction}
                onContinue={handleContinueFromAction}
                onBack={handleExitAddFlow}
              />
            )
          ) : null}

          {flowStep === 'discipline' ? (
            <CreateRoomDisciplineStep
              selectedDiscipline={selectedDiscipline}
              onSelectDiscipline={setSelectedDiscipline}
              onContinue={handleContinueFromDiscipline}
              onBack={() => {
                setFlowStep('action')
              }}
            />
          ) : null}

          {flowStep === 'name' ? (
            <CreateRoomNameStep
              roomName={roomName}
              submitted={roomNameSubmitted}
              loading={loading}
              serverError={roomNameServerError}
              onChange={value => {
                setRoomName(value)
                if (roomNameServerError) {
                  setRoomNameServerError('')
                }
              }}
              onSubmit={handleCreate}
              onBack={() => {
                setFlowStep('discipline')
                setRoomNameSubmitted(false)
                setRoomNameServerError('')
              }}
            />
          ) : null}

          {flowStep === 'join' ? (
            <JoinRoomCodeStep
              joinCode={joinCode}
              loading={loading}
              error={joinError}
              onChange={value => {
                setJoinCode(value)
                if (joinError) {
                  setJoinError('')
                }
              }}
              onSubmit={handleJoin}
              onBack={() => {
                setJoinError('')
                if (rooms.length === 0 || showNew) {
                  setFlowStep('action')
                } else {
                  handleExitAddFlow()
                }
              }}
            />
          ) : null}
        </>
      ) : null}
    </main>
  )
}

export default function HomePageClient({ initialProfileName = '' }: { initialProfileName?: string }) {
  return (
    <Suspense fallback={null}>
      <HomePageContent initialProfileName={initialProfileName} />
    </Suspense>
  )
}
