import { expect, test, type Page } from '@playwright/test'

function jwt(expSeconds = Math.floor(Date.now() / 1000) + 86_400): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: 'sogo-tests1@example.org',
      cn: 'John Paul',
      email: 'sogo-tests1@example.org',
      exp: expSeconds,
    })
  ).toString('base64url')
  return `hdr.${payload}.sig`
}

const AUTH = {
  token: jwt(),
  user: {
    uid: 'sogo-tests1@example.org',
    cn: 'John Paul',
    email: 'sogo-tests1@example.org',
  },
  rememberMe: true,
}

async function seedAuth(page: Page) {
  await page.addInitScript((auth) => {
    localStorage.setItem('sogo_auth', JSON.stringify(auth))
  }, AUTH)
}

async function waitForChrome(page: Page) {
  await expect(page.getByTestId('header-dropdown-trigger')).toBeVisible({
    timeout: 30_000,
  })
}

test.describe('PWA offline', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/en/auth/login')
    await expect(page.locator('#email')).toBeVisible()
  })

  test('calendar route shows the in-app overlay when taken offline', async ({
    page,
    context,
  }) => {
    await seedAuth(page)
    await page.goto('/en/calendars')
    await waitForChrome(page)

    await context.setOffline(true)
    await expect(page.getByTestId('offline-unavailable')).toBeVisible()
    await expect(page.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'calendar'
    )
  })

  test('compose shortcut strips the query and stays on Inbox', async ({
    page,
  }) => {
    await seedAuth(page)
    await page.goto('/en/u/0/INBOX?compose=1')
    await waitForChrome(page)
    await expect(page).toHaveURL(/\/en\/u\/0\/INBOX/)
    await expect(page).not.toHaveURL(/compose=1/)
  })

  test('logout while offline replaces the URL with login', async ({
    page,
    context,
  }) => {
    await seedAuth(page)
    await page.goto('/en/u/0/INBOX')
    await waitForChrome(page)

    await context.setOffline(true)
    await page.getByTestId('header-dropdown-trigger').click()
    await page.getByRole('menuitem', { name: 'Logout' }).click()
    await expect(page).toHaveURL(/\/en\/auth\/login/)
  })
})
