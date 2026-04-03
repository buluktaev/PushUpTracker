import { expect, test, type Page } from '@playwright/test'

const loginEmail = process.env.SMOKE_LOGIN_EMAIL
const loginPassword = process.env.SMOKE_LOGIN_PASSWORD
const roomCode = process.env.SMOKE_ROOM_CODE
const ownerRoomCode = process.env.SMOKE_OWNER_ROOM_CODE

async function login(page: Page, nextPath: string) {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`)
  await page.getByPlaceholder('введите почту').fill(loginEmail!)
  await page.getByPlaceholder('введите пароль').fill(loginPassword!)
  await page.getByRole('button', { name: 'войти' }).click()
}

test('авторизованный room smoke: tabs переключаются и query сохраняется', async ({ page }) => {
  test.skip(
    !loginEmail || !loginPassword || !roomCode,
    'SMOKE_LOGIN_EMAIL / SMOKE_LOGIN_PASSWORD / SMOKE_ROOM_CODE are required'
  )

  await login(page, `/room/${roomCode}`)
  await expect(page).toHaveURL(new RegExp(`/room/${roomCode}`))

  await page.getByRole('tab', { name: 'Рейтинг' }).click()
  await expect(page).toHaveURL(new RegExp(`/room/${roomCode}\\?tab=leaderboard$`))

  await page.reload()
  await expect(page).toHaveURL(new RegExp(`/room/${roomCode}\\?tab=leaderboard$`))

  await page.getByRole('tab', { name: 'Профиль' }).click()
  await expect(page).toHaveURL(new RegExp(`/room/${roomCode}\\?tab=profile$`))
  await expect(page.getByText('выйти из профиля')).toBeVisible()
})

test('owner room smoke: destructive confirm открывается пустой', async ({ page }) => {
  test.skip(
    !loginEmail || !loginPassword || !ownerRoomCode,
    'SMOKE_LOGIN_EMAIL / SMOKE_LOGIN_PASSWORD / SMOKE_OWNER_ROOM_CODE are required'
  )

  await login(page, `/room/${ownerRoomCode}?tab=settings`)
  await expect(page).toHaveURL(new RegExp(`/room/${ownerRoomCode}\\?tab=settings$`))

  await page.getByRole('button', { name: 'удалить комнату' }).click()

  const roomNameInput = page.getByPlaceholder('Введите название комнаты')
  const passwordInput = page.getByPlaceholder('Введите пароль')

  await expect(roomNameInput).toHaveValue('')
  await expect(passwordInput).toHaveValue('')
})
