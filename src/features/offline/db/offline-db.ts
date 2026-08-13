import Dexie, { type EntityTable } from 'dexie'
import type {
  CachedFolderRecord,
  CachedMailBodyRecord,
  CachedMailHeaderRecord,
  LocalDraftRecord,
  MetaIdentityRecord,
  OutboxAttachmentRecord,
  OutboxRecord,
} from '../types'

export type OfflineDatabase = Dexie & {
  drafts: EntityTable<LocalDraftRecord, 'id'>
  outbox: EntityTable<OutboxRecord, 'id'>
  outboxAttachments: EntityTable<OutboxAttachmentRecord, 'id'>
  cachedFolders: EntityTable<CachedFolderRecord, 'id'>
  cachedMailHeaders: EntityTable<CachedMailHeaderRecord, 'id'>
  cachedMailBodies: EntityTable<CachedMailBodyRecord, 'id'>
  metaIdentities: EntityTable<MetaIdentityRecord, 'id'>
}

const dbCache = new Map<string, OfflineDatabase>()

function createOfflineDb(userId: string): OfflineDatabase {
  const db = new Dexie(`sogo-offline-${userId}`) as OfflineDatabase
  db.version(1).stores({
    drafts: 'id, userId, updatedAt',
    outbox: 'id, userId, status, updatedAt',
    outboxAttachments: 'id, outboxId',
    cachedFolders: 'id, userId, accountId, updatedAt',
    cachedMailHeaders: 'id, userId, accountId, folderPath, updatedAt',
    cachedMailBodies: 'id, userId, lastAccessedAt, updatedAt',
    metaIdentities: 'id, userId, updatedAt',
  })
  return db
}

export function getOfflineDb(userId: string): OfflineDatabase {
  let db = dbCache.get(userId)
  if (!db) {
    db = createOfflineDb(userId)
    dbCache.set(userId, db)
  }
  return db
}

export async function closeOfflineDb(userId: string): Promise<void> {
  const db = dbCache.get(userId)
  if (db) {
    db.close()
    dbCache.delete(userId)
  }
}

export async function deleteOfflineDb(userId: string): Promise<void> {
  await closeOfflineDb(userId)
  await Dexie.delete(`sogo-offline-${userId}`)
}
