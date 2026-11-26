import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
  type PendingShareRecord,
} from '../types'

export const SHARE_PENDING_DB_NAME = 'sogo-share-pending'
export const SHARE_SESSION_KEY = 'sogo_pending_share'
const STORE = 'share'
const RECORD_ID = 'latest'

/**
 * A share is stored before login (no user yet): one left unconsumed must not
 * surface in a later session, possibly another user's.
 */
export const PENDING_SHARE_TTL_MS = 10 * 60 * 1000

export function isPendingShareFresh(
  createdAt: unknown,
  now: number = Date.now()
): boolean {
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) {
    return false
  }
  const age = now - createdAt
  return age >= 0 && age <= PENDING_SHARE_TTL_MS
}

export function capShareFiles<T extends { size: number }>(files: T[]): T[] {
  const kept: T[] = []
  let bytes = 0
  for (const file of files) {
    if (kept.length >= ATTACHMENT_MAX_COUNT) break
    if (file.size > ATTACHMENT_MAX_BYTES) continue
    if (bytes + file.size > ATTACHMENT_MAX_BYTES) continue
    kept.push(file)
    bytes += file.size
  }
  return kept
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SHARE_PENDING_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePendingShare(
  record: Omit<PendingShareRecord, 'id' | 'createdAt'> & {
    createdAt?: number
  }
): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.objectStore(STORE).put({
        id: RECORD_ID,
        to: record.to,
        subject: record.subject,
        body: record.body,
        url: record.url,
        files: record.files,
        createdAt: record.createdAt ?? Date.now(),
      } satisfies PendingShareRecord)
    })
  } finally {
    db.close()
  }
}

export function consumeShareSession(): PendingShareRecord | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SHARE_SESSION_KEY)
    if (!raw) return null
    sessionStorage.removeItem(SHARE_SESSION_KEY)
    const parsed = JSON.parse(raw) as Partial<PendingShareRecord>
    if (!isPendingShareFresh(parsed.createdAt)) return null
    return {
      id: RECORD_ID,
      to: String(parsed.to ?? ''),
      subject: String(parsed.subject ?? ''),
      body: String(parsed.body ?? ''),
      url: String(parsed.url ?? ''),
      files: [],
      createdAt: parsed.createdAt as number,
    }
  } catch {
    return null
  }
}

export async function consumePendingShare(): Promise<PendingShareRecord | null> {
  try {
    const db = await openDb()
    try {
      const record = await new Promise<PendingShareRecord | null>(
        (resolve, reject) => {
          const tx = db.transaction(STORE, 'readwrite')
          const store = tx.objectStore(STORE)
          const getReq = store.get(RECORD_ID)
          getReq.onsuccess = () => {
            const value =
              (getReq.result as PendingShareRecord | undefined) ?? null
            if (value) store.delete(RECORD_ID)
            resolve(value)
          }
          getReq.onerror = () => reject(getReq.error)
        }
      )
      if (record && isPendingShareFresh(record.createdAt)) return record
    } finally {
      db.close()
    }
  } catch {
    // IndexedDB unavailable — fall through to sessionStorage.
  }
  return consumeShareSession()
}
