import type { KvRecord } from '../types'
import { getOfflineDb } from './offline-db'

export async function getKv(
  userId: string,
  key: string
): Promise<KvRecord['value'] | undefined> {
  const row = await getOfflineDb(userId).kv.get(key)
  return row?.value
}

export async function setKv(
  userId: string,
  key: string,
  value: KvRecord['value']
): Promise<void> {
  await getOfflineDb(userId).kv.put({ key, value })
}
