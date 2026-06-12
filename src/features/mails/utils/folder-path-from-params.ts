import { nameSelector } from '../components/utils'

function decodeFolderSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/**
 * Normalizes the `[folder]` route param to an IMAP folder path (e.g. "INBOX/Work").
 */
export function folderPathFromParams(
  folder: string | string[] | undefined
): string {
  if (folder == null) return ''
  const segments = Array.isArray(folder) ? folder : [folder]
  return segments.map(decodeFolderSegment).join('/')
}

export function getFolderDisplayName(
  folderPath: string,
  translateCommons: (key: string) => string
): string {
  const translationKey = nameSelector(folderPath)
  if (translationKey) return translateCommons(translationKey)

  const segments = folderPath.split('/')
  if (segments.length > 1) {
    return segments[segments.length - 1] ?? folderPath
  }

  return folderPath
}
