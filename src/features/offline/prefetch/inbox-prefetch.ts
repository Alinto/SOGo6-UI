import type { ImapFolder, ImapMessagesList } from '@/features/mails/mails-types'
import { getFolderHeadersCachedAt } from '../db/mail-cache-store'
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
    }[]
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
      toHeaderRows(accountId, folderPath, mails)
    )
  }
  return mails
}

export async function prefetchInboxCache(
  userId: string,
  accountId: string,
  api: InboxPrefetchApi,
  cache: InboxPrefetchCache,
  now = Date.now()
): Promise<void> {
  const cachedAt = await getFolderHeadersCachedAt(userId, accountId, 'INBOX')
  if (cachedAt != null && now - cachedAt < MAIL_CACHE_PREFETCH_FRESH_MS) {
    return
  }

  const folders = await api.fetchFolders()
  if (folders.length) {
    await cache.cacheFolders(accountId, folders)
  }

  const inboxMails = await cacheFolderMails(
    accountId,
    'INBOX',
    MAIL_CACHE_HEADERS_PER_FOLDER,
    api,
    cache
  )

  const sent = findFolderByType(folders, 'SENT')
  if (sent?.path && sent.path !== 'INBOX') {
    await cacheFolderMails(
      accountId,
      sent.path,
      MAIL_CACHE_HEADERS_PER_FOLDER,
      api,
      cache
    )
  }

  const toPrefetch = inboxMails.slice(0, MAIL_CACHE_PREFETCH_BODIES)
  for (const mail of toPrefetch) {
    try {
      const payload = await api.fetchMail('INBOX', mail.id)
      if (payload) {
        await cache.cacheBody(accountId, 'INBOX', mail.id, payload)
      }
    } catch {
      // Best-effort: a missing body still leaves the header list usable.
    }
  }
}
