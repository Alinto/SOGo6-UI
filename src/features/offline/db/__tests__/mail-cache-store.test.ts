/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import {
  MAIL_CACHE_BODIES_MAX,
  MAIL_CACHE_HEADERS_PER_FOLDER,
  MAIL_CACHE_TTL_MS,
} from '../../types'
import { saveCalendarEvents } from '../calendar-cache-store'
import {
  deleteCachedMail,
  getCachedFolders,
  getFolderHeadersCachedAt,
  getMailBody,
  getMetaIdentities,
  listCachedMailHeaders,
  purgeExpiredCache,
  saveCachedFolders,
  saveMailBody,
  saveMailHeaders,
  saveMetaIdentities,
} from '../mail-cache-store'
import { getOfflineDb } from '../offline-db'
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

  it('replaces a folder snapshot so deleted mails disappear', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'keep', '2026-08-20T10:00:00Z'),
      header('INBOX', 'gone', '2026-08-21T10:00:00Z'),
    ])
    await saveMailHeaders(userId, [
      header('INBOX', 'keep', '2026-08-20T10:00:00Z'),
    ])
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows.map((row) => row.mailId)).toEqual(['keep'])
  })

  it('caps a replaced folder at MAIL_CACHE_HEADERS_PER_FOLDER', async () => {
    const now = Date.now()
    const inbox = Array.from(
      { length: MAIL_CACHE_HEADERS_PER_FOLDER + 5 },
      (_, i) =>
        header(
          'INBOX',
          `m-${i}`,
          `2026-08-${String((i % 27) + 1).padStart(2, '0')}T10:00:00Z`,
          now
        )
    )
    await saveMailHeaders(userId, inbox)
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows).toHaveLength(MAIL_CACHE_HEADERS_PER_FOLDER)
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

function body(mailId: string, lastAccessedAt: number, updatedAt = Date.now()) {
  return {
    id: `${userId}:0:INBOX:${mailId}`,
    userId,
    accountId: '0',
    folderPath: 'INBOX',
    mailId,
    payloadJson: JSON.stringify({ id: mailId }),
    updatedAt,
    lastAccessedAt,
  }
}

describe('mail-cache-store merge', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('keeps older rows outside the incoming page range', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'old', '2026-07-01T10:00:00Z'),
    ])
    await saveMailHeaders(userId, [
      header('INBOX', 'new', '2026-08-20T10:00:00Z'),
    ])
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows.map((row) => row.mailId)).toEqual(['new', 'old'])
  })

  it('drops every missing row when the page is the whole folder', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'old', '2026-07-01T10:00:00Z'),
    ])
    await saveMailHeaders(
      userId,
      [header('INBOX', 'new', '2026-08-20T10:00:00Z')],
      { complete: true }
    )
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows.map((row) => row.mailId)).toEqual(['new'])
  })

  it('drops the cached body of a mail gone from the server', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'keep', '2026-08-20T10:00:00Z'),
      header('INBOX', 'gone', '2026-08-21T10:00:00Z'),
    ])
    await saveMailBody(body('gone', Date.now()))
    await saveMailHeaders(userId, [
      header('INBOX', 'keep', '2026-08-20T10:00:00Z'),
    ])
    expect(await getMailBody(userId, `${userId}:0:INBOX:gone`)).toBeUndefined()
  })

  it('caps a merged folder to its most recent mails', async () => {
    const older = Array.from(
      { length: MAIL_CACHE_HEADERS_PER_FOLDER },
      (_, i) =>
        header(
          'INBOX',
          `old-${i}`,
          new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString()
        )
    )
    await saveMailHeaders(userId, older)
    await saveMailHeaders(userId, [
      header('INBOX', 'fresh', '2026-08-20T10:00:00Z'),
    ])
    const rows = await listCachedMailHeaders(userId, '0', 'INBOX')
    expect(rows).toHaveLength(MAIL_CACHE_HEADERS_PER_FOLDER)
    expect(rows[0]!.mailId).toBe('fresh')
    expect(rows.map((row) => row.mailId)).not.toContain('old-0')
  })
})

describe('mail-cache-store bodies', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('evicts the least recently accessed bodies beyond the cap', async () => {
    for (let i = 0; i < MAIL_CACHE_BODIES_MAX + 2; i += 1) {
      await saveMailBody(body(`m-${i}`, 1_000 + i))
    }
    const db = getOfflineDb(userId)
    expect(await db.cachedMailBodies.count()).toBe(MAIL_CACHE_BODIES_MAX)
    expect(
      await db.cachedMailBodies.get(`${userId}:0:INBOX:m-0`)
    ).toBeUndefined()
    expect(
      await db.cachedMailBodies.get(`${userId}:0:INBOX:m-1`)
    ).toBeUndefined()
    expect(await db.cachedMailBodies.get(`${userId}:0:INBOX:m-2`)).toBeDefined()
  })

  it('touches only lastAccessedAt on read', async () => {
    await saveMailBody(body('m1', 1_000, 5_000))
    const now = 6_000
    const read = await getMailBody(userId, `${userId}:0:INBOX:m1`, now)
    expect(read?.lastAccessedAt).toBe(now)
    const row = await getOfflineDb(userId).cachedMailBodies.get(
      `${userId}:0:INBOX:m1`
    )
    expect(row).toMatchObject({ lastAccessedAt: now, updatedAt: 5_000 })
  })

  it('forgets one mail (header and body)', async () => {
    await saveMailHeaders(userId, [
      header('INBOX', 'm1', '2026-08-20T10:00:00Z'),
    ])
    await saveMailBody(body('m1', Date.now()))
    await deleteCachedMail(userId, `${userId}:0:INBOX:m1`)
    expect(await listCachedMailHeaders(userId, '0', 'INBOX')).toHaveLength(0)
    expect(await getMailBody(userId, `${userId}:0:INBOX:m1`)).toBeUndefined()
  })
})

describe('mail-cache-store TTL', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('hides expired headers, folders and identities on read', async () => {
    const stale = Date.now() - MAIL_CACHE_TTL_MS - 1
    await saveMailHeaders(userId, [
      header('INBOX', 'm1', '2026-08-20T10:00:00Z', stale),
    ])
    await saveCachedFolders({
      id: `${userId}:0`,
      userId,
      accountId: '0',
      foldersJson: '[]',
      updatedAt: stale,
    })
    await saveMetaIdentities({
      id: userId,
      userId,
      payloadJson: '[]',
      updatedAt: stale,
    })
    expect(await listCachedMailHeaders(userId, '0', 'INBOX')).toHaveLength(0)
    expect(await getCachedFolders(userId, '0')).toBeUndefined()
    expect(await getMetaIdentities(userId)).toBeUndefined()
  })

  it('purges every expired cache table and keeps local drafts', async () => {
    const now = Date.now()
    const stale = now - MAIL_CACHE_TTL_MS - 1
    const db = getOfflineDb(userId)
    await saveMailHeaders(userId, [
      header('INBOX', 'm1', '2026-08-20T10:00:00Z', stale),
      header('INBOX', 'm2', '2026-08-19T10:00:00Z', now),
    ])
    await saveMailBody(body('m1', stale, stale))
    await saveCachedFolders({
      id: `${userId}:0`,
      userId,
      accountId: '0',
      foldersJson: '[]',
      updatedAt: stale,
    })
    await saveMetaIdentities({
      id: userId,
      userId,
      payloadJson: '[]',
      updatedAt: stale,
    })
    await saveCalendarEvents(userId, 'a', 'b', [])
    await db.cachedCalendarEvents.update(`${userId}:week`, { updatedAt: stale })
    await db.drafts.put({
      id: 'd1',
      userId,
      accountId: '0',
      mailKey: null,
      identityMail: null,
      signatureKey: null,
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: 'unsaved',
      isPlainText: false,
      priority: 3,
      requestReadReceipt: false,
      attachments: [],
      createdAt: stale,
      updatedAt: stale,
    })

    await purgeExpiredCache(userId, now)

    expect(await db.cachedMailHeaders.count()).toBe(1)
    expect(await db.cachedMailBodies.count()).toBe(0)
    expect(await db.cachedFolders.count()).toBe(0)
    expect(await db.metaIdentities.count()).toBe(0)
    expect(await db.cachedCalendarEvents.count()).toBe(0)
    expect(await db.drafts.count()).toBe(1)
  })
})
