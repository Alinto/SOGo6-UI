/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { OfflineNavProvider } from '../../offline-nav-context'
import { useOpenMailFromList } from '../use-open-mail-from-list'

const mockPush = jest.fn()
const mockReadBody = jest.fn()
let mockIsOnline = true

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ account: '0', folder: 'INBOX' }),
}))

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => true,
  isPwaOutboxEnabled: () => true,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

jest.mock('../use-mail-cache', () => ({
  useMailCache: () => ({
    readBody: mockReadBody,
    readHeaders: jest.fn(),
  }),
}))

function wrapper({ children }: { children: ReactNode }) {
  return <OfflineNavProvider>{children}</OfflineNavProvider>
}

describe('useOpenMailFromList', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockReadBody.mockReset()
    mockIsOnline = true
  })

  it('navigates online without reading the cache', async () => {
    const { result } = renderHook(() => useOpenMailFromList(), { wrapper })

    await act(async () => {
      await result.current.openMail('m1')
    })

    expect(mockReadBody).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/m1')
    expect(result.current.unavailable).toBe(false)
  })

  it('stays on the list when offline and the body was never cached', async () => {
    mockIsOnline = false
    mockReadBody.mockResolvedValue(null)
    const { result } = renderHook(() => useOpenMailFromList(), { wrapper })

    await act(async () => {
      await result.current.openMail('m1')
    })

    expect(mockReadBody).toHaveBeenCalledWith('0', 'INBOX', 'm1')
    expect(mockPush).not.toHaveBeenCalled()
    expect(result.current.unavailable).toBe(true)
  })

  it('does not Next.js-navigate offline even when the body is cached', async () => {
    mockIsOnline = false
    mockReadBody.mockResolvedValue({ id: 'm1' })
    const { result } = renderHook(() => useOpenMailFromList(), { wrapper })

    await act(async () => {
      await result.current.openMail('m1')
    })

    expect(mockPush).not.toHaveBeenCalled()
    expect(result.current.unavailable).toBe(false)
  })
})
