import { deleteLocalDraft } from '../db/drafts-store'
import { getOutboxItem, putOutboxWithAttachments } from '../db/outbox-store'
import { isPwaBgSyncEnabled, isPwaOutboxEnabled } from '../flags'
import type {
  LocalDraftRecord,
  OutboxAttachmentRecord,
  OutboxRecord,
} from '../types'
import { OUTBOX_FLUSH_SYNC_TAG } from '../types'
import { notifyOutboxChanged } from './outbox-events'

export interface EnqueueOutboxInput {
  userId: string
  accountId: string
  mailKey: string | null
  identityMail: string
  replyTo?: string | null
  signatureKey: string | null
  to: OutboxRecord['to']
  cc: OutboxRecord['cc']
  bcc: OutboxRecord['bcc']
  subject: string
  body: string
  isPlainText: boolean
  priority: number
  requestReadReceipt: boolean
  attachments?: {
    id: string
    name: string
    size: number
    type: string
    blob: Blob
  }[]
  localDraftId?: string
  /** Update this Outbox row in place instead of creating a second queued message. */
  replaceOutboxId?: string
}

function newId(): string {
  return crypto.randomUUID()
}

export async function enqueueOutbox(
  input: EnqueueOutboxInput
): Promise<OutboxRecord> {
  if (!isPwaOutboxEnabled()) {
    throw new Error('PWA outbox is disabled')
  }

  const now = Date.now()
  const existing = input.replaceOutboxId
    ? await getOutboxItem(input.userId, input.replaceOutboxId)
    : undefined
  const id = input.replaceOutboxId ?? newId()
  const attachmentRecords: OutboxAttachmentRecord[] = (
    input.attachments ?? []
  ).map((att) => ({
    id: att.id,
    outboxId: id,
    name: att.name,
    size: att.size,
    type: att.type,
    blob: att.blob,
  }))
  const attachmentIds = attachmentRecords.map((a) => a.id)

  const record: OutboxRecord = {
    id,
    userId: input.userId,
    accountId: input.accountId,
    mailKey: input.mailKey,
    identityMail: input.identityMail,
    replyTo: input.replyTo ?? null,
    signatureKey: input.signatureKey,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    body: input.body,
    isPlainText: input.isPlainText,
    priority: input.priority,
    requestReadReceipt: input.requestReadReceipt,
    attachmentIds,
    status: 'pending',
    retryCount: 0,
    lastError: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await putOutboxWithAttachments(record, attachmentRecords)

  if (input.localDraftId) {
    await deleteLocalDraft(input.userId, input.localDraftId)
  }

  notifyOutboxChanged()
  await registerBackgroundSync()
  return record
}

export async function registerBackgroundSync(): Promise<boolean> {
  if (!isPwaBgSyncEnabled()) return false
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  try {
    const reg = await navigator.serviceWorker.ready
    const syncManager = (
      reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> }
      }
    ).sync
    if (!syncManager) return false
    await syncManager.register(OUTBOX_FLUSH_SYNC_TAG)
    return true
  } catch {
    return false
  }
}

export function draftToEnqueueInput(
  draft: LocalDraftRecord,
  identityMail: string
): EnqueueOutboxInput {
  return {
    userId: draft.userId,
    accountId: draft.accountId,
    mailKey: draft.mailKey,
    identityMail,
    signatureKey: draft.signatureKey,
    to: draft.to,
    cc: draft.cc,
    bcc: draft.bcc,
    subject: draft.subject,
    body: draft.body,
    isPlainText: draft.isPlainText,
    priority: draft.priority,
    requestReadReceipt: draft.requestReadReceipt,
    localDraftId: draft.id,
  }
}
