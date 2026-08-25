import { act, renderHook } from '@testing-library/react'

const mockFlushOutbox = jest.fn()
let mockIsOnline = true
let mockIsProbing = false

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('../../outbox/outbox-flush-feedback', () => ({
  flushOutboxWithToasts: (...args: unknown[]) => mockFlushOutbox(...args),
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({
    isOnline: mockIsOnline,
    isProbing: mockIsProbing,
  }),
}))

import { useOutboxFlushTriggers } from '../use-outbox-flush-triggers'

describe('useOutboxFlushTriggers', () => {
  beforeEach(() => {
    mockIsProbing = false
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
    expect(mockFlushOutbox).toHaveBeenCalledWith(
      'user@example.org',
      expect.any(Function)
    )
  })

  it('does not flush on cold start when offline', () => {
    mockIsOnline = false
    renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).not.toHaveBeenCalled()
  })

  it('does not flush while a probe is in flight', () => {
    mockIsOnline = true
    mockIsProbing = true
    renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).not.toHaveBeenCalled()
  })

  it('flushes after the probe settles online', async () => {
    mockIsOnline = true
    mockIsProbing = true
    const { rerender } = renderHook(() => useOutboxFlushTriggers(true))
    expect(mockFlushOutbox).not.toHaveBeenCalled()

    mockIsProbing = false
    await act(async () => {
      rerender()
    })
    expect(mockFlushOutbox).toHaveBeenCalledTimes(1)
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
