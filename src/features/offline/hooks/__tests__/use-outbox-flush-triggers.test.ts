import { act, renderHook } from '@testing-library/react'

const mockFlushOutbox = jest.fn()
let mockIsOnline = true

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  }),
}))

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('../../outbox/outbox-flush-service', () => ({
  flushOutbox: (...args: unknown[]) => mockFlushOutbox(...args),
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

import { useOutboxFlushTriggers } from '../use-outbox-flush-triggers'

describe('useOutboxFlushTriggers', () => {
  beforeEach(() => {
    mockFlushOutbox.mockReset()
    mockFlushOutbox.mockResolvedValue({
      sent: 0,
      failed: 0,
      pausedAuth: false,
      errors: [],
    })
  })

  it('flushes on cold start when online', () => {
    mockIsOnline = true
    renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).toHaveBeenCalledTimes(1)
    expect(mockFlushOutbox).toHaveBeenCalledWith('user@example.org')
  })

  it('does not flush on cold start when offline', () => {
    mockIsOnline = false
    renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).not.toHaveBeenCalled()
  })

  it('flushes when connectivity comes back (offline → online)', async () => {
    mockIsOnline = false
    const { rerender } = renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).not.toHaveBeenCalled()

    mockIsOnline = true
    await act(async () => {
      rerender()
    })
    expect(mockFlushOutbox).toHaveBeenCalledTimes(1)
  })

  it('does not re-flush while staying online', async () => {
    mockIsOnline = true
    const { rerender } = renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).toHaveBeenCalledTimes(1)

    await act(async () => {
      rerender()
    })
    expect(mockFlushOutbox).toHaveBeenCalledTimes(1)
  })

  it('does nothing when disabled', () => {
    mockIsOnline = true
    renderHook(() => useOutboxFlushTriggers(false))
    expect(mockFlushOutbox).not.toHaveBeenCalled()
  })
})
