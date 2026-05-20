import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { webcrypto } from 'crypto'
import { TextDecoder, TextEncoder } from 'util'

/**
 * Default user-event delays simulate real typing; under pre-push (full suite,
 * maxWorkers 50%) that makes interaction tests flaky. Merge delay: null so
 * tests stay fast and deterministic. Callers can still pass a custom delay.
 */
const userEventSetup = userEvent.setup.bind(userEvent)
userEvent.setup = ((options) =>
  userEventSetup({ delay: null, ...options })) as typeof userEvent.setup

// Polyfill crypto.subtle for Node/jsdom test environment
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
  })
}

// Polyfill TextEncoder/TextDecoder for Node/jsdom test environment
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress act environment warnings that are not critical for our tests
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes(
      'The current testing environment is not configured to support act'
    )
  ) {
    return
  }
  originalConsoleError(...args)
}
