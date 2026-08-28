import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx next dev --turbopack -p ${PORT}`,
    url: `${BASE_URL}/en/auth/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      PORT: String(PORT),
      NEXT_PUBLIC_PWA_ENABLED: 'true',
      NEXT_PUBLIC_PWA_OUTBOX: 'true',
      NEXT_PUBLIC_PWA_MAIL_CACHE: 'true',
      NEXT_PUBLIC_PWA_BG_SYNC: 'true',
      NEXT_PUBLIC_PWA_CALENDAR_CACHE: 'false',
      REACT_APP_API_BASE_URL: '/fakeApi',
      SSE_ENABLED: 'false',
    },
  },
})
