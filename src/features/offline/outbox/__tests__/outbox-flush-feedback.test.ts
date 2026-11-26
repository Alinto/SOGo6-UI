/**
 * @jest-environment jsdom
 */
import { toast } from 'sonner'
import { flushOutboxWithToasts } from '../outbox-flush-feedback'
import { flushOutbox, type FlushResult } from '../outbox-flush-service'

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
    let resolveFlush: (value: FlushResult) => void = () => {}
    const inflight = new Promise<FlushResult>((resolve) => {
      resolveFlush = resolve
    })
    mockFlush.mockReturnValue(inflight)

    const first = flushOutboxWithToasts('user@example.org', t)
    const second = flushOutboxWithToasts('user@example.org', t)

    resolveFlush({
      sent: 1,
      failed: 0,
      interrupted: 0,
      pausedAuth: false,
      errors: [],
    })
    await Promise.all([first, second])

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('outbox_flush_success.string')
  })

  it('toasts a warning when flush pauses for auth', async () => {
    mockFlush.mockResolvedValue({
      sent: 0,
      failed: 0,
      interrupted: 0,
      pausedAuth: true,
      errors: ['auth_expired'],
    })

    await flushOutboxWithToasts('user@example.org', t)

    expect(toast.warning).toHaveBeenCalledWith('outbox_auth_required.string')
  })

  it('never rejects: a crashed flush is logged and toasted', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockFlush.mockRejectedValue(new Error('DatabaseClosedError'))

    const result = await flushOutboxWithToasts('user@example.org', t)

    expect(result.sent).toBe(0)
    expect(result.errors).toEqual(['flush_error'])
    expect(toast.error).toHaveBeenCalledWith('outbox_flush_failed.string')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('warns about a possibly delivered message instead of a plain failure', async () => {
    mockFlush.mockResolvedValue({
      sent: 0,
      failed: 1,
      interrupted: 1,
      pausedAuth: false,
      errors: ['send_outcome_unknown'],
    })

    await flushOutboxWithToasts('user@example.org', t)

    expect(toast.warning).toHaveBeenCalledWith(
      'outbox_flush_unknown_outcome.string'
    )
    expect(toast.error).not.toHaveBeenCalled()
  })
})
