export type OutboxStatus = 'pending' | 'sending' | 'failed'

export interface LocalDraftAttachmentMeta {
  id: string
  name: string
  size: number
  type: string
  blob?: Blob
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

export interface KvRecord {
  key: string
  value: string | number | boolean
}

export interface CachedCalendarEventRecord {
  id: string
  userId: string
  rangeStart: string
  rangeEnd: string
  payloadJson: string
  updatedAt: number
}

export interface PendingShareFile {
  name: string
  type: string
  blob: Blob
}

export interface PendingShareRecord {
  id: string
  to: string
  subject: string
  body: string
  url: string
  files: PendingShareFile[]
  createdAt: number
}

export const OUTBOX_FLUSH_SYNC_TAG = 'outbox-flush'

export const MAIL_CACHE_HEADERS_PER_FOLDER = 75
export const MAIL_CACHE_BODIES_MAX = 100
export const MAIL_CACHE_TTL_MS = 10 * 24 * 60 * 60 * 1000
export const MAIL_CACHE_PREFETCH_FRESH_MS = 60 * 60 * 1000
export const MAIL_CACHE_PREFETCH_BODIES = 10

export const STORAGE_QUOTA_HEADROOM = 0.9
export const KV_PERSIST_ASKED_AT = 'persistAskedAt'

export const ATTACHMENT_MAX_COUNT = 10
export const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024

export const OUTBOX_FLUSH_MAX_RETRIES = 5
export const OUTBOX_INTERRUPTED_ERROR = 'interrupted'

export const PERSIST_RETRY_MS = 7 * 24 * 60 * 60 * 1000

export const CALENDAR_CACHE_DAYS = 7
