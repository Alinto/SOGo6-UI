import type { ImapFolder, ImapMessagesList } from '@/features/mails/mails-types'
import { getKv, setKv } from '../db/kv-store'
import {
  MAIL_CACHE_HEADERS_PER_FOLDER,
  MAIL_CACHE_PREFETCH_BODIES,
  MAIL_CACHE_PREFETCH_FRESH_MS,
} from '../types'
import { findFolderByType } from './folder-tree'

export interface InboxPrefetchCache {
  cacheFolders: (accountId: string, folders: unknown) => Promise<void>
  cacheHeaders: (
    accountId: string,
    folderPath: string,
    headers: {
      accountId: string
      folderPath: string
      mailId: string
      subject: string
      from: string
      date: string
      seen: boolean
      hasAttachment: boolean
      payloadJson: string
    }[],
    options?: { complete?: boolean }
  ) => Promise<void>
  cacheBody: (
    accountId: string,
    folderPath: string,
    mailId: string,
    payload: unknown
  ) => Promise<void>
}

export interface InboxPrefetchApi {
  fetchFolders: () => Promise<ImapFolder[]>
  fetchFolderMails: (
    folder: string,
    pageSize: number
  ) => Promise<ImapMessagesList[]>
  fetchMail: (folder: string, mailId: string) => Promise<unknown>
}

function toHeaderRows(
  accountId: string,
  folderPath: string,
  mails: ImapMessagesList[]
) {
  return mails.map((mail) => ({
    accountId,
    folderPath,
    mailId: mail.id,
    subject: mail.subject,
    from: mail.from?.email ?? '',
    date: mail.date,
    seen: mail.seen,
    hasAttachment: mail.hasAttachment,
    payloadJson: JSON.stringify(mail),
  }))
}

async function cacheFolderMails(
  accountId: string,
  folderPath: string,
  pageSize: number,
  api: InboxPrefetchApi,
  cache: InboxPrefetchCache
): Promise<ImapMessagesList[]> {
  const mails = await api.fetchFolderMails(folderPath, pageSize)
  if (mails.length) {
    await cache.cacheHeaders(
      accountId,
      folderPath,
      toHeaderRows(accountId, folderPath, mails),
      { complete: mails.length < pageSize }
    )
  }
  return mails
}

/**
 * Last completed prefetch, per account. Kept apart from the headers'
 * `updatedAt`: the folder list writes Inbox through on every visit, which
 * would otherwise make the prefetch (Sent, top bodies) look always fresh.
 */
export function prefetchKvKey(accountId: string): string {
  return `inboxPrefetchedAt:${accountId}`
}

async function readPrefetchedAt(
  userId: string,
  accountId: string
): Promise<number | null> {
  try {
    const value = Number(await getKv(userId, prefetchKvKey(accountId)))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

/**
 * Warm the offline cache for an account: folder tree, Inbox and Sent
 * headers, top Inbox bodies. Best-effort: never rejects.
 */
export async function prefetchInboxCache(
  userId: string,
  accountId: string,
  api: InboxPrefetchApi,
  cache: InboxPrefetchCache,
  now = Date.now()
): Promise<void> {
  try {
    await runPrefetch(userId, accountId, api, cache, now)
  } catch (error) {
    console.warn('[offline] inbox prefetch failed', error)
  }
}

async function runPrefetch(
  userId: string,
  accountId: string,
  api: InboxPrefetchApi,
  cache: InboxPrefetchCache,
  now: number
): Promise<void> {
  const prefetchedAt = await readPrefetchedAt(userId, accountId)
  if (
    prefetchedAt != null &&
    now - prefetchedAt < MAIL_CACHE_PREFETCH_FRESH_MS
  ) {
    return
  }

  const folders = await api.fetchFolders()
  if (folders.length) {
    await cache.cacheFolders(accountId, folders)
  }

  const inboxPath = findFolderByType(folders, 'INBOX')?.path || 'INBOX'
  const inboxMails = await cacheFolderMails(
    accountId,
    inboxPath,
    MAIL_CACHE_HEADERS_PER_FOLDER,
    api,
    cache
  )

  const sent = findFolderByType(folders, 'SENT')
  if (sent?.path && sent.path !== inboxPath) {
    try {
      await cacheFolderMails(
        accountId,
        sent.path,
        MAIL_CACHE_HEADERS_PER_FOLDER,
        api,
        cache
      )
    } catch {
      // Best-effort: Inbox stays usable without Sent.
    }
  }

  const toPrefetch = inboxMails.slice(0, MAIL_CACHE_PREFETCH_BODIES)
  for (const mail of toPrefetch) {
    try {
      const payload = await api.fetchMail(inboxPath, mail.id)
      if (payload) {
        await cache.cacheBody(accountId, inboxPath, mail.id, payload)
      }
    } catch {
      // Best-effort: a missing body still leaves the header list usable.
    }
  }

  await setKv(userId, prefetchKvKey(accountId), now)
}
