/**
 * Tracks the draft save in flight for each compose window, so a send started
 * meanwhile can wait for it and reuse the key it gets (instead of sending
 * without key and leaving the just-saved draft orphaned on the server).
 */
const pendingSaves = new Map<string, Promise<string | null>>()

/** Register a save resolving to the server mail key (or null when none). */
export function trackDraftSave(
  draftId: string,
  save: Promise<string | null>
): Promise<string | null> {
  pendingSaves.set(draftId, save)
  const clear = () => {
    if (pendingSaves.get(draftId) === save) pendingSaves.delete(draftId)
  }
  save.then(clear, clear)
  return save
}

/** Resolve with the key of the save in flight for this draft, or null. */
export function waitForPendingDraftSave(
  draftId: string
): Promise<string | null> {
  const save = pendingSaves.get(draftId)
  return save ? save.catch(() => null) : Promise.resolve(null)
}
