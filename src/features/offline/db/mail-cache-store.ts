import {
  MAIL_CACHE_BODIES_MAX,
  MAIL_CACHE_HEADERS_PER_FOLDER,
  MAIL_CACHE_TTL_MS,
  type CachedFolderRecord,
  type CachedMailBodyRecord,
  type CachedMailHeaderRecord,
  type MetaIdentityRecord,
} from '../types'
import { getOfflineDb } from './offline-db'

export async function saveCachedFolders(
  record: CachedFolderRecord
): Promise<void> {
  await getOfflineDb(record.userId).cachedFolders.put(record)
}

export async function getCachedFolders(
  userId: string,
  accountId: string
): Promise<CachedFolderRecord | undefined> {
  return getOfflineDb(userId).cachedFolders.get(`${userId}:${accountId}`)
}

function mailDateMs(date: string): number {
  const ms = Date.parse(date)
  return Number.isNaN(ms) ? 0 : ms
}

function sortHeadersByMailDateDesc(
  rows: CachedMailHeaderRecord[]
): CachedMailHeaderRecord[] {
  return [...rows].sort((a, b) => mailDateMs(b.date) - mailDateMs(a.date))
}

export async function saveMailHeaders(
  userId: string,
  headers: CachedMailHeaderRecord[]
): Promise<void> {
  const db = getOfflineDb(userId)
  await db.cachedMailHeaders.bulkPut(headers)

  const folders = new Map<string, { accountId: string; folderPath: string }>()
  for (const header of headers) {
    folders.set(`${header.accountId}\0${header.folderPath}`, {
      accountId: header.accountId,
      folderPath: header.folderPath,
    })
  }

  for (const { accountId, folderPath } of folders.values()) {
    const all = await db.cachedMailHeaders
      .where('[userId+accountId+folderPath]')
      .equals([userId, accountId, folderPath])
      .toArray()
    const excess = sortHeadersByMailDateDesc(all).slice(
      MAIL_CACHE_HEADERS_PER_FOLDER
    )
    if (excess.length) {
      await db.cachedMailHeaders.bulkDelete(excess.map((h) => h.id))
    }
  }
}

export async function listCachedMailHeaders(
  userId: string,
  accountId: string,
  folderPath: string
): Promise<CachedMailHeaderRecord[]> {
  const rows = await getOfflineDb(userId)
    .cachedMailHeaders.where('[userId+accountId+folderPath]')
    .equals([userId, accountId, folderPath])
    .toArray()
  return sortHeadersByMailDateDesc(rows)
}

export async function getFolderHeadersCachedAt(
  userId: string,
  accountId: string,
  folderPath: string
): Promise<number | null> {
  const rows = await listCachedMailHeaders(userId, accountId, folderPath)
  if (!rows.length) return null
  return Math.max(...rows.map((row) => row.updatedAt))
}

export async function countUnseenCachedHeaders(
  userId: string
): Promise<number> {
  return getOfflineDb(userId)
    .cachedMailHeaders.where('userId')
    .equals(userId)
    .filter((header) => !header.seen)
    .count()
}

export async function saveMailBody(
  record: CachedMailBodyRecord
): Promise<void> {
  const db = getOfflineDb(record.userId)
  await db.cachedMailBodies.put(record)

  const all = await db.cachedMailBodies
    .where('userId')
    .equals(record.userId)
    .toArray()
  all.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
  const excess = all.slice(MAIL_CACHE_BODIES_MAX)
  if (excess.length) {
    await db.cachedMailBodies.bulkDelete(excess.map((b) => b.id))
  }
}

export async function getMailBody(
  userId: string,
  id: string
): Promise<CachedMailBodyRecord | undefined> {
  const db = getOfflineDb(userId)
  const body = await db.cachedMailBodies.get(id)
  if (!body) return undefined
  const now = Date.now()
  if (now - body.updatedAt > MAIL_CACHE_TTL_MS) {
    await db.cachedMailBodies.delete(id)
    return undefined
  }
  await db.cachedMailBodies.put({ ...body, lastAccessedAt: now })
  return { ...body, lastAccessedAt: now }
}

export async function saveMetaIdentities(
  record: MetaIdentityRecord
): Promise<void> {
  await getOfflineDb(record.userId).metaIdentities.put(record)
}

export async function getMetaIdentities(
  userId: string
): Promise<MetaIdentityRecord | undefined> {
  return getOfflineDb(userId).metaIdentities.get(userId)
}

export async function purgeExpiredCache(userId: string): Promise<void> {
  const db = getOfflineDb(userId)
  const cutoff = Date.now() - MAIL_CACHE_TTL_MS
  const bodies = await db.cachedMailBodies
    .where('userId')
    .equals(userId)
    .filter((b) => b.updatedAt < cutoff)
    .toArray()
  if (bodies.length) {
    await db.cachedMailBodies.bulkDelete(bodies.map((b) => b.id))
  }
  const headers = await db.cachedMailHeaders
    .where('userId')
    .equals(userId)
    .filter((h) => h.updatedAt < cutoff)
    .toArray()
  if (headers.length) {
    await db.cachedMailHeaders.bulkDelete(headers.map((h) => h.id))
  }
}
