/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import type { ImapFolder, ImapMessagesList } from '@/features/mails/mails-types'
import { saveMailHeaders } from '../../db/mail-cache-store'
import { wipeOfflineUserData } from '../../db/wipe'
import { MAIL_CACHE_PREFETCH_FRESH_MS } from '../../types'
import { prefetchInboxCache } from '../inbox-prefetch'

const userId = 'user@example.org'

function mail(id: string): ImapMessagesList {
  return {
    id,
    subject: id,
    from: { name: 'A', email: 'a@b.c' },
    to: [],
    date: '2026-08-20T10:00:00Z',
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  }
}

describe('prefetchInboxCache', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('caches inbox and sent headers then prefetches inbox bodies', async () => {
    const folders: ImapFolder[] = [
      {
        name: 'Inbox',
        path: 'INBOX',
        type: 'INBOX',
        unseen_count: 0,
        messages: 1,
        flags: [],
        delimiter: '/',
        readOnly: false,
        selectable: true,
      },
      {
        name: 'Sent',
        path: 'Sent',
        type: 'SENT',
        unseen_count: 0,
        messages: 1,
        flags: [],
        delimiter: '/',
        readOnly: false,
        selectable: true,
      },
    ]
    const cacheFolders = jest.fn(async () => undefined)
    const cacheHeaders = jest.fn(async () => undefined)
    const cacheBody = jest.fn(async () => undefined)
    const fetchMail = jest.fn(async (_folder: string, id: string) => ({
      id,
      body: 'hi',
    }))

    await prefetchInboxCache(
      userId,
      '0',
      {
        fetchFolders: async () => folders,
        fetchFolderMails: async (folder) => [mail(`${folder}-1`)],
        fetchMail,
      },
      { cacheFolders, cacheHeaders, cacheBody }
    )

    expect(cacheFolders).toHaveBeenCalledWith('0', folders)
    expect(cacheHeaders).toHaveBeenCalledTimes(2)
    expect(fetchMail).toHaveBeenCalledWith('INBOX', 'INBOX-1')
    expect(cacheBody).toHaveBeenCalled()
  })

  it('skips network when inbox headers are fresh', async () => {
    await saveMailHeaders(userId, [
      {
        id: `${userId}:0:INBOX:m1`,
        userId,
        accountId: '0',
        folderPath: 'INBOX',
        mailId: 'm1',
        subject: 's',
        from: 'a@b.c',
        date: '2026-08-20T10:00:00Z',
        seen: false,
        hasAttachment: false,
        payloadJson: '{}',
        updatedAt: Date.now(),
      },
    ])
    const fetchFolders = jest.fn(async () => [])
    await prefetchInboxCache(
      userId,
      '0',
      {
        fetchFolders,
        fetchFolderMails: async () => [],
        fetchMail: async () => null,
      },
      {
        cacheFolders: async () => undefined,
        cacheHeaders: async () => undefined,
        cacheBody: async () => undefined,
      },
      Date.now() + MAIL_CACHE_PREFETCH_FRESH_MS / 2
    )
    expect(fetchFolders).not.toHaveBeenCalled()
  })
})
