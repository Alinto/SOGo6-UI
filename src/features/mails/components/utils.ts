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
  if (name.toLocaleLowerCase() === 'inbox')
    return 'MAILS_COMMONS.folders.inbox.string'
  if (name.toLocaleLowerCase() === 'sent')
    return 'MAILS_COMMONS.folders.sent.string'
  if (name.toLocaleLowerCase() === 'drafts')
    return 'MAILS_COMMONS.folders.drafts.string'
  if (name.toLocaleLowerCase() === 'trash')
    return 'MAILS_COMMONS.folders.trash.string'
  if (name.toLocaleLowerCase() === 'junk')
    return 'MAILS_COMMONS.folders.junk.string'
  if (name.toLocaleLowerCase() === 'archive')
    return 'MAILS_COMMONS.folders.archive.string'
  return undefined
}

export { iconSelector, nameSelector }
