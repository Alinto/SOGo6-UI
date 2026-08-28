import { countUnseenCachedHeaders } from '../db/mail-cache-store'

export async function syncAppBadge(userId: string | null): Promise<void> {
  if (typeof navigator === 'undefined') return
  const setBadge = navigator.setAppBadge?.bind(navigator)
  const clearBadge = navigator.clearAppBadge?.bind(navigator)
  if (!setBadge && !clearBadge) return

  try {
    if (!userId) {
      await clearBadge?.()
      return
    }
    const count = await countUnseenCachedHeaders(userId)
    if (count > 0) {
      await setBadge?.(count)
    } else {
      await clearBadge?.()
    }
  } catch {
    // Badge API is optional (missing on older Safari).
  }
}
