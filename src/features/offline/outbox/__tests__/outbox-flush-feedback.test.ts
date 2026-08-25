/**
 * @jest-environment jsdom
 */
import { toast } from 'sonner'
import { flushOutboxWithToasts } from '../outbox-flush-feedback'
import { flushOutbox } from '../outbox-flush-service'

jest.mock('../outbox-flush-service', () => ({
  flushOutbox: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

const mockFlush = flushOutbox as jest.MockedFunction<typeof flushOutbox>
const t = (key: string) => key

describe('flushOutboxWithToasts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('toasts success once when two callers share the same in-flight flush', async () => {
    let resolveFlush: (value: {
      sent: number
      failed: number
      pausedAuth: boolean
      errors: string[]
    }) => void = () => {}
    const inflight = new Promise<{
      sent: number
      failed: number
      pausedAuth: boolean
      errors: string[]
    }>((resolve) => {
      resolveFlush = resolve
    })
    mockFlush.mockReturnValue(inflight)

    const first = flushOutboxWithToasts('user@example.org', t)
    const second = flushOutboxWithToasts('user@example.org', t)

    resolveFlush({ sent: 1, failed: 0, pausedAuth: false, errors: [] })
    await Promise.all([first, second])

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('outbox_flush_success.string')
  })

  it('toasts a warning when flush pauses for auth', async () => {
    mockFlush.mockResolvedValue({
      sent: 0,
      failed: 0,
      pausedAuth: true,
      errors: ['auth_expired'],
    })

    await flushOutboxWithToasts('user@example.org', t)

    expect(toast.warning).toHaveBeenCalledWith('outbox_auth_required.string')
  })
})
