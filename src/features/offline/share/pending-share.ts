import type { PendingShareRecord } from '../types'

const DB_NAME = 'sogo-share-pending'
const STORE = 'share'
const RECORD_ID = 'latest'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
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

export async function consumePendingShare(): Promise<PendingShareRecord | null> {
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
    return record
  } finally {
    db.close()
  }
}
