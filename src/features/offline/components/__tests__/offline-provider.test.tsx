/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react'

const mockPurge = jest.fn(async (..._args: unknown[]) => undefined)
const mockWipeOthers = jest.fn(async (..._args: unknown[]) => [] as string[])
const mockFlush = jest.fn(async (..._args: unknown[]) => undefined)

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/offline/flags', () => ({
  isPwaEnabled: () => true,
  isPwaMailCacheEnabled: () => true,
  isPwaOutboxEnabled: () => true,
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'alice',
}))

jest.mock('@/features/offline/storage/persist', () => ({
  requestPersistentStorageOnce: jest.fn(async () => {
    throw new Error('denied')
  }),
}))

jest.mock('@/features/offline/outbox/outbox-flush-feedback', () => ({
  flushOutboxWithToasts: (...args: unknown[]) => mockFlush(...args),
}))

jest.mock('../../db/mail-cache-store', () => ({
  purgeExpiredCache: (...args: unknown[]) => mockPurge(...args),
}))

jest.mock('../../db/wipe', () => ({
  wipeOtherUsersOfflineData: (...args: unknown[]) => mockWipeOthers(...args),
  holdActiveOwnerLock: () => () => undefined,
}))

jest.mock('../../hooks/use-offline-draft-sync', () => ({
  useOfflineDraftHydration: () => undefined,
}))

jest.mock('../../hooks/use-outbox-flush-triggers', () => ({
  useOutboxFlushTriggers: () => undefined,
}))

jest.mock('../../offline-nav-context', () => ({
  OfflineNavProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock('../pwa-status-bar', () => () => null)
jest.mock('../pwa-update-toast', () => () => null)

import OfflineProvider from '../offline-provider'

describe('OfflineProvider', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockPurge.mockClear()
    mockWipeOthers.mockClear()
  })

  it('wipes other accounts and purges expired cache on mount', async () => {
    await act(async () => {
      render(<OfflineProvider>{null}</OfflineProvider>)
    })
    expect(mockWipeOthers).toHaveBeenCalledWith('alice')
    expect(mockPurge).toHaveBeenCalledWith('alice')
  })

  it('purges again when the app comes back online or visible', async () => {
    await act(async () => {
      render(<OfflineProvider>{null}</OfflineProvider>)
    })
    mockPurge.mockClear()
    await act(async () => {
      window.dispatchEvent(new Event('online'))
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(mockPurge).toHaveBeenCalledTimes(2)
  })

  it('does not leak a rejection when the purge fails', async () => {
    mockPurge.mockRejectedValueOnce(new Error('IDB closed'))
    await act(async () => {
      render(<OfflineProvider>{null}</OfflineProvider>)
    })
    expect(console.warn).toHaveBeenCalled()
  })
})
