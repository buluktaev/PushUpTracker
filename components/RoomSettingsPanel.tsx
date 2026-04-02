'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import TextButton from '@/components/TextButton'

interface ParticipantItem {
  id: string
  name: string
}

interface RoomSettingsPanelProps {
  roomName: string
  renameValue: string
  settingsError?: string
  deletePasswordError?: string
  settingsLoading?: boolean
  participants: ParticipantItem[]
  currentParticipantId?: string
  showDeleteConfirm: boolean
  deleteRoomName: string
  deletePassword: string
  busyAction?: 'delete' | null
  onRenameChange?: (value: string) => void
  onRenameSubmit?: () => void
  onKick?: (participantId: string) => void
  onShowDeleteConfirm?: () => void
  onHideDeleteConfirm?: () => void
  onDeleteRoomNameChange?: (value: string) => void
  onDeletePasswordChange?: (value: string) => void
  onDelete?: () => void
}

function SettingsRow({
  participant,
  isOwner,
  isLast,
  isPendingKick,
  disabled = false,
  onShowKickConfirm,
  onHideKickConfirm,
  onKick,
}: {
  participant: ParticipantItem
  isOwner: boolean
  isLast: boolean
  isPendingKick: boolean
  disabled?: boolean
  onShowKickConfirm?: (participantId: string) => void
  onHideKickConfirm?: () => void
  onKick?: (participantId: string) => void
}) {
  return (
    <div
      className="flex items-start gap-3 p-3"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
    >
      <div className="min-w-0 flex-1 text-[16px] font-normal leading-[24px] text-[var(--text-primary)]">
        {participant.name}
      </div>
      {isOwner ? (
        <span
          className="shrink-0 text-[16px] font-normal leading-[24px] tracking-[0]"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family-primary)' }}
        >
          создатель комнаты
        </span>
      ) : isPendingKick ? (
        <div className="flex shrink-0 items-end gap-4">
          <TextButton size="compact" variant="danger" onClick={() => onKick?.(participant.id)} disabled={disabled}>
            да, исключить
          </TextButton>
          <TextButton size="compact" variant="secondary" onClick={onHideKickConfirm} disabled={disabled}>
            нет, оставить
          </TextButton>
        </div>
      ) : (
        <TextButton
          size="compact"
          variant="secondary"
          onClick={() => onShowKickConfirm?.(participant.id)}
          disabled={disabled}
        >
          исключить
        </TextButton>
      )}
    </div>
  )
}

export default function RoomSettingsPanel({
  roomName,
  renameValue,
  settingsError,
  deletePasswordError,
  settingsLoading = false,
  participants,
  currentParticipantId,
  showDeleteConfirm,
  deleteRoomName,
  deletePassword,
  busyAction = null,
  onRenameChange,
  onRenameSubmit,
  onKick,
  onShowDeleteConfirm,
  onHideDeleteConfirm,
  onDeleteRoomNameChange,
  onDeletePasswordChange,
  onDelete,
}: RoomSettingsPanelProps) {
  const [pendingKickParticipantId, setPendingKickParticipantId] = useState<string | null>(null)
  const deleteConfirmActionsRef = useRef<HTMLDivElement | null>(null)
  const deleteBusy = busyAction === 'delete'
  const renameDirty = renameValue.trim().length > 0 && renameValue.trim() !== roomName
  const deleteDisabled = deleteBusy || deleteRoomName !== roomName || deletePassword.length === 0

  useEffect(() => {
    if (!pendingKickParticipantId) return
    if (!participants.some(participant => participant.id === pendingKickParticipantId)) {
      setPendingKickParticipantId(null)
    }
  }, [participants, pendingKickParticipantId])

  useEffect(() => {
    if (!showDeleteConfirm || !deleteConfirmActionsRef.current) return

    let rafId = 0
    let nestedRafId = 0
    rafId = window.requestAnimationFrame(() => {
      nestedRafId = window.requestAnimationFrame(() => {
        deleteConfirmActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    })

    return () => {
      window.cancelAnimationFrame(rafId)
      window.cancelAnimationFrame(nestedRafId)
    }
  }, [showDeleteConfirm])

  return (
    <div className="mx-auto flex w-full flex-1 flex-col pb-4 app-web:max-w-[720px] app-web:pb-8">
      {settingsError ? (
        <div
          className="mb-4 px-4 py-3 text-sm text-[var(--status-danger-default)]"
          style={{ border: '1px solid var(--status-danger-default)', background: 'var(--surface)' }}
        >
          {settingsError}
        </div>
      ) : null}

      <div
        className="flex items-end gap-4 p-4"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-primary)' }}
      >
        <div className="min-w-0 flex-1">
          <Input
            label="Название комнаты"
            value={renameValue}
            required
            onChange={event => onRenameChange?.(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                onRenameSubmit?.()
              }
            }}
          />
        </div>
        <div className="w-[105px] shrink-0">
          <Button
            variant="primary"
            onClick={onRenameSubmit}
            disabled={settingsLoading || !renameDirty}
          >
            сохранить
          </Button>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col pb-14">
        <div className="py-[3px] text-[12px] font-normal leading-[18px] text-[var(--text-secondary)]">участники</div>
        <div
          className="min-h-0 flex-1 overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="h-full overflow-y-auto">
            {participants.map((participant, index) => (
              <SettingsRow
                key={participant.id}
                participant={participant}
                isOwner={participant.id === currentParticipantId}
                isPendingKick={participant.id === pendingKickParticipantId}
                isLast={index === participants.length - 1}
                disabled={settingsLoading}
                onShowKickConfirm={setPendingKickParticipantId}
                onHideKickConfirm={() => setPendingKickParticipantId(null)}
                onKick={participantId => {
                  setPendingKickParticipantId(null)
                  onKick?.(participantId)
                }}
              />
            ))}
            {participants.length === 0 ? (
              <div className="px-3 py-3 text-[16px] font-normal leading-[24px] text-[var(--text-secondary)]">
                Пока никого нет
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="shrink-0 flex flex-col items-start p-4"
        style={{ border: '1px solid var(--status-danger-default)', background: 'var(--surface)' }}
      >
        <div className="py-[3px] text-[12px] font-normal leading-[18px] text-[var(--text-secondary)]">
          опасная зона
        </div>

        {!showDeleteConfirm ? (
          <>
            <div className="py-px text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
              Удаление комнаты удалит всех участников и результаты без возможности восстановления.
            </div>
            <div className="pt-2">
              <TextButton size="compact" variant="danger" onClick={onShowDeleteConfirm}>
                удалить комнату
              </TextButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col gap-2 py-px text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
              <p>Удаление комнаты удалит всех участников и результаты без возможности восстановления.</p>
              <p>Для удаления введи точное название комнаты и пароль от аккаунта.</p>
            </div>
            <div className="w-full pt-4">
              <Input
                label="Название комнаты"
                value={deleteRoomName}
                placeholder="Введите название комнаты"
                required
                onChange={event => onDeleteRoomNameChange?.(event.target.value)}
              />
            </div>
            <div className="w-full pt-4">
              <Input
                label="Пароль"
                type="password"
                value={deletePassword}
                placeholder="Введите пароль"
                required
                error={Boolean(deletePasswordError)}
                caption={deletePasswordError}
                onChange={event => onDeletePasswordChange?.(event.target.value)}
              />
            </div>
            <div
              ref={deleteConfirmActionsRef}
              className="flex w-full flex-col gap-2 pt-8 scroll-mb-24 app-web:flex-row app-web:scroll-mb-8"
            >
              <div className="min-w-0 flex-1">
                <Button variant="secondary" onClick={onHideDeleteConfirm} disabled={deleteBusy}>
                  отмена
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <Button
                  variant="primary"
                  onClick={onDelete}
                  disabled={deleteDisabled}
                  loading={deleteBusy}
                >
                  удалить комнату
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
