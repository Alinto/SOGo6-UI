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
import { listCachedMailHeaders } from '../../db/mail-cache-store'
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

import {
  isCacheableListView,
  useOfflineMailList,
} from '../use-offline-mail-list'

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
      error: unknown
    }
    const initialProps: HookProps = { mails, error: undefined }

    // Online pass: write-through
    const { rerender, result } = renderHook(
      (props: HookProps) =>
        useOfflineMailList({
          accountId: '0',
          folderPath: 'INBOX',
          mails: props.mails,
          error: props.error,
          writeThrough: true,
        }),
      { initialProps }
    )

    expect(result.current.isShowingCache).toBe(false)

    await waitFor(async () => {
      expect(await listCachedMailHeaders(userId, '0', 'INBOX')).toHaveLength(2)
    })

    mockIsOnline = false
    rerender({ mails: undefined, error: { status: 'FETCH_ERROR' } })

    await waitFor(() => {
      expect(result.current.cachedMails).toHaveLength(2)
    })
    // Sorted by date desc
    expect(result.current.cachedMails![0]!.id).toBe('m2')
    expect(result.current.cachedMails![1]!.id).toBe('m1')
    expect(result.current.cachedAt).toEqual(expect.any(Number))
  })

  it('does not fall back while online without an error', () => {
    const { result } = renderHook(() =>
      useOfflineMailList({
        accountId: '0',
        folderPath: 'INBOX',
        mails: undefined,
        error: undefined,
      })
    )
    expect(result.current.isShowingCache).toBe(false)
    expect(result.current.cachedMails).toBeNull()
  })

  it('falls back when the query failed even if still marked online', async () => {
    const mails = [
      makeMail('m1', '2026-08-01T10:00:00Z'),
      makeMail('m2', '2026-08-02T10:00:00Z'),
    ]

    mockIsOnline = true
    const { rerender, result } = renderHook(
      (props: { mails: ImapMessagesList[] | undefined; error: unknown }) =>
        useOfflineMailList({
          accountId: '0',
          folderPath: 'INBOX',
          mails: props.mails,
          error: props.error,
          writeThrough: true,
        }),
      {
        initialProps: {
          mails: mails as ImapMessagesList[] | undefined,
          error: undefined as unknown,
        },
      }
    )

    await waitFor(async () => {
      expect(await listCachedMailHeaders(userId, '0', 'INBOX')).toHaveLength(2)
    })

    rerender({ mails: undefined, error: { status: 503 } })

    await waitFor(() => {
      expect(result.current.cachedMails).toHaveLength(2)
    })
  })

  it('does not serve the cache online when the server answers 404/403', async () => {
    await renderAndCache([makeMail('m1', '2026-08-01T10:00:00Z')])
    for (const status of [404, 403]) {
      const { result } = renderHook(() =>
        useOfflineMailList({
          accountId: '0',
          folderPath: 'INBOX',
          mails: undefined,
          error: { status },
        })
      )
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(result.current.isShowingCache).toBe(false)
    }
  })

  it('does not write lists that are not the plain first page', async () => {
    renderHook(() =>
      useOfflineMailList({
        accountId: '0',
        folderPath: 'INBOX',
        mails: [makeMail('s1', '2026-08-01T10:00:00Z')],
        error: undefined,
        writeThrough: false,
      })
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(await listCachedMailHeaders(userId, '0', 'INBOX')).toHaveLength(0)
  })

  it('merges a new first page with older cached rows', async () => {
    await renderAndCache([
      makeMail('new', '2026-08-03T10:00:00Z'),
      makeMail('deleted', '2026-08-03T12:00:00Z'),
      makeMail('old', '2026-07-01T10:00:00Z'),
    ])
    await renderAndCache([
      makeMail('newest', '2026-08-04T10:00:00Z'),
      makeMail('new', '2026-08-03T10:00:00Z'),
    ])
    await waitFor(async () => {
      const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
      expect(rows.map((row) => row.mailId)).toEqual(['newest', 'new', 'old'])
    })
  })
})

async function renderAndCache(mails: ImapMessagesList[]) {
  const ids = mails.map((m) => m.id)
  renderHook(() =>
    useOfflineMailList({
      accountId: '0',
      folderPath: 'INBOX',
      mails,
      error: undefined,
      writeThrough: true,
    })
  )
  await waitFor(async () => {
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    const cached = new Set(rows.map((row) => row.mailId))
    expect(ids.every((id) => cached.has(id))).toBe(true)
  })
}

describe('isCacheableListView', () => {
  const base = {
    page: 1,
    isSearchActive: false,
    isVirtualFolder: false,
    filter: null,
    sort: null,
  }

  it('accepts the plain first page', () => {
    expect(isCacheableListView(base)).toBe(true)
    expect(isCacheableListView({ ...base, filter: 'all' })).toBe(true)
    expect(isCacheableListView({ ...base, sort: 't_asc' })).toBe(true)
  })

  it.each([
    ['page 2', { page: 2 }],
    ['search', { isSearchActive: true }],
    ['virtual folder', { isVirtualFolder: true }],
    ['quick filter', { filter: 'unread' }],
    ['size sort', { sort: 's_desc' }],
    ['oldest first', { sort: 't_desc' }],
  ])('rejects %s', (_label, overrides) => {
    expect(isCacheableListView({ ...base, ...overrides })).toBe(false)
  })
})
