import { expect, test } from '@playwright/test'

const reviewRoutesMode = process.env.SMOKE_REVIEW_ROUTES_MODE ?? 'open'

test('логин рендерится', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'авторизация' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'войти' })).toBeVisible()
})

test('регистрация рендерится', async ({ page }) => {
  await page.goto('/register')

  await expect(page.getByRole('heading', { name: 'регистрация' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'зарегистрироваться' })).toBeVisible()
})

test('forgot-password держит required validation на live route', async ({ page }) => {
  await page.goto('/forgot-password')
  await page.getByRole('button', { name: 'отправить ссылку' }).click()

  await expect(page.getByText('поле обязательно для заполнения')).toBeVisible()
})

test('reset-password без recovery marker уходит в invalid state', async ({ page }) => {
  await page.goto('/reset-password')

  await expect(page.getByRole('heading', { name: 'ошибка' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'попробовать снова' })).toBeVisible()
})

test('корень без сессии редиректит в login', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/login\?next=%2F/)
})

test('защищенная room route без сессии редиректит в login с next', async ({ page }) => {
  await page.goto('/room/STRXLC?tab=settings')

  await expect(page).toHaveURL(/\/login\?next=%2Froom%2FSTRXLC%3Ftab%3Dsettings/)
})

for (const path of ['/components', '/screens', '/design-preview']) {
  test(`review route contract: ${path}`, async ({ page }) => {
    const response = await page.goto(path)

    if (reviewRoutesMode === 'closed') {
      expect(response?.status()).toBe(404)
      return
    }

    expect(response?.ok()).toBeTruthy()
  })
}
