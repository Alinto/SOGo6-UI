/**
 * @jest-environment jsdom
 */
import { act, render, waitFor } from '@testing-library/react'
import PwaUpdateToast from '../pwa-update-toast'

const mockToast = jest.fn()
const mockReload = jest.fn()
let mockPwa = true

jest.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}))

jest.mock('../pwa-update-reload', () => ({
  reloadWindow: () => mockReload(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../flags', () => ({
  isPwaEnabled: () => mockPwa,
}))

type SwListener = EventListenerOrEventListenerObject

function installServiceWorkerMock({
  waiting,
  controller,
}: {
  waiting: { postMessage: jest.Mock } | null
  controller: object | null
}) {
  const listeners = new Map<string, SwListener[]>()

  const registration = {
    waiting,
    installing: null,
    addEventListener: jest.fn(),
  }

  const serviceWorker = {
    ready: Promise.resolve(registration),
    controller,
    addEventListener: jest.fn((type: string, listener: SwListener) => {
      const list = listeners.get(type) ?? []
      list.push(listener)
      listeners.set(type, list)
    }),
    removeEventListener: jest.fn(),
    dispatch(type: string) {
      for (const listener of listeners.get(type) ?? []) {
        if (typeof listener === 'function') {
          listener(new Event(type))
        } else {
          listener.handleEvent(new Event(type))
        }
      }
    },
  }

  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker,
  })

  return { registration, serviceWorker }
}

describe('PwaUpdateToast', () => {
  beforeEach(() => {
    mockToast.mockReset()
    mockReload.mockReset()
    mockPwa = true
  })

  it('prompts when a waiting worker exists and the page is already controlled', async () => {
    const waiting = { postMessage: jest.fn() }
    installServiceWorkerMock({
      waiting,
      controller: {},
    })

    render(<PwaUpdateToast />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        'update_available.string',
        expect.objectContaining({
          id: 'pwa-update',
          duration: Infinity,
        })
      )
    })
  })

  it('posts SKIP_WAITING and reloads after controllerchange on Reload', async () => {
    const waiting = { postMessage: jest.fn() }
    const { serviceWorker } = installServiceWorkerMock({
      waiting,
      controller: {},
    })

    render(<PwaUpdateToast />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled()
    })

    const options = mockToast.mock.calls[0]?.[1] as {
      action: { onClick: () => void }
    }
    act(() => {
      options.action.onClick()
    })

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(mockReload).not.toHaveBeenCalled()

    act(() => {
      serviceWorker.dispatch('controllerchange')
    })

    expect(mockReload).toHaveBeenCalled()
  })

  it('does not prompt on first install when no controller exists', async () => {
    const { serviceWorker } = installServiceWorkerMock({
      waiting: { postMessage: jest.fn() },
      controller: null,
    })

    render(<PwaUpdateToast />)

    await act(async () => {
      await serviceWorker.ready
    })

    expect(mockToast).not.toHaveBeenCalled()
  })
})
