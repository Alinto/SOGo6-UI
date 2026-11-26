import { KILL_SWITCH_SW_SOURCE, swPrecacheRevision } from '../sw-build'

jest.mock('next/server', () => ({
  NextResponse: class {},
}))

describe('swPrecacheRevision', () => {
  it('prefers SOURCE_VERSION, then GIT_COMMIT', () => {
    expect(swPrecacheRevision({ SOURCE_VERSION: ' abc ' }, () => 'git')).toBe(
      'abc'
    )
    expect(swPrecacheRevision({ GIT_COMMIT: 'def' }, () => 'git')).toBe('def')
  })

  it('treats an empty Docker build arg as unset', () => {
    expect(swPrecacheRevision({ SOURCE_VERSION: '' }, () => 'sha1')).toBe(
      'sha1'
    )
  })

  it('never falls back to a constant without env or git', () => {
    const a = swPrecacheRevision(
      {},
      () => '',
      () => 1000,
      () => 0.123
    )
    const b = swPrecacheRevision(
      {},
      () => '',
      () => 2000,
      () => 0.456
    )
    expect(a).not.toBe('dev')
    expect(a).not.toBe(b)
  })
})

describe('KILL_SWITCH_SW_SOURCE', () => {
  it('wipes caches and unregisters on activate', () => {
    expect(KILL_SWITCH_SW_SOURCE).toContain('skipWaiting')
    expect(KILL_SWITCH_SW_SOURCE).toContain('caches.delete')
    expect(KILL_SWITCH_SW_SOURCE).toContain('registration.unregister')
    expect(() => new Function(KILL_SWITCH_SW_SOURCE)).not.toThrow()
  })
})
