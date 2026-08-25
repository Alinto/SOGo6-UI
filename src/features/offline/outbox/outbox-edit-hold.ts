const heldOutboxIds = new Set<string>()

/** Prevent auto-flush from sending a message the user is currently editing. */
export function holdOutboxForEdit(outboxId: string): void {
  heldOutboxIds.add(outboxId)
}

export function releaseOutboxForEdit(outboxId: string): void {
  heldOutboxIds.delete(outboxId)
}

export function isOutboxHeldForEdit(outboxId: string): boolean {
  return heldOutboxIds.has(outboxId)
}

/** Test helper. */
export function resetOutboxEditHolds(): void {
  heldOutboxIds.clear()
}
