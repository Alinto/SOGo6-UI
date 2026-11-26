import type {
  OutboxAttachmentRecord,
  OutboxRecord,
  OutboxStatus,
} from '../types'
import { getOfflineDb } from './offline-db'

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
    const existing = await db.outbox.get(record.id)
    const keepIds = new Set(attachments.map((attachment) => attachment.id))
    const staleIds = (existing?.attachmentIds ?? []).filter(
      (id) => !keepIds.has(id)
    )
    if (staleIds.length) {
      await db.outboxAttachments.bulkDelete(staleIds)
    }
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
  await db.transaction('rw', db.outbox, async () => {
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
  })
}

export async function deleteOutboxItem(
  userId: string,
  id: string
): Promise<void> {
  const db = getOfflineDb(userId)
  await db.transaction('rw', db.outbox, db.outboxAttachments, async () => {
    const item = await db.outbox.get(id)
    if (item?.attachmentIds?.length) {
      await db.outboxAttachments.bulkDelete(item.attachmentIds)
    }
    await db.outbox.delete(id)
  })
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

/**
 * Compare-and-set claim before a send: succeeds only when the record still
 * matches the `expected` snapshot (no edit hold / content change since) and
 * `canSend` accepts it. IndexedDB serialises rw transactions across tabs, so
 * a concurrent edit hold and this claim cannot both win.
 */
export async function claimOutboxForSend(
  userId: string,
  expected: Pick<OutboxRecord, 'id' | 'updatedAt' | 'editHeldAt'>,
  canSend: (record: OutboxRecord) => boolean
): Promise<OutboxRecord | null> {
  const db = getOfflineDb(userId)
  return db.transaction('rw', db.outbox, async () => {
    const current = await db.outbox.get(expected.id)
    if (!current) return null
    if (current.updatedAt !== expected.updatedAt) return null
    if ((current.editHeldAt ?? null) !== (expected.editHeldAt ?? null)) {
      return null
    }
    if (!canSend(current)) return null
    const claimed: OutboxRecord = {
      ...current,
      status: 'sending',
      editHeldAt: null,
      updatedAt: Date.now(),
    }
    await db.outbox.put(claimed)
    return claimed
  })
}

/**
 * Compare-and-set edit hold: refuses an item currently being sent (or gone).
 * Returns the fresh record on success.
 */
export async function setOutboxEditHold(
  userId: string,
  id: string
): Promise<OutboxRecord | null> {
  const db = getOfflineDb(userId)
  return db.transaction('rw', db.outbox, async () => {
    const current = await db.outbox.get(id)
    if (!current || current.status === 'sending') return null
    // Strictly increasing so a flush snapshot taken before this hold differs.
    const editHeldAt = Math.max(Date.now(), (current.editHeldAt ?? 0) + 1)
    const held: OutboxRecord = { ...current, editHeldAt }
    await db.outbox.put(held)
    return held
  })
}

export async function clearOutboxEditHold(
  userId: string,
  id: string
): Promise<void> {
  const db = getOfflineDb(userId)
  await db.transaction('rw', db.outbox, async () => {
    const current = await db.outbox.get(id)
    if (!current || current.editHeldAt == null) return
    await db.outbox.put({ ...current, editHeldAt: null })
  })
}

/**
 * Persist flush progress after each successful upload, so a retry resumes
 * on the same server draft instead of re-uploading (duplicate attachments)
 * or creating an orphan draft.
 */
export async function markOutboxAttachmentUploaded(
  userId: string,
  outboxId: string,
  attachmentId: string,
  mailKey: string
): Promise<void> {
  const db = getOfflineDb(userId)
  await db.transaction('rw', db.outbox, db.outboxAttachments, async () => {
    const attachment = await db.outboxAttachments.get(attachmentId)
    if (attachment) {
      await db.outboxAttachments.put({ ...attachment, uploaded: true })
    }
    const item = await db.outbox.get(outboxId)
    if (item && item.mailKey !== mailKey) {
      await db.outbox.put({ ...item, mailKey })
    }
  })
}
