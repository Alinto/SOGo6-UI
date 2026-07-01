import { createClientId } from '../create-client-id'

describe('createClientId', () => {
  const originalCrypto = global.crypto

  afterEach(() => {
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      configurable: true,
    })
  })

  it('uses crypto.randomUUID when available', () => {
    Object.defineProperty(global, 'crypto', {
      value: { randomUUID: () => 'uuid-from-crypto' },
      configurable: true,
    })

    expect(createClientId()).toBe('uuid-from-crypto')
  })

  it('falls back when randomUUID is unavailable (plain HTTP)', () => {
    Object.defineProperty(global, 'crypto', {
      value: {},
      configurable: true,
    })

    const id = createClientId()
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
  })

  it('falls back when crypto is undefined', () => {
    Object.defineProperty(global, 'crypto', {
      value: undefined,
      configurable: true,
    })

    expect(createClientId()).toBeTruthy()
  })
})
