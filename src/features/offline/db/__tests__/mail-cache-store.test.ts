/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { MAIL_CACHE_HEADERS_PER_FOLDER } from '../../types'
import {
  getFolderHeadersCachedAt,
  listCachedMailHeaders,
  saveMailHeaders,
} from '../mail-cache-store'
import { wipeOfflineUserData } from '../wipe'

const userId = 'user@example.org'

function header(
  folderPath: string,
  mailId: string,
  date: string,
  updatedAt = Date.now()
) {
  return {
    id: `${userId}:0:${folderPath}:${mailId}`,
    userId,
    accountId: '0',
    folderPath,
    mailId,
    subject: mailId,
    from: 'a@b.c',
    date,
    seen: false,
    hasAttachment: false,
    payloadJson: '{}',
    updatedAt,
  }
}

describe('mail-cache-store indexes', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('evicts oldest mails by date, not cache write time', async () => {
    const now = Date.now()
    const inbox = Array.from(
      { length: MAIL_CACHE_HEADERS_PER_FOLDER },
      (_, i) =>
        header(
          'INBOX',
          `new-${i}`,
          `2026-08-${String((i % 27) + 1).padStart(2, '0')}T10:00:00Z`,
          now
        )
    )
    await saveMailHeaders(userId, inbox)

    await saveMailHeaders(userId, [
      header('INBOX', 'ancient', '2010-01-01T00:00:00Z', now + 10_000),
    ])

    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows).toHaveLength(MAIL_CACHE_HEADERS_PER_FOLDER)
    expect(rows.some((row) => row.mailId === 'ancient')).toBe(false)
  })

  it('does not evict Inbox when another folder is written', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'keep', '2026-08-20T10:00:00Z'),
    ])
    await saveMailHeaders(userId, [
      header('Archive', 'old', '2011-01-01T00:00:00Z'),
    ])
    const inbox = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(inbox.map((row) => row.mailId)).toEqual(['keep'])
    expect(await getFolderHeadersCachedAt(userId, '0', 'INBOX')).toEqual(
      expect.any(Number)
    )
  })
})
