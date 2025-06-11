import { IconName } from 'lucide-react/dynamic'

const iconSelector = (path: string, defaultIcon?: IconName): IconName => {
  if (path === 'INBOX') return 'inbox'
  if (path === 'Sent') return 'send'
  if (path === 'Drafts') return 'file-text'
  if (path === 'Trash') return 'trash-2'
  if (path === 'Junk') return 'alert-triangle'
  if (path === 'Archive') return 'archive'
  if (defaultIcon) return defaultIcon
  return 'folder'
}
const nameSelector = (name: string): string | undefined => {
  if (name === 'INBOX') return 'folders.inbox.string'
  if (name === 'Sent') return 'folders.sent.string'
  if (name === 'Drafts') return 'folders.drafts.string'
  if (name === 'Trash') return 'folders.trash.string'
  if (name === 'Junk') return 'folders.junk.string'
  if (name === 'Archive') return 'folders.archive.string'
  return undefined
}

export { iconSelector, nameSelector }
