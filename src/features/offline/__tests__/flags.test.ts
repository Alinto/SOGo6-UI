import {
  isPwaBgSyncEnabled,
  isPwaEnabled,
  isPwaMailCacheEnabled,
  isPwaOutboxEnabled,
} from '../flags'

describe('PWA flags', () => {
  const prev = { ...process.env }

  afterEach(() => {
    process.env = { ...prev }
  })

  it('master flag defaults to false', () => {
    delete process.env.NEXT_PUBLIC_PWA_ENABLED
    expect(isPwaEnabled()).toBe(false)
    expect(isPwaOutboxEnabled()).toBe(false)
  })

  it('subflags follow master when enabled', () => {
    process.env.NEXT_PUBLIC_PWA_ENABLED = 'true'
    delete process.env.NEXT_PUBLIC_PWA_OUTBOX
    delete process.env.NEXT_PUBLIC_PWA_MAIL_CACHE
    delete process.env.NEXT_PUBLIC_PWA_BG_SYNC
    expect(isPwaOutboxEnabled()).toBe(true)
    expect(isPwaMailCacheEnabled()).toBe(true)
    expect(isPwaBgSyncEnabled()).toBe(true)
  })
})
