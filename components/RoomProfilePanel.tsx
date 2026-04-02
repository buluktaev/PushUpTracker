'use client'

import TextButton from '@/components/TextButton'

interface RoomProfilePanelProps {
  profileName?: string | null
  profileEmail?: string | null
  roomName: string
  roleLabel: string
  isOwner: boolean
  actionError?: string | null
  showLogoutConfirm: boolean
  showLeaveConfirm: boolean
  busyAction?: 'logout' | 'leave' | null
  onShowLogoutConfirm?: () => void
  onHideLogoutConfirm?: () => void
  onLogout?: () => void
  onShowLeaveConfirm?: () => void
  onHideLeaveConfirm?: () => void
  onLeave?: () => void
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="w-full font-normal text-[12px] leading-[18px] text-[var(--text-secondary)]">{label}</div>
      <div className="w-full font-normal text-[16px] leading-[24px] text-[var(--text-primary)]">{value}</div>
    </div>
  )
}

export default function RoomProfilePanel({
  profileName,
  profileEmail,
  roomName,
  roleLabel,
  isOwner,
  actionError,
  showLogoutConfirm,
  showLeaveConfirm,
  busyAction = null,
  onShowLogoutConfirm,
  onHideLogoutConfirm,
  onLogout,
  onShowLeaveConfirm,
  onHideLeaveConfirm,
  onLeave,
}: RoomProfilePanelProps) {
  const safeName = profileName?.trim() || '—'
  const safeEmail = profileEmail?.trim() || '—'

  return (
    <div className="mx-auto flex w-full flex-1 flex-col app-web:max-w-[720px] app-web:pb-8">
      <div
        className="grid gap-2 p-4 app-web:grid-cols-2"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-primary)' }}
      >
        <ProfileField label="имя" value={safeName} />
        <ProfileField label="электронная почта" value={safeEmail} />
        <ProfileField label="комната" value={roomName} />
        <ProfileField label="роль" value={roleLabel} />
      </div>

      {actionError ? (
        <div
          className="mt-4 px-4 py-3 text-sm text-[var(--status-danger-default)]"
          style={{ border: '1px solid var(--status-danger-default)', background: 'var(--surface)' }}
        >
          {actionError}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-4">
        <div
          className="flex flex-col items-start p-4"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="py-px text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
            Выход завершит текущую сессию, но комнаты и данные сохранятся
          </div>
          <div className="flex items-start gap-4 pt-2">
            {showLogoutConfirm ? (
              <>
                <TextButton size="compact" variant="danger" onClick={onLogout} disabled={busyAction === 'logout'}>
                  да, выйти
                </TextButton>
                <TextButton size="compact" variant="secondary" onClick={onHideLogoutConfirm} disabled={busyAction === 'logout'}>
                  нет, остаться
                </TextButton>
              </>
            ) : (
              <TextButton size="compact" variant="danger" onClick={onShowLogoutConfirm} disabled={busyAction === 'logout'}>
                выйти из профиля
              </TextButton>
            )}
          </div>
        </div>

        {!isOwner ? (
          <div
            className="flex flex-col items-start p-4"
            style={{ border: '1px solid var(--status-danger-default)', background: 'var(--surface)' }}
          >
            <div className="py-[3px] text-[12px] font-normal leading-[18px] text-[var(--text-secondary)]">
              опасная зона
            </div>
            <div className="py-px text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
              Покидая комнату вы потеряете свои показатели без возможности восстановления
            </div>
            <div className={`flex items-start pt-2 ${showLeaveConfirm ? 'gap-4' : ''}`}>
              {showLeaveConfirm ? (
                <>
                  <TextButton size="compact" variant="danger" onClick={onLeave} disabled={busyAction === 'leave'}>
                    Да, покинуть
                  </TextButton>
                  <TextButton size="compact" variant="secondary" onClick={onHideLeaveConfirm} disabled={busyAction === 'leave'}>
                    Нет, остаться
                  </TextButton>
                </>
              ) : (
                <TextButton size="compact" variant="danger" onClick={onShowLeaveConfirm} disabled={busyAction === 'leave'}>
                  Покинуть комнату
                </TextButton>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
