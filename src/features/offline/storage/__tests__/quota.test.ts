import {
  assertStorageFits,
  formatBytes,
  isQuotaExceededError,
  StorageQuotaExceededError,
} from '../quota'

describe('storage quota', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: undefined,
    })
  })

  it('formats byte sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB')
  })

  it('throws when usage plus extra would exceed headroom', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        estimate: async () => ({ usage: 90, quota: 100 }),
      },
    })
    await expect(assertStorageFits(5)).rejects.toBeInstanceOf(
      StorageQuotaExceededError
    )
  })

  it('allows enqueue when estimate is missing', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: undefined,
    })
    await expect(assertStorageFits(1_000_000)).resolves.toBeUndefined()
  })

  it('detects QuotaExceededError names', () => {
    expect(isQuotaExceededError(new StorageQuotaExceededError())).toBe(true)
    expect(
      isQuotaExceededError(
        Object.assign(new Error('q'), { name: 'QuotaExceededError' })
      )
    ).toBe(true)
    expect(isQuotaExceededError(new Error('nope'))).toBe(false)
  })
})
