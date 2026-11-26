/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { getOfflineDb } from '../offline-db'
import {
  deleteIndexedDb,
  wipeOfflineUserData,
  wipeOtherUsersOfflineData,
} from '../wipe'

async function databaseNames(): Promise<string[]> {
  return (await indexedDB.databases()).map((db) => db.name ?? '')
}

describe('deleteIndexedDb', () => {
  it('waits past onblocked, then reports blocked after the timeout', async () => {
    jest.useFakeTimers()
    const request = {} as IDBOpenDBRequest
    const spy = jest.spyOn(indexedDB, 'deleteDatabase').mockReturnValue(request)
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    let settled: string | null = null
    const promise = deleteIndexedDb('blocked-db', 1000).then((result) => {
      settled = result
      return result
    })
    request.onblocked?.call(request, {} as IDBVersionChangeEvent)
    await Promise.resolve()
    expect(settled).toBeNull()
    jest.advanceTimersByTime(1000)
    await expect(promise).resolves.toBe('blocked')
    spy.mockRestore()
    warn.mockRestore()
    jest.useRealTimers()
  })

  it('resolves deleted when the deletion succeeds after being blocked', async () => {
    const request = {} as IDBOpenDBRequest
    const spy = jest.spyOn(indexedDB, 'deleteDatabase').mockReturnValue(request)
    const promise = deleteIndexedDb('late-db', 1000)
    request.onblocked?.call(request, {} as IDBVersionChangeEvent)
    request.onsuccess?.call(request, {} as Event)
    await expect(promise).resolves.toBe('deleted')
    spy.mockRestore()
  })
})

describe('wipeOtherUsersOfflineData', () => {
  afterEach(async () => {
    for (const uid of ['alice', 'bob', 'carol']) {
      await wipeOfflineUserData(uid)
    }
  })

  it('deletes every other account database and keeps the current one', async () => {
    for (const uid of ['alice', 'bob', 'carol']) {
      await getOfflineDb(uid).open()
    }
    const deleted = await wipeOtherUsersOfflineData('bob')
    expect(deleted.sort()).toEqual(['sogo-offline-alice', 'sogo-offline-carol'])
    const names = await databaseNames()
    expect(names).toContain('sogo-offline-bob')
    expect(names).not.toContain('sogo-offline-alice')
    expect(names).not.toContain('sogo-offline-carol')
  })

  it('spares accounts still signed in in another tab', async () => {
    for (const uid of ['alice', 'bob']) {
      await getOfflineDb(uid).open()
    }
    Object.defineProperty(navigator, 'locks', {
      value: {
        query: async () => ({
          held: [{ name: 'sogo-offline-active:alice', mode: 'shared' }],
        }),
      },
      configurable: true,
    })
    const deleted = await wipeOtherUsersOfflineData('bob')
    expect(deleted).toEqual([])
    expect(await databaseNames()).toContain('sogo-offline-alice')
    Object.defineProperty(navigator, 'locks', {
      value: undefined,
      configurable: true,
    })
  })

  it('does nothing where indexedDB.databases is unavailable', async () => {
    const original = indexedDB.databases
    Object.defineProperty(indexedDB, 'databases', {
      value: undefined,
      configurable: true,
    })
    await expect(wipeOtherUsersOfflineData('bob')).resolves.toEqual([])
    Object.defineProperty(indexedDB, 'databases', {
      value: original,
      configurable: true,
    })
  })
})

describe('wipeOfflineUserData', () => {
  it('removes the per-user reminder key from sessionStorage', async () => {
    sessionStorage.setItem('sogo.reminder.notified', '["event-1"]')
    sessionStorage.setItem('sogo-env-vars', '{}')
    await wipeOfflineUserData('alice')
    expect(sessionStorage.getItem('sogo.reminder.notified')).toBeNull()
    expect(sessionStorage.getItem('sogo-env-vars')).toBe('{}')
  })
})
