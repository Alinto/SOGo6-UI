import { IconName } from 'lucide-react/dynamic'

const iconSelector = (path: string, defaultIcon?: IconName): IconName => {
  if (path === 'INBOX') return 'inbox'
  if (path === 'Sent') return 'send'
  if (path === 'Drafts') return 'file-text'
  if (path === 'Trash') return 'trash-2'
  if (path === 'Junk') return 'alert-triangle'
  if (defaultIcon) return defaultIcon
  return 'folder'
}
const nameSelector = (name: string): string | undefined => {
  if (name.toLocaleLowerCase() === 'inbox') return 'folders.inbox.string'
  if (name.toLocaleLowerCase() === 'sent') return 'folders.sent.string'
  if (name.toLocaleLowerCase() === 'drafts') return 'folders.drafts.string'
  if (name.toLocaleLowerCase() === 'trash') return 'folders.trash.string'
  if (name.toLocaleLowerCase() === 'junk') return 'folders.junk.string'
  return undefined
}

export { iconSelector, nameSelector }
