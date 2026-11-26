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
  accountId: string,
  now = Date.now()
): Promise<CachedFolderRecord | undefined> {
  const row = await getOfflineDb(userId).cachedFolders.get(
    `${userId}:${accountId}`
  )
  if (!row || row.updatedAt < now - MAIL_CACHE_TTL_MS) return undefined
  return row
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

export interface SaveMailHeadersOptions {
  /**
   * The incoming rows are the whole folder (last page reached): every cached
   * row missing from them is gone from the server.
   */
  complete?: boolean
}

/**
 * Merge the newest page of a folder into its cached snapshot.
 * Rows dated within the range covered by `headers` (from their oldest date
 * up) that are not in `headers` were deleted or moved on the server: they
 * are dropped, with their cached body. Older rows are kept, then the folder
 * is capped to its MAIL_CACHE_HEADERS_PER_FOLDER most recent mails.
 * `headers` must be the first page of the folder sorted newest first.
 */
export async function saveMailHeaders(
  userId: string,
  headers: CachedMailHeaderRecord[],
  options: SaveMailHeadersOptions = {}
): Promise<void> {
  const db = getOfflineDb(userId)
  const folders = new Map<string, CachedMailHeaderRecord[]>()
  for (const header of headers) {
    const key = `${header.accountId}\0${header.folderPath}`
    const rows = folders.get(key) ?? []
    rows.push(header)
    folders.set(key, rows)
  }

  await db.transaction(
    'rw',
    db.cachedMailHeaders,
    db.cachedMailBodies,
    async () => {
      for (const [, folderHeaders] of folders) {
        const accountId = folderHeaders[0]!.accountId
        const folderPath = folderHeaders[0]!.folderPath
        const incomingIds = new Set(folderHeaders.map((h) => h.id))
        const oldestIncoming = Math.min(
          ...folderHeaders.map((h) => mailDateMs(h.date))
        )
        const existing = await db.cachedMailHeaders
          .where('[userId+accountId+folderPath]')
          .equals([userId, accountId, folderPath])
          .toArray()

        const goneIds: string[] = []
        const kept: CachedMailHeaderRecord[] = []
        for (const row of existing) {
          if (incomingIds.has(row.id)) continue
          if (options.complete || mailDateMs(row.date) >= oldestIncoming) {
            goneIds.push(row.id)
          } else {
            kept.push(row)
          }
        }

        const merged = sortHeadersByMailDateDesc([...folderHeaders, ...kept])
        const retained = merged.slice(0, MAIL_CACHE_HEADERS_PER_FOLDER)
        const evictedIds = merged
          .slice(MAIL_CACHE_HEADERS_PER_FOLDER)
          .filter((row) => !incomingIds.has(row.id))
          .map((row) => row.id)
        const retainedIncoming = retained.filter((row) =>
          incomingIds.has(row.id)
        )

        if (goneIds.length || evictedIds.length) {
          await db.cachedMailHeaders.bulkDelete([...goneIds, ...evictedIds])
        }
        // Header and body share the same id: a mail gone from the server
        // must not stay readable from the cache.
        if (goneIds.length) {
          await db.cachedMailBodies.bulkDelete(goneIds)
        }
        if (retainedIncoming.length) {
          await db.cachedMailHeaders.bulkPut(retainedIncoming)
        }
      }
    }
  )
}

function ttlCutoff(now = Date.now()): number {
  return now - MAIL_CACHE_TTL_MS
}

export async function listCachedMailHeaders(
  userId: string,
  accountId: string,
  folderPath: string,
  now = Date.now()
): Promise<CachedMailHeaderRecord[]> {
  const cutoff = ttlCutoff(now)
  const rows = await getOfflineDb(userId)
    .cachedMailHeaders.where('[userId+accountId+folderPath]')
    .equals([userId, accountId, folderPath])
    .toArray()
  return sortHeadersByMailDateDesc(rows.filter((r) => r.updatedAt >= cutoff))
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

  // One database per user: the whole table is this user's bodies.
  const count = await db.cachedMailBodies.count()
  const excess = count - MAIL_CACHE_BODIES_MAX
  if (excess > 0) {
    const leastRecent = await db.cachedMailBodies
      .orderBy('lastAccessedAt')
      .limit(excess)
      .primaryKeys()
    await db.cachedMailBodies.bulkDelete(leastRecent)
  }
}

export async function getMailBody(
  userId: string,
  id: string,
  now = Date.now()
): Promise<CachedMailBodyRecord | undefined> {
  const db = getOfflineDb(userId)
  const body = await db.cachedMailBodies.get(id)
  if (!body) return undefined
  if (body.updatedAt < ttlCutoff(now)) {
    await db.cachedMailBodies.delete(id)
    return undefined
  }
  // Touch only the LRU key, not the whole (possibly large) payload.
  await db.cachedMailBodies.update(id, { lastAccessedAt: now })
  return { ...body, lastAccessedAt: now }
}

/** Forget one mail (header + body), e.g. the server says it is gone. */
export async function deleteCachedMail(
  userId: string,
  id: string
): Promise<void> {
  const db = getOfflineDb(userId)
  await db.transaction(
    'rw',
    db.cachedMailHeaders,
    db.cachedMailBodies,
    async () => {
      await db.cachedMailHeaders.delete(id)
      await db.cachedMailBodies.delete(id)
    }
  )
}

export async function saveMetaIdentities(
  record: MetaIdentityRecord
): Promise<void> {
  await getOfflineDb(record.userId).metaIdentities.put(record)
}

export async function getMetaIdentities(
  userId: string,
  now = Date.now()
): Promise<MetaIdentityRecord | undefined> {
  const row = await getOfflineDb(userId).metaIdentities.get(userId)
  if (!row || row.updatedAt < now - MAIL_CACHE_TTL_MS) return undefined
  return row
}

/**
 * Drop every cached read-only record older than the TTL: bodies, headers,
 * folder trees, identities and the calendar snapshot. Local drafts (unsaved
 * user content) and the kv flags are left alone.
 */
export async function purgeExpiredCache(
  userId: string,
  now = Date.now()
): Promise<void> {
  const db = getOfflineDb(userId)
  const cutoff = ttlCutoff(now)
  await db.transaction(
    'rw',
    [
      db.cachedMailBodies,
      db.cachedMailHeaders,
      db.cachedFolders,
      db.metaIdentities,
      db.cachedCalendarEvents,
    ],
    async () => {
      await db.cachedMailBodies.where('updatedAt').below(cutoff).delete()
      await db.cachedMailHeaders.where('updatedAt').below(cutoff).delete()
      await db.cachedFolders.where('updatedAt').below(cutoff).delete()
      await db.metaIdentities.where('updatedAt').below(cutoff).delete()
      await db.cachedCalendarEvents.where('updatedAt').below(cutoff).delete()
    }
  )
}
