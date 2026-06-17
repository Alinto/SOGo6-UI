export type MailNavigationContext = {
  orderedIds: string[]
  folderKey: string | null
  page: number
  totalPages: number
}

export type PostRemovalTarget = {
  target: 'next' | 'prev' | 'list'
  id?: string
}

export function buildMailFolderKey(
  accountId: string,
  folder: string
): string {
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

export function getPostRemovalTarget(params: {
  mailId: string
  navigation?: MailNavigationContext
  currentFolderKey: string
}): PostRemovalTarget {
  const { mailId, navigation, currentFolderKey } = params

  if (!navigation || navigation.folderKey !== currentFolderKey) {
    return { target: 'list' }
  }

  const idx = navigation.orderedIds.indexOf(mailId)
  if (idx === -1) return { target: 'list' }

  const nextId =
    idx < navigation.orderedIds.length - 1
      ? navigation.orderedIds[idx + 1]
      : null
  const prevId = idx > 0 ? navigation.orderedIds[idx - 1] : null

  if (nextId) return { target: 'next', id: nextId }
  if (prevId) return { target: 'prev', id: prevId }
  return { target: 'list' }
}
