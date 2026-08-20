/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { renderHook, waitFor } from '@testing-library/react'
import { saveCachedFolders } from '../../db/mail-cache-store'
import { wipeOfflineUserData } from '../../db/wipe'
import { useOfflineFolders } from '../use-offline-folders'

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => true,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

const userId = 'user@example.org'

describe('useOfflineFolders', () => {
  beforeEach(async () => {
    await wipeOfflineUserData(userId)
  })

  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('serves cached folders when the live query has no data', async () => {
    await saveCachedFolders({
      id: `${userId}:0`,
      userId,
      accountId: '0',
      foldersJson: JSON.stringify([
        { name: 'INBOX', path: 'INBOX', type: 'INBOX' },
      ]),
      updatedAt: Date.now(),
    })

    const { result } = renderHook(() => useOfflineFolders('0', false))

    await waitFor(() => {
      expect(result.current).toEqual([
        { name: 'INBOX', path: 'INBOX', type: 'INBOX' },
      ])
    })
  })

  it('skips the cache when live folder data is present', async () => {
    const { result } = renderHook(() => useOfflineFolders('0', true))
    expect(result.current).toBeNull()
  })
})
