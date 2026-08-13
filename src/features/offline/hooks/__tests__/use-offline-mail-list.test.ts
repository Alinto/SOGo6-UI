/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import type { ImapMessagesList } from '@/features/mails/mails-types'
import { renderHook, waitFor } from '@testing-library/react'
import { wipeOfflineUserData } from '../../db/wipe'

let mockIsOnline = true

jest.mock('../../flags', () => ({
  isPwaMailCacheEnabled: () => true,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

import { useOfflineMailList } from '../use-offline-mail-list'

const userId = 'user@example.org'

function makeMail(id: string, date: string): ImapMessagesList {
  return {
    id,
    subject: `Subject ${id}`,
    from: { name: 'A', email: 'a@b.c' },
    to: [{ name: 'B', email: 'b@b.c' }],
    date,
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: '…',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  }
}

describe('useOfflineMailList', () => {
  beforeEach(async () => {
    await wipeOfflineUserData(userId)
    mockIsOnline = true
  })

  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('mirrors fetched headers and serves them back when offline', async () => {
    const mails = [
      makeMail('m1', '2026-08-01T10:00:00Z'),
      makeMail('m2', '2026-08-02T10:00:00Z'),
    ]

    interface HookProps {
      mails: ImapMessagesList[] | undefined
      hasError: boolean
    }
    const initialProps: HookProps = { mails, hasError: false }

    // Online pass: write-through
    const { rerender, result } = renderHook(
      (props: HookProps) =>
        useOfflineMailList({
          accountId: '0',
          folderPath: 'INBOX',
          mails: props.mails,
          hasError: props.hasError,
        }),
      { initialProps }
    )

    expect(result.current.isShowingCache).toBe(false)

    // Give the async cache write a tick
    await waitFor(async () => {
      // Offline pass: fallback served from IndexedDB
      mockIsOnline = false
      rerender({ mails: undefined, hasError: true })
      await waitFor(() => {
        expect(result.current.isShowingCache).toBe(true)
      })
    })

    expect(result.current.cachedMails).toHaveLength(2)
    // Sorted by date desc
    expect(result.current.cachedMails![0]!.id).toBe('m2')
    expect(result.current.cachedMails![1]!.id).toBe('m1')
  })

  it('does not fall back while online', () => {
    const { result } = renderHook(() =>
      useOfflineMailList({
        accountId: '0',
        folderPath: 'INBOX',
        mails: undefined,
        hasError: true,
      })
    )
    expect(result.current.isShowingCache).toBe(false)
    expect(result.current.cachedMails).toBeNull()
  })
})
