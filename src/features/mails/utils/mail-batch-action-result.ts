/** Outcome of POST mailboxes/{id}/batch-action, which answers 200 even when some folders fail. */
export type MailBatchActionResult = {
  /** Folders the server could not process (keys of `data.errors`). */
  failedFolders: string[]
}

type BatchActionResponse = {
  data?: { errors?: Record<string, unknown> | null } | null
} | null

export function toMailBatchActionResult(
  response: BatchActionResponse | undefined
): MailBatchActionResult {
  const errors = response?.data?.errors
  return {
    failedFolders:
      errors && typeof errors === 'object' ? Object.keys(errors) : [],
  }
}
