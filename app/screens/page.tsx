'use client'

import { useState, type ComponentProps } from 'react'
import { notFound } from 'next/navigation'
import { RegisterPreview } from '@/app/design-preview/previews/RegisterPreview'
import { RegisterNamePreview } from '@/app/design-preview/previews/RegisterNamePreview'
import { VerifyEmailPreview } from '@/app/design-preview/previews/VerifyEmailPreview'
import { ConfirmEmailPreview } from '@/app/design-preview/previews/ConfirmEmailPreview'
import { WelcomePreview } from '@/app/design-preview/previews/WelcomePreview'
import { AppLoadingPreview } from '@/app/design-preview/previews/AppLoadingPreview'
import { CreateRoomPreview } from '@/app/design-preview/previews/CreateRoomPreview'

type ThemeMode = 'light' | 'dark'

const REGISTER_SCREEN_SECTIONS = [
  {
    id: 'register-empty',
    title: '02 - Register',
    description: 'Empty registration screen rendered with system components for desktop web and mobile PWA.',
    mode: 'empty' as const,
  },
  {
    id: 'register-required-validation',
    title: '03 - Register Required Validation',
    description: 'Validation state after pressing submit with both required fields left empty.',
    mode: 'required-validation' as const,
  },
  {
    id: 'register-filled',
    title: '04 - Register Filled Fields',
    description: 'Filled form state with valid email and hidden password.',
    mode: 'filled' as const,
  },
  {
    id: 'register-invalid-email',
    title: '05 - Register Invalid Email Format',
    description: 'Email format validation state for an incorrectly entered email address.',
    mode: 'invalid-email-format' as const,
  },
  {
    id: 'register-email-exists',
    title: '06 - Register Existing User',
    description: 'Server validation state when a user with the same email already exists.',
    mode: 'email-exists' as const,
  },
  {
    id: 'register-password-visible',
    title: '07 - Register Password Visible',
    description: 'Password visibility toggled on with the same filled form layout.',
    mode: 'password-visible' as const,
  },
  {
    id: 'register-loading',
    title: '08 - Register Loading',
    description: 'Submission loading state with the form already filled.',
    mode: 'loading' as const,
  },
] satisfies Array<{
  id: string
  title: string
  description: string
  mode: ComponentProps<typeof RegisterPreview>['mode']
}>

const REGISTER_NAME_SCREEN_SECTIONS = [
  {
    id: 'register-name-empty',
    title: '15 - Register Name Empty',
    description: 'Second registration step with an empty name field.',
    mode: 'empty' as const,
  },
  {
    id: 'register-name-required',
    title: '16 - Register Name Required Validation',
    description: 'Name step after pressing continue with an empty required field.',
    mode: 'required-validation' as const,
  },
  {
    id: 'register-name-too-short',
    title: '17 - Register Name Too Short',
    description: 'Name step with fewer than two characters entered.',
    mode: 'too-short' as const,
  },
  {
    id: 'register-name-filled',
    title: '18 - Register Name Filled',
    description: 'Valid filled name state for the second registration step.',
    mode: 'filled' as const,
  },
] satisfies Array<{
  id: string
  title: string
  description: string
  mode: ComponentProps<typeof RegisterNamePreview>['mode']
}>

const VERIFY_EMAIL_SECTIONS = [
  {
    id: 'register-verify-email-cooldown',
    title: '09 - Register Verify Email',
    description: 'Email confirmation waiting screen shown right after submitting registration.',
  },
  {
    id: 'register-verify-email-available',
    title: '10 - Register Verify Email Resend Available',
    description: 'Email confirmation screen when resend becomes available again.',
  },
  {
    id: 'register-verify-email-attempts-exceeded',
    title: '11 - Register Verify Email Attempts Exceeded',
    description: 'Email confirmation screen after the resend attempt limit is reached.',
  },
  {
    id: 'register-confirm-pending',
    title: '12 - Register Confirm Pending',
    description: 'Transition screen shown after clicking the confirmation link in email while verification is in progress.',
    mode: 'pending' as const,
  },
  {
    id: 'register-confirm-error',
    title: '13 - Register Confirm Error',
    description: 'Confirmation error state when the email link is invalid, expired, or already used.',
    mode: 'error' as const,
  },
] satisfies Array<{
  id: string
  title: string
  description: string
  mode?: ComponentProps<typeof ConfirmEmailPreview>['mode']
}>

const CREATE_ROOM_SECTIONS = [
  {
    id: 'post-auth-empty',
    title: '19 - Post Auth Empty',
    description: 'Экран после авторизации для пользователя без доступных комнат.',
    mode: 'post-auth-empty' as const,
  },
  {
    id: 'post-auth-returning',
    title: '20 - Post Auth Returning Rooms',
    description: 'Экран после авторизации для пользователя с двумя и более доступными комнатами.',
    mode: 'post-auth-returning' as const,
  },
  {
    id: 'post-auth-new-room',
    title: '21 - Post Auth New Room',
    description: 'Экран выбора нового действия для пользователя, у которого уже есть две и более комнаты.',
    mode: 'post-auth-new-room' as const,
  },
  {
    id: 'post-auth-new-room-create-selected',
    title: '22 - Post Auth New Room Create Selected',
    description: 'Экран выбора нового действия с выбранным вариантом создания комнаты.',
    mode: 'post-auth-new-room-create-selected' as const,
  },
  {
    id: 'post-auth-new-room-join-selected',
    title: '23 - Post Auth New Room Join Selected',
    description: 'Экран выбора нового действия с выбранным вариантом входа в комнату.',
    mode: 'post-auth-new-room-join-selected' as const,
  },
  {
    id: 'create-room-discipline',
    title: '24 - Create Room Discipline',
    description: 'Discipline selection step before room naming.',
    mode: 'discipline-base' as const,
  },
  {
    id: 'create-room-discipline-selected',
    title: '25 - Create Room Discipline Selected',
    description: 'Discipline selection with one discipline chosen and continue enabled.',
    mode: 'discipline-selected' as const,
  },
  {
    id: 'create-room-name-empty',
    title: '26 - Create Room Name Empty',
    description: 'Room name step with an empty input.',
    mode: 'name-empty' as const,
  },
  {
    id: 'create-room-name-required',
    title: '27 - Create Room Name Required Validation',
    description: 'Room name step after submit with an empty input.',
    mode: 'name-required' as const,
  },
  {
    id: 'create-room-name-too-short',
    title: '28 - Create Room Name Too Short',
    description: 'Room name step with fewer than two symbols entered.',
    mode: 'name-too-short' as const,
  },
  {
    id: 'create-room-name-filled',
    title: '29 - Create Room Name Filled',
    description: 'Room name step with a valid room name entered.',
    mode: 'name-filled' as const,
  },
  {
    id: 'create-room-name-loading',
    title: '30 - Create Room Name Loading',
    description: 'Room creation submit state with the name already entered.',
    mode: 'name-loading' as const,
  },
  {
    id: 'join-room-empty',
    title: '31 - Join Room Empty',
    description: 'Join-room step with an empty invitation code field.',
    mode: 'join-empty' as const,
  },
  {
    id: 'join-room-required',
    title: '32 - Join Room Required Validation',
    description: 'Join-room step after submit with an empty invitation code.',
    mode: 'join-required' as const,
  },
  {
    id: 'join-room-not-found',
    title: '33 - Join Room Not Found',
    description: 'Join-room step when the entered invitation code does not match any room.',
    mode: 'join-not-found' as const,
  },
  {
    id: 'join-room-filled',
    title: '34 - Join Room Filled',
    description: 'Join-room step with a filled invitation code.',
    mode: 'join-filled' as const,
  },
  {
    id: 'join-room-loading',
    title: '35 - Join Room Loading',
    description: 'Join-room submit state while the code is being checked.',
    mode: 'join-loading' as const,
  },
] satisfies Array<{
  id: string
  title: string
  description: string
  mode: ComponentProps<typeof CreateRoomPreview>['mode']
}>

export default function ScreensPage() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const pageBackground = theme === 'light' ? 'bg-[var(--neutral-100)]' : 'bg-[var(--neutral-950)]'
  const frameBackground = theme === 'light' ? 'bg-[var(--neutral-50)]' : 'bg-[var(--neutral-900)]'
  const frameBorder = theme === 'light' ? 'border-[var(--neutral-200)]' : 'border-[var(--neutral-700)]'
  const panelBackground = theme === 'light' ? 'bg-[var(--neutral-0)]' : 'bg-[var(--neutral-940)]'
  const panelText = theme === 'light' ? 'text-[var(--neutral-800)]' : 'text-[var(--neutral-50)]'
  const panelMuted = theme === 'light' ? 'text-[var(--neutral-500)]' : 'text-[var(--neutral-400)]'
  const buttonIdle = theme === 'light'
    ? 'border-[var(--neutral-200)] bg-[var(--neutral-0)] text-[var(--neutral-500)]'
    : 'border-[var(--neutral-700)] bg-[var(--neutral-900)] text-[var(--neutral-400)]'

  return (
    <main className={`min-h-screen ${pageBackground} p-6`} data-theme={theme}>
      <div className="mx-auto max-w-[1600px] space-y-4">
        <div className={`flex items-center justify-between border ${frameBorder} ${panelBackground} px-4 py-3`}>
          <div className={`text-[11px] uppercase tracking-[0.12em] ${panelMuted}`}>screens preview</div>

          <div className="flex items-center gap-2">
            {(['light', 'dark'] as const).map(option => {
              const isActive = option === theme

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTheme(option)}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? 'border-[var(--accent-default)] bg-[var(--accent-default)] text-[var(--text-on-accent)]'
                      : buttonIdle
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        {REGISTER_SCREEN_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className={`border ${frameBorder} ${panelBackground}`}>
            <div className={`border-b ${frameBorder} px-6 py-5`}>
              <h2 className={`text-lg font-medium ${panelText}`}>{section.title}</h2>
              <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>{section.description}</p>
            </div>

            <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Desktop 1440px
                </span>
                <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                  <RegisterPreview mode={section.mode} />
                </div>
              </div>

              <div className="flex w-[375px] shrink-0 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Mobile 375px
                </span>
                <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                  <RegisterPreview isMobile mode={section.mode} />
                </div>
              </div>
            </div>
          </section>
        ))}

        {VERIFY_EMAIL_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className={`border ${frameBorder} ${panelBackground}`}>
            <div className={`border-b ${frameBorder} px-6 py-5`}>
              <h2 className={`text-lg font-medium ${panelText}`}>{section.title}</h2>
              <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>{section.description}</p>
            </div>

            <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Desktop 1440px
                </span>
                <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                  {section.id.startsWith('register-verify-email') ? (
                    <VerifyEmailPreview
                      mode={
                        section.id === 'register-verify-email-available'
                          ? 'available'
                          : section.id === 'register-verify-email-attempts-exceeded'
                            ? 'attempts-exceeded'
                            : 'cooldown'
                      }
                    />
                  ) : (
                    <ConfirmEmailPreview mode={section.mode} />
                  )}
                </div>
              </div>

              <div className="flex w-[375px] shrink-0 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Mobile 375px
                </span>
                <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                  {section.id.startsWith('register-verify-email') ? (
                    <VerifyEmailPreview
                      isMobile
                      mode={
                        section.id === 'register-verify-email-available'
                          ? 'available'
                          : section.id === 'register-verify-email-attempts-exceeded'
                            ? 'attempts-exceeded'
                            : 'cooldown'
                      }
                    />
                  ) : (
                    <ConfirmEmailPreview isMobile mode={section.mode} />
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        <section id="app-transition-loading" className={`border ${frameBorder} ${panelBackground}`}>
          <div className={`border-b ${frameBorder} px-6 py-5`}>
            <h2 className={`text-lg font-medium ${panelText}`}>14 - App Transition Loading</h2>
            <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>
              Route-level intermediate screen shown while the next step in the flow is loading.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                {theme} · Desktop 1440px
              </span>
              <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                <AppLoadingPreview />
              </div>
            </div>

            <div className="flex w-[375px] shrink-0 flex-col gap-2">
              <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                {theme} · Mobile 375px
              </span>
              <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                <AppLoadingPreview />
              </div>
            </div>
          </div>
        </section>

        <section id="register-welcome" className={`border ${frameBorder} ${panelBackground}`}>
          <div className={`border-b ${frameBorder} px-6 py-5`}>
            <h2 className={`text-lg font-medium ${panelText}`}>15 - Register Welcome</h2>
            <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>
              Screen shown after email confirmation, before the user continues deeper into the product flow.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                {theme} · Desktop 1440px
              </span>
              <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                <WelcomePreview />
              </div>
            </div>

            <div className="flex w-[375px] shrink-0 flex-col gap-2">
              <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                {theme} · Mobile 375px
              </span>
              <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                <WelcomePreview isMobile />
              </div>
            </div>
          </div>
        </section>

        {REGISTER_NAME_SCREEN_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className={`border ${frameBorder} ${panelBackground}`}>
            <div className={`border-b ${frameBorder} px-6 py-5`}>
              <h2 className={`text-lg font-medium ${panelText}`}>{section.title}</h2>
              <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>{section.description}</p>
            </div>

            <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Desktop 1440px
                </span>
                <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                  <RegisterNamePreview mode={section.mode} />
                </div>
              </div>

              <div className="flex w-[375px] shrink-0 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Mobile 375px
                </span>
                <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                  <RegisterNamePreview isMobile mode={section.mode} />
                </div>
              </div>
            </div>
          </section>
        ))}

        {CREATE_ROOM_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className={`border ${frameBorder} ${panelBackground}`}>
            <div className={`border-b ${frameBorder} px-6 py-5`}>
              <h2 className={`text-lg font-medium ${panelText}`}>{section.title}</h2>
              <p className={`pt-2 text-[14px] leading-[22px] ${panelMuted}`}>{section.description}</p>
            </div>

            <div className="flex flex-wrap items-start gap-8 px-6 py-6 2xl:flex-nowrap">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Desktop 1440px
                </span>
                <div className={`w-full overflow-hidden border ${frameBorder} ${frameBackground}`}>
                  <CreateRoomPreview mode={section.mode} />
                </div>
              </div>

              <div className="flex w-[375px] shrink-0 flex-col gap-2">
                <span className={`text-[10px] uppercase tracking-[0.12em] ${panelMuted}`}>
                  {theme} · Mobile 375px
                </span>
                <div className={`overflow-hidden border ${frameBorder} ${frameBackground}`} style={{ width: 375 }}>
                  <CreateRoomPreview isMobile mode={section.mode} />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
