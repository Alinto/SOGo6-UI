import { IconName } from 'lucide-react/dynamic'
import translationMapping from './translation-mapping'

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
  if (name === 'INBOX') return translationMapping.INBOX
  if (name === 'Sent') return translationMapping.Sent
  if (name === 'Drafts') return translationMapping.Drafts
  if (name === 'Trash') return translationMapping.Trash
  if (name === 'Junk') return translationMapping.Junk
  if (name === 'Archive') return translationMapping.Archive
  return undefined
}

export { iconSelector, nameSelector }
