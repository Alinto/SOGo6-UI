export type OutboxStatus = 'pending' | 'sending' | 'failed'

export interface LocalDraftAttachmentMeta {
  id: string
  name: string
  size: number
  type: string
}

export interface LocalDraftRecord {
  id: string
  userId: string
  accountId: string
  mailKey: string | null
  identityMail: string | null
  signatureKey: string | null
  to: { name?: string; email: string }[]
  cc: { name?: string; email: string }[]
  bcc: { name?: string; email: string }[]
  subject: string
  body: string
  isPlainText: boolean
  priority: number
  requestReadReceipt: boolean
  attachments: LocalDraftAttachmentMeta[]
  createdAt: number
  updatedAt: number
}

export interface OutboxAttachmentRecord {
  id: string
  outboxId: string
  name: string
  size: number
  type: string
  blob: Blob
}

export interface OutboxRecord {
  id: string
  userId: string
  accountId: string
  mailKey: string | null
  identityMail: string
  replyTo?: string | null
  signatureKey: string | null
  to: { name?: string; email: string }[]
  cc: { name?: string; email: string }[]
  bcc: { name?: string; email: string }[]
  subject: string
  body: string
  isPlainText: boolean
  priority: number
  requestReadReceipt: boolean
  attachmentIds: string[]
  status: OutboxStatus
  retryCount: number
  lastError: string | null
  createdAt: number
  updatedAt: number
}

export interface CachedFolderRecord {
  id: string
  userId: string
  accountId: string
  foldersJson: string
  updatedAt: number
}

export interface CachedMailHeaderRecord {
  id: string
  userId: string
  accountId: string
  folderPath: string
  mailId: string
  subject: string
  from: string
  date: string
  seen: boolean
  hasAttachment: boolean
  payloadJson: string
  updatedAt: number
}

export interface CachedMailBodyRecord {
  id: string
  userId: string
  accountId: string
  folderPath: string
  mailId: string
  payloadJson: string
  updatedAt: number
  lastAccessedAt: number
}

export interface MetaIdentityRecord {
  id: string
  userId: string
  payloadJson: string
  updatedAt: number
}

export const OUTBOX_FLUSH_SYNC_TAG = 'outbox-flush'

export const MAIL_CACHE_HEADERS_PER_FOLDER = 75
export const MAIL_CACHE_BODIES_MAX = 35
export const MAIL_CACHE_TTL_MS = 10 * 24 * 60 * 60 * 1000

export const ATTACHMENT_MAX_COUNT = 10
export const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024
