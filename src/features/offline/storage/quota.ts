import { STORAGE_QUOTA_HEADROOM } from '../types'

export class StorageQuotaExceededError extends Error {
  constructor(message = 'StorageQuotaExceeded') {
    super(message)
    this.name = 'StorageQuotaExceededError'
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = 'name' in error ? String(error.name) : ''
  return (
    name === 'StorageQuotaExceededError' ||
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED'
  )
}

export async function estimateStorage(): Promise<{
  usage: number
  quota: number
} | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null
  }
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    if (!quota) return null
    return { usage, quota }
  } catch {
    return null
  }
}

export async function assertStorageFits(
  additionalBytes: number
): Promise<void> {
  const estimate = await estimateStorage()
  if (!estimate) return
  if (
    estimate.usage + additionalBytes >
    estimate.quota * STORAGE_QUOTA_HEADROOM
  ) {
    throw new StorageQuotaExceededError()
  }
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unit]}`
}
