import type {
  OutboxAttachmentRecord,
  OutboxRecord,
  OutboxStatus,
} from '../types'
import { getOfflineDb } from './offline-db'

export async function upsertOutboxItem(item: OutboxRecord): Promise<void> {
  await getOfflineDb(item.userId).outbox.put(item)
}

/**
 * Atomic enqueue: record + attachment blobs in one transaction, so a
 * partial failure never leaves orphan blobs or a record without its files.
 */
export async function putOutboxWithAttachments(
  record: OutboxRecord,
  attachments: OutboxAttachmentRecord[]
): Promise<void> {
  const db = getOfflineDb(record.userId)
  await db.transaction('rw', db.outbox, db.outboxAttachments, async () => {
    if (attachments.length) {
      await db.outboxAttachments.bulkPut(attachments)
    }
    await db.outbox.put(record)
  })
}

export async function getOutboxItem(
  userId: string,
  id: string
): Promise<OutboxRecord | undefined> {
  return getOfflineDb(userId).outbox.get(id)
}

export async function listOutbox(userId: string): Promise<OutboxRecord[]> {
  const items = await getOfflineDb(userId)
    .outbox.where('userId')
    .equals(userId)
    .toArray()
  return items.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function countPendingOutbox(userId: string): Promise<number> {
  return getOfflineDb(userId)
    .outbox.where('userId')
    .equals(userId)
    .filter((i) => i.status === 'pending' || i.status === 'failed')
    .count()
}

export async function updateOutboxStatus(
  userId: string,
  id: string,
  status: OutboxStatus,
  patch?: Partial<Pick<OutboxRecord, 'retryCount' | 'lastError' | 'updatedAt'>>
): Promise<void> {
  const db = getOfflineDb(userId)
  const existing = await db.outbox.get(id)
  if (!existing) return
  await db.outbox.put({
    ...existing,
    status,
    retryCount: patch?.retryCount ?? existing.retryCount,
    lastError:
      patch?.lastError !== undefined ? patch.lastError : existing.lastError,
    updatedAt: patch?.updatedAt ?? Date.now(),
  })
}

export async function deleteOutboxItem(
  userId: string,
  id: string
): Promise<void> {
  const db = getOfflineDb(userId)
  const item = await db.outbox.get(id)
  if (item?.attachmentIds?.length) {
    await db.outboxAttachments.bulkDelete(item.attachmentIds)
  }
  await db.outbox.delete(id)
}

export async function putOutboxAttachment(
  userId: string,
  attachment: OutboxAttachmentRecord
): Promise<void> {
  await getOfflineDb(userId).outboxAttachments.put(attachment)
}

export async function getOutboxAttachments(
  userId: string,
  outboxId: string
): Promise<OutboxAttachmentRecord[]> {
  return getOfflineDb(userId)
    .outboxAttachments.where('outboxId')
    .equals(outboxId)
    .toArray()
}

export async function deleteOutboxAttachment(
  userId: string,
  attachmentId: string
): Promise<void> {
  await getOfflineDb(userId).outboxAttachments.delete(attachmentId)
}
