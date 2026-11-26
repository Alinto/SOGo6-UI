/**
 * @jest-environment jsdom
 */
import {
  installCrossTabAuthSync,
  isForeignAuthChange,
} from '../cross-tab-auth-sync'

const stored = (uid: string) =>
  JSON.stringify({
    token: `tok-${uid}`,
    user: { uid, cn: uid, email: `${uid}@x.y` },
    rememberMe: true,
  })

describe('isForeignAuthChange', () => {
  it('ignores tabs that are not logged in', () => {
    expect(isForeignAuthChange(null, stored('a'), null)).toBe(false)
  })

  it('logs out when another account logs in', () => {
    expect(isForeignAuthChange('a', null, stored('b'))).toBe(true)
  })

  it('keeps the session when the same account is written again', () => {
    expect(isForeignAuthChange('a', stored('a'), stored('a'))).toBe(false)
  })

  it('logs out when this account was removed by another tab', () => {
    expect(isForeignAuthChange('a', stored('a'), null)).toBe(true)
  })

  it('keeps a session-only tab when another account logs out', () => {
    expect(isForeignAuthChange('a', stored('b'), null)).toBe(false)
  })
})

describe('installCrossTabAuthSync', () => {
  function fire(init: StorageEventInit) {
    window.dispatchEvent(
      new StorageEvent('storage', { storageArea: localStorage, ...init })
    )
  }

  it('calls onForeignChange for a foreign login on the auth key only', () => {
    const onForeignChange = jest.fn()
    const uninstall = installCrossTabAuthSync({
      getCurrentUid: () => 'a',
      onForeignChange,
    })
    fire({ key: 'other', newValue: stored('b') })
    expect(onForeignChange).not.toHaveBeenCalled()
    fire({ key: 'sogo_auth', oldValue: null, newValue: stored('b') })
    expect(onForeignChange).toHaveBeenCalledTimes(1)
    uninstall()
    fire({ key: 'sogo_auth', oldValue: null, newValue: stored('c') })
    expect(onForeignChange).toHaveBeenCalledTimes(1)
  })

  it('replaces the previous listener when installed again', () => {
    const first = jest.fn()
    const second = jest.fn()
    installCrossTabAuthSync({
      getCurrentUid: () => 'a',
      onForeignChange: first,
    })
    const uninstall = installCrossTabAuthSync({
      getCurrentUid: () => 'a',
      onForeignChange: second,
    })
    fire({ key: 'sogo_auth', oldValue: stored('a'), newValue: null })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    uninstall()
  })
})
