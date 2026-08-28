/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { wipeOfflineUserData } from '../../db/wipe'
import { requestPersistentStorageOnce } from '../persist'

const userId = 'user@example.org'

describe('requestPersistentStorageOnce', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('asks persist once and records the attempt', async () => {
    const persist = jest.fn(async () => true)
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        persist,
        persisted: async () => false,
      },
    })

    await expect(requestPersistentStorageOnce(userId)).resolves.toBe(true)
    await expect(requestPersistentStorageOnce(userId)).resolves.toBe(false)
    expect(persist).toHaveBeenCalledTimes(1)
  })
})
