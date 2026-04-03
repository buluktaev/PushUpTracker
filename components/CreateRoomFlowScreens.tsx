'use client'

import Button from '@/components/Button'
import ChoiceCard from '@/components/ChoiceCard'
import IconButton from '@/components/IconButton'
import Input from '@/components/Input'
import RevealSection from '@/components/RevealSection'
import SelectCard from '@/components/SelectCard'
import { exerciseConfigs, getExerciseConfig } from '@/lib/exerciseConfigs'
import { ROOM_CODE_LENGTH } from '@/lib/roomCode'

export type CreateRoomAction = 'create' | 'join'
export interface RoomListItem {
  roomCode: string
  roomName: string
  discipline?: string
}
export type CreateRoomScreenMode =
  | 'post-auth-empty'
  | 'post-auth-returning'
  | 'post-auth-new-room'
  | 'post-auth-new-room-create-selected'
  | 'post-auth-new-room-join-selected'
  | 'action-base'
  | 'action-create-selected'
  | 'action-join-selected'
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

export const CREATE_ROOM_DISCIPLINES = exerciseConfigs.map(config => ({
  slug: config.slug,
  title: config.name === 'Сгибание на бицепс' ? 'Сгибания на бицепс' : config.name,
  icon: config.icon,
}))

const ACTION_OPTIONS = [
  { value: 'create' as const, title: 'создать комнату', icon: 'plus' },
  { value: 'join' as const, title: 'войти в комнату', icon: 'join' },
]

function shellWidth(isMobile: boolean) {
  return isMobile ? 'w-[calc(100%-32px)]' : 'w-[400px] app-mobile:w-[calc(100%-32px)]'
}

function topPadding(isMobile: boolean) {
  return isMobile ? 'pt-[144px]' : 'pt-[200px] app-mobile:pt-[144px]'
}

function viewportHeight(isMobile: boolean) {
  return isMobile ? 'min-h-[812px]' : 'min-h-[900px] app-mobile:min-h-dvh'
}

function BrandRow() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
        <img src="/icon.svg" width={16} height={16} alt="" />
      </div>
      <span className="text-[12px] font-normal leading-[18px] text-[var(--text-secondary)]">
        Selecty Wellness
      </span>
    </div>
  )
}

function getRoomCardIcon(discipline?: string) {
  return getExerciseConfig(discipline ?? '')?.icon ?? 'fitness_center'
}

function StepContainer({
  isMobile,
  children,
  back,
  backDisabled = false,
}: {
  isMobile?: boolean
  children: React.ReactNode
  back?: () => void
  backDisabled?: boolean
}) {
  return (
    <main className={`relative flex ${viewportHeight(Boolean(isMobile))} flex-col bg-[var(--bg-surface)]`}>
      {back ? (
        <div className="absolute left-4 top-4 z-10 app-web:left-6 app-web:top-6">
          <IconButton icon="arrow_left" label="Назад" variant="secondary" disabled={backDisabled} onClick={back} />
        </div>
      ) : null}

      <div className={`mx-auto ${shellWidth(Boolean(isMobile))} ${topPadding(Boolean(isMobile))}`}>
        {children}
      </div>
    </main>
  )
}

export function CreateRoomActionStep({
  isMobile = false,
  profileName,
  selectedAction,
  onSelectAction,
  onContinue,
}: {
  isMobile?: boolean
  profileName?: string
  selectedAction?: CreateRoomAction | null
  onSelectAction?: (value: CreateRoomAction) => void
  onContinue?: () => void
}) {
  const titleName = profileName ? profileName : '{Имя}'

  return (
    <StepContainer isMobile={isMobile}>
      <div className="flex flex-col gap-2">
        <RevealSection delay={0}>
          <BrandRow />
        </RevealSection>

        <RevealSection delay={100}>
          <h1 className="text-[24px] font-medium leading-[32px] text-[var(--text-primary)]">
            <span className="block">{`привет, ${titleName}!`}</span>
            <span className="block">с чего начнётся твоё движение?</span>
          </h1>
        </RevealSection>

        <RevealSection delay={200} className="flex flex-col gap-2 pt-4">
          {ACTION_OPTIONS.map(option => (
            <ChoiceCard
              key={option.value}
              title={option.title}
              icon={option.icon}
              selected={selectedAction === option.value}
              onClick={() => onSelectAction?.(option.value)}
            />
          ))}
        </RevealSection>
      </div>

      {selectedAction ? (
        <RevealSection delay={300} className="pt-8">
          <Button type="button" onClick={onContinue}>
            Продолжить
          </Button>
        </RevealSection>
      ) : null}
    </StepContainer>
  )
}

export function ReturningRoomsStep({
  isMobile = false,
  profileName,
  rooms,
  loading = false,
  onRoomSelect,
  onCreateNew,
}: {
  isMobile?: boolean
  profileName?: string
  rooms: RoomListItem[]
  loading?: boolean
  onRoomSelect?: (roomCode: string) => void
  onCreateNew?: () => void
}) {
  const titleName = profileName?.trim() || '{Имя}'

  return (
    <StepContainer isMobile={isMobile}>
      <div className="flex flex-col gap-2">
        <RevealSection delay={0}>
          <BrandRow />
        </RevealSection>

        <RevealSection delay={100} className="flex w-full flex-col">
          <div className="h-[32px]">
            <h1 className="text-[24px] font-medium leading-[32px] text-[var(--text-primary)]">
              {`с возвращением, ${titleName}!`}
            </h1>
          </div>

          <div className="w-full pb-[2px] pt-2">
            <p className="text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
              Какие планы на сегодня?
            </p>
          </div>
        </RevealSection>

        <RevealSection delay={200} className="flex flex-col gap-2 pt-4">
          {rooms.map(room => (
            <SelectCard
              key={room.roomCode}
              title={room.roomName}
              icon={getRoomCardIcon(room.discipline)}
              disabled={loading}
              onClick={() => onRoomSelect?.(room.roomCode)}
            />
          ))}
        </RevealSection>

        <RevealSection delay={300} className="pt-8">
          <Button type="button" variant="secondary" disabled={loading} onClick={onCreateNew}>
            Новая комната
          </Button>
        </RevealSection>
      </div>
    </StepContainer>
  )
}

export function NewRoomActionStep({
  isMobile = false,
  selectedAction,
  loading = false,
  onSelectAction,
  onContinue,
  onBack,
}: {
  isMobile?: boolean
  selectedAction?: CreateRoomAction | null
  loading?: boolean
  onSelectAction?: (value: CreateRoomAction) => void
  onContinue?: () => void
  onBack?: () => void
}) {
  return (
    <StepContainer isMobile={isMobile} back={onBack} backDisabled={loading}>
      <div className="flex flex-col gap-2">
        <RevealSection delay={0}>
          <BrandRow />
        </RevealSection>

        <RevealSection delay={100} className="flex flex-col gap-2 pt-4">
          {ACTION_OPTIONS.map(option => (
            <ChoiceCard
              key={option.value}
              title={option.title}
              icon={option.icon}
              selected={selectedAction === option.value}
              onClick={() => onSelectAction?.(option.value)}
            />
          ))}
        </RevealSection>
      </div>

      {selectedAction ? (
        <RevealSection delay={200} className="pt-8">
          <Button type="button" disabled={loading} onClick={onContinue}>
            Продолжить
          </Button>
        </RevealSection>
      ) : null}
    </StepContainer>
  )
}

export function CreateRoomDisciplineStep({
  isMobile = false,
  selectedDiscipline,
  onSelectDiscipline,
  onContinue,
  onBack,
}: {
  isMobile?: boolean
  selectedDiscipline?: string | null
  onSelectDiscipline?: (value: string) => void
  onContinue?: () => void
  onBack?: () => void
}) {
  return (
    <StepContainer isMobile={isMobile} back={onBack}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <RevealSection delay={0}>
            <BrandRow />
          </RevealSection>

          <RevealSection delay={100} className="flex flex-col items-start">
            <div className="w-full">
              <h1 className="text-[24px] font-medium leading-[32px] text-[var(--text-primary)]">
                выберите дисциплину комнаты
              </h1>
            </div>
            <div className="w-full pb-[2px] pt-2">
              <p className="text-[14px] font-normal leading-[22px] text-[var(--text-secondary)]">
                Одна комната - одна дисциплина
              </p>
            </div>
          </RevealSection>

          <RevealSection delay={200} className="flex flex-col gap-2 pt-4">
            {CREATE_ROOM_DISCIPLINES.map(option => (
              <ChoiceCard
                key={option.slug}
                title={option.title}
                icon={option.icon}
                selected={selectedDiscipline === option.slug}
                onClick={() => onSelectDiscipline?.(option.slug)}
              />
            ))}
          </RevealSection>
        </div>

        {selectedDiscipline ? (
          <RevealSection delay={300} className="pt-8">
            <Button type="button" onClick={onContinue}>
              Продолжить
            </Button>
          </RevealSection>
        ) : null}
      </div>
    </StepContainer>
  )
}

export function CreateRoomNameStep({
  isMobile = false,
  roomName,
  submitted = false,
  loading = false,
  serverError,
  onChange,
  onSubmit,
  onBack,
}: {
  isMobile?: boolean
  roomName: string
  submitted?: boolean
  loading?: boolean
  serverError?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  onBack?: () => void
}) {
  const trimmed = roomName.trim()
  const requiredError = submitted && trimmed.length === 0
  const shortError = submitted && trimmed.length > 0 && trimmed.length < 2
  const caption = requiredError
    ? 'поле обязательно для заполнения'
    : shortError
      ? 'введите минимум 2 символа'
      : serverError || undefined

  return (
    <StepContainer isMobile={isMobile} back={onBack} backDisabled={loading}>
      <div className="flex flex-col gap-2">
        <RevealSection delay={0}>
          <BrandRow />
        </RevealSection>

        <RevealSection delay={100}>
          <h1 className="text-[24px] font-medium leading-[32px] text-[var(--text-primary)]">
            как назовете комнату?
          </h1>
        </RevealSection>

        <RevealSection delay={200} className="pt-4">
          <Input
            label="название комнаты"
            value={roomName}
            placeholder="введите название"
            required
            autoFocus
            disabled={loading}
            error={Boolean(caption)}
            caption={caption}
            showCaption={Boolean(caption)}
            onChange={event => onChange?.(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSubmit?.()
              }
            }}
          />
        </RevealSection>
      </div>

      <RevealSection delay={300} className="pt-8">
        <Button type="button" loading={loading} onClick={onSubmit}>
          Создать
        </Button>
      </RevealSection>
    </StepContainer>
  )
}

export function JoinRoomCodeStep({
  isMobile = false,
  joinCode,
  loading = false,
  error,
  onChange,
  onSubmit,
  onBack,
}: {
  isMobile?: boolean
  joinCode: string
  loading?: boolean
  error?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  onBack?: () => void
}) {
  return (
    <StepContainer isMobile={isMobile} back={onBack} backDisabled={loading}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <RevealSection delay={0}>
            <BrandRow />
          </RevealSection>

          <RevealSection delay={100}>
            <h1 className="text-[24px] font-medium leading-[32px] text-[var(--text-primary)]">
              присоединение к комнате
            </h1>
          </RevealSection>

          <RevealSection delay={200} className="pt-4">
            <Input
              label="код приглашения"
              value={joinCode}
              placeholder="введите код"
              textVariant="code"
              maxLength={ROOM_CODE_LENGTH}
              required
              disabled={loading}
              error={Boolean(error)}
              caption={error}
              showCaption={Boolean(error)}
              onChange={event => onChange?.(event.target.value.toUpperCase())}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSubmit?.()
                }
              }}
            />
          </RevealSection>
        </div>

        <RevealSection delay={300} className="pt-8">
          <Button type="button" loading={loading} onClick={onSubmit}>
            Присоединиться
          </Button>
        </RevealSection>
      </div>
    </StepContainer>
  )
}
