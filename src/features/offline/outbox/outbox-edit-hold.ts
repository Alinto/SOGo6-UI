import { getAuthUserId } from '../auth/get-auth-token'
import { clearOutboxEditHold, setOutboxEditHold } from '../db/outbox-store'
import { OUTBOX_EDIT_HOLD_TTL_MS, type OutboxRecord } from '../types'

/**
 * Edit holds keep auto-flush and "Send all" away from a message a compose
 * window is editing — in any tab:
 * - `OutboxRecord.editHeldAt` is persisted with a compare-and-set, so every
 *   tab's flush sees it and the claim-for-send cannot race it;
 * - a shared Web Lock per item proves the editing tab is still alive (it is
 *   released automatically when the tab dies); without Web Locks the hold
 *   expires after OUTBOX_EDIT_HOLD_TTL_MS.
 */
const localHolds = new Map<string, (() => void) | null>()

function editLockName(outboxId: string): string {
  return `sogo-outbox-edit-${outboxId}`
}

function getLocks(): LockManager | undefined {
  return typeof navigator !== 'undefined' ? navigator.locks : undefined
}

/** Resolves once the shared edit lock is held; the release fn frees it. */
async function acquireEditLock(outboxId: string): Promise<(() => void) | null> {
  const locks = getLocks()
  if (!locks?.request) return null
  return new Promise((resolveAcquired) => {
    locks
      .request(editLockName(outboxId), { mode: 'shared' }, () => {
        return new Promise<void>((release) => {
          resolveAcquired(release)
        })
      })
      .catch(() => resolveAcquired(null))
  })
}

/**
 * Claim an outbox item for editing. Resolves with the fresh DB record, or
 * null when the item is being sent right now or no longer exists.
 */
export async function holdOutboxForEdit(
  userId: string,
  outboxId: string
): Promise<OutboxRecord | null> {
  // Lock first: once editHeldAt is visible, other tabs must see a live lock.
  const release = await acquireEditLock(outboxId)
  let held: OutboxRecord | null = null
  try {
    held = await setOutboxEditHold(userId, outboxId)
  } finally {
    if (!held) release?.()
  }
  if (!held) return null
  localHolds.get(outboxId)?.()
  localHolds.set(outboxId, release)
  return held
}

export function releaseOutboxForEdit(outboxId: string, userId?: string): void {
  const release = localHolds.get(outboxId)
  localHolds.delete(outboxId)
  release?.()
  let owner = userId
  try {
    owner ??= getAuthUserId() ?? undefined
  } catch {
    owner = undefined
  }
  if (!owner) return
  // The DB may be closed by a logout wipe: nothing left to release then.
  void clearOutboxEditHold(owner, outboxId).catch(() => undefined)
}

/** Same-tab synchronous check. */
export function isOutboxHeldForEdit(outboxId: string): boolean {
  return localHolds.has(outboxId)
}

/** Cross-tab check used by the flush before claiming an item. */
export async function isOutboxEditHoldLive(
  record: Pick<OutboxRecord, 'id' | 'editHeldAt'>
): Promise<boolean> {
  if (localHolds.has(record.id)) return true
  if (record.editHeldAt == null) return false
  const locks = getLocks()
  if (locks?.query) {
    try {
      const snapshot = await locks.query()
      const name = editLockName(record.id)
      return [...(snapshot.held ?? []), ...(snapshot.pending ?? [])].some(
        (lock) => lock.name === name
      )
    } catch {
      // fall back to the TTL below
    }
  }
  return Date.now() - record.editHeldAt < OUTBOX_EDIT_HOLD_TTL_MS
}

/** Test helper. */
export function resetOutboxEditHolds(): void {
  localHolds.forEach((release) => release?.())
  localHolds.clear()
}
