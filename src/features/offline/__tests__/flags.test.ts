import {
  isPwaBgSyncEnabled,
  isPwaCalendarCacheEnabled,
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
    expect(isPwaCalendarCacheEnabled()).toBe(false)
  })

  it('subflags can be turned off while master stays on', () => {
    process.env.NEXT_PUBLIC_PWA_ENABLED = 'true'
    process.env.NEXT_PUBLIC_PWA_OUTBOX = 'false'
    process.env.NEXT_PUBLIC_PWA_MAIL_CACHE = 'false'
    process.env.NEXT_PUBLIC_PWA_BG_SYNC = '0'
    expect(isPwaEnabled()).toBe(true)
    expect(isPwaOutboxEnabled()).toBe(false)
    expect(isPwaMailCacheEnabled()).toBe(false)
    expect(isPwaBgSyncEnabled()).toBe(false)
  })

  it('calendar cache is opt-in even when master is on', () => {
    process.env.NEXT_PUBLIC_PWA_ENABLED = 'true'
    process.env.NEXT_PUBLIC_PWA_CALENDAR_CACHE = 'true'
    expect(isPwaCalendarCacheEnabled()).toBe(true)
  })
})
