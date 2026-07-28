export type MailNavigationContext = {
  orderedIds: string[]
  folderKey: string | null
  page: number
  totalPages: number
}

export function buildMailFolderKey(accountId: string, folder: string): string {
  return `${accountId}/${folder}`
}

export function isMailDetailPath(pathname: string, folder: string): boolean {
  if (!folder) return false

  const decodedPathname = decodeURIComponent(pathname)
  const folderIndex = decodedPathname.lastIndexOf(`/${folder}`)
  if (folderIndex === -1) return false

  const afterFolder = decodedPathname
    .slice(folderIndex + folder.length + 1)
    .split('?')[0]
    .replace(/^\/+/, '')
  const mailSegment = afterFolder.split('/')[0]

  return Boolean(mailSegment)
}

export function resolveMailIdFromPath(
  pathname: string,
  folder: string
): string | null {
  if (!isMailDetailPath(pathname, folder)) return null

  const decodedPathname = decodeURIComponent(pathname)
  const folderIndex = decodedPathname.lastIndexOf(`/${folder}`)
  const afterFolder = decodedPathname
    .slice(folderIndex + folder.length + 1)
    .split('?')[0]
    .replace(/^\/+/, '')

  const mailSegment = afterFolder.split('/')[0]
  return mailSegment ? decodeURIComponent(mailSegment) : null
}
