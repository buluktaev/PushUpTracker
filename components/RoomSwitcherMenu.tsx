'use client'

import Icon from '@/components/Icon'
import TextButton from '@/components/TextButton'

interface RoomSwitcherRoom {
  roomCode: string
  roomName: string
}

interface RoomSwitcherMenuProps {
  rooms: RoomSwitcherRoom[]
  currentRoomCode: string
  copiedRoomCode?: string | null
  onCopyRoomCode?: (roomCode: string) => void
  onSelectRoom?: (roomCode: string) => void
  onAddRoom?: () => void
  addRoomLabel?: string
  currentTagLabel?: string
  IconComponent?: React.ComponentType<{ name: string; size?: number }>
}

export default function RoomSwitcherMenu({
  rooms,
  currentRoomCode,
  copiedRoomCode = null,
  onCopyRoomCode,
  onSelectRoom,
  onAddRoom,
  addRoomLabel = 'добавить комнату',
  currentTagLabel = 'текущая',
  IconComponent = Icon,
}: RoomSwitcherMenuProps) {
  return (
    <div
      className="fixed left-4 right-4 top-[57px] z-50 animate-pop-in p-1 app-web:absolute app-web:top-full app-web:left-0 app-web:right-auto app-web:mt-1 app-web:w-[280px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col">
        {rooms.map(room => {
          const isCurrent = room.roomCode === currentRoomCode

          return (
            <div
              key={room.roomCode}
              className={`flex items-stretch ${isCurrent ? 'bg-[var(--surface-dim)]' : 'transition-colors hover:bg-[var(--surface-dim)]'}`}
            >
              {isCurrent ? (
                <div className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="min-w-0 truncate text-[16px] font-normal leading-[24px] tracking-[0]"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-family-primary)' }}
                    >
                      {room.roomName}
                    </span>
                    <span
                      className="shrink-0 text-[14px] font-normal leading-[22px] tracking-[0]"
                      style={{ color: 'var(--accent-accent-default)', fontFamily: 'var(--font-family-primary)' }}
                    >
                      {currentTagLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectRoom?.(room.roomCode)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 text-left"
                >
                  <span
                    className="min-w-0 truncate text-[16px] font-normal leading-[24px] tracking-[0]"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-family-primary)' }}
                  >
                    {room.roomName}
                  </span>
                </button>
              )}

              <div className="flex shrink-0 items-center gap-2 pl-4 pr-2 py-3">
                <span
                  className="shrink-0 text-[12px] font-normal leading-[18px] tracking-[0]"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family-secondary)' }}
                >
                  {room.roomCode}
                </span>
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    onCopyRoomCode?.(room.roomCode)
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center"
                  aria-label="скопировать код"
                >
                  <span className="relative inline-flex h-4 w-4 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                        copiedRoomCode === room.roomCode
                          ? 'opacity-0 scale-[0.25] blur-[4px]'
                          : 'opacity-100 scale-100 blur-0'
                      }`}
                      style={{ color: 'var(--icon-default)' }}
                    >
                      <IconComponent name="content_copy" size={16} />
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                        copiedRoomCode === room.roomCode
                          ? 'opacity-100 scale-100 blur-0'
                          : 'opacity-0 scale-[0.25] blur-[4px]'
                      }`}
                      style={{ color: 'var(--status-success-default)' }}
                    >
                      <IconComponent name="check" size={16} />
                    </span>
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <div className="py-1">
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
        <div className="px-3">
          <TextButton
            variant="primary"
            icon="add"
            onClick={onAddRoom}
            className="justify-start"
          >
            {addRoomLabel}
          </TextButton>
        </div>
      </div>
    </div>
  )
}
