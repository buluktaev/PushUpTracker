'use client'

import ResetPasswordScreen from '@/components/ResetPasswordScreen'

export type ResetPasswordPreviewMode =
  | 'validating'
  | 'invalid-link'
  | 'empty'
  | 'required-validation'
  | 'too-short'
  | 'mismatch'
  | 'filled'
  | 'password-visible'
  | 'loading'
  | 'success'

interface ResetPasswordPreviewProps {
  isMobile?: boolean
  mode?: ResetPasswordPreviewMode
}

export function ResetPasswordPreview({
  isMobile = false,
  mode = 'empty',
}: ResetPasswordPreviewProps) {
  if (mode === 'validating') {
    return <ResetPasswordScreen mode="validating" isMobile={isMobile} />
  }

  if (mode === 'invalid-link') {
    return <ResetPasswordScreen mode="invalid" isMobile={isMobile} />
  }

  if (mode === 'success') {
    return <ResetPasswordScreen mode="success" isMobile={isMobile} />
  }

  const password =
    mode === 'too-short'
      ? '1234567'
      : mode === 'filled' || mode === 'password-visible' || mode === 'loading' || mode === 'mismatch'
        ? '12345678'
        : ''
  const confirmPassword =
    mode === 'mismatch'
      ? '87654321'
      : mode === 'filled' || mode === 'password-visible' || mode === 'loading'
        ? '12345678'
        : ''

  return (
    <ResetPasswordScreen
      mode="form"
      isMobile={isMobile}
      password={password}
      confirmPassword={confirmPassword}
      passwordError={mode === 'required-validation' || mode === 'too-short'}
      confirmPasswordError={mode === 'required-validation' || mode === 'mismatch'}
      passwordCaption={
        mode === 'required-validation'
          ? 'поле обязательно для заполнения'
          : mode === 'too-short'
            ? 'минимум 8 символов'
            : undefined
      }
      confirmPasswordCaption={
        mode === 'required-validation'
          ? 'поле обязательно для заполнения'
          : mode === 'mismatch'
            ? 'пароли не совпадают'
            : undefined
      }
      passwordVisible={mode === 'password-visible' ? true : undefined}
      confirmPasswordVisible={mode === 'password-visible' ? true : undefined}
      loading={mode === 'loading'}
    />
  )
}
