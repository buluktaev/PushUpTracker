'use client'

import { useState } from 'react'
import {
  CreateRoomActionStep,
  CreateRoomDisciplineStep,
  CreateRoomNameStep,
  JoinRoomCodeStep,
  NewRoomActionStep,
  ReturningRoomsStep,
} from '@/components/CreateRoomFlowScreens'

interface CreateRoomPreviewProps {
  isMobile?: boolean
  mode:
    | 'action-base'
    | 'action-create-selected'
    | 'action-join-selected'
    | 'post-auth-empty'
    | 'post-auth-returning'
    | 'post-auth-new-room'
    | 'post-auth-new-room-create-selected'
    | 'post-auth-new-room-join-selected'
    | 'discipline-base'
    | 'discipline-selected'
    | 'name-empty'
    | 'name-required'
    | 'name-too-short'
    | 'name-filled'
    | 'name-loading'
    | 'join-empty'
    | 'join-required'
    | 'join-not-found'
    | 'join-filled'
    | 'join-loading'
}

export function CreateRoomPreview({
  isMobile = false,
  mode,
}: CreateRoomPreviewProps) {
  const [roomName, setRoomName] = useState(
    mode === 'name-filled' || mode === 'name-loading' ? 'утренняя команда' : mode === 'name-too-short' ? 'я' : '',
  )
  const [joinCode, setJoinCode] = useState(
    mode === 'join-filled' || mode === 'join-loading' || mode === 'join-not-found' ? 'NT92MX' : '',
  )

  if (mode === 'action-base') {
    return <CreateRoomActionStep isMobile={isMobile} profileName="Алексей" />
  }

  if (mode === 'post-auth-empty') {
    return <CreateRoomActionStep isMobile={isMobile} profileName="Алексей" />
  }

  if (mode === 'post-auth-returning') {
    return (
      <ReturningRoomsStep
        isMobile={isMobile}
        profileName="Алексей"
        rooms={[
          { roomCode: 'AB12CD', roomName: 'Утренняя команда', discipline: 'pushups' },
          { roomCode: 'EF34GH', roomName: 'Турник во дворе', discipline: 'pullups' },
        ]}
      />
    )
  }

  if (mode === 'post-auth-new-room') {
    return <NewRoomActionStep isMobile={isMobile} />
  }

  if (mode === 'post-auth-new-room-create-selected') {
    return <NewRoomActionStep isMobile={isMobile} selectedAction="create" />
  }

  if (mode === 'post-auth-new-room-join-selected') {
    return <NewRoomActionStep isMobile={isMobile} selectedAction="join" />
  }

  if (mode === 'action-create-selected') {
    return (
      <CreateRoomActionStep
        isMobile={isMobile}
        profileName="Алексей"
        selectedAction="create"
      />
    )
  }

  if (mode === 'action-join-selected') {
    return (
      <CreateRoomActionStep
        isMobile={isMobile}
        profileName="Алексей"
        selectedAction="join"
      />
    )
  }

  if (mode === 'discipline-base') {
    return <CreateRoomDisciplineStep isMobile={isMobile} />
  }

  if (mode === 'discipline-selected') {
    return <CreateRoomDisciplineStep isMobile={isMobile} selectedDiscipline="pushups" />
  }

  if (mode === 'join-empty') {
    return <JoinRoomCodeStep isMobile={isMobile} joinCode="" />
  }

  if (mode === 'join-required') {
    return (
      <JoinRoomCodeStep
        isMobile={isMobile}
        joinCode=""
        error="поле обязательно для заполнения"
      />
    )
  }

  if (mode === 'join-not-found') {
    return (
      <JoinRoomCodeStep
        isMobile={isMobile}
        joinCode={joinCode}
        error="комната не найдена"
        onChange={setJoinCode}
      />
    )
  }

  if (mode === 'join-filled') {
    return <JoinRoomCodeStep isMobile={isMobile} joinCode={joinCode} onChange={setJoinCode} />
  }

  if (mode === 'join-loading') {
    return <JoinRoomCodeStep isMobile={isMobile} joinCode={joinCode} loading onChange={setJoinCode} />
  }

  return (
    <CreateRoomNameStep
      isMobile={isMobile}
      roomName={roomName}
      submitted={mode === 'name-required' || mode === 'name-too-short'}
      loading={mode === 'name-loading'}
      onChange={setRoomName}
    />
  )
}
