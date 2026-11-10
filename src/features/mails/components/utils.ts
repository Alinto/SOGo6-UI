import { IconName } from 'lucide-react/dynamic'
import type { ImapFolderType } from '../mails-types'
import {
  getFolderIcon,
  getFolderTranslationKey,
} from '../utils/folder-type-helpers'
import { FOLDERS_NAME } from './constants'

/** @deprecated Prefer getFolderIcon(folder.type) */
const iconSelector = (path: string, defaultIcon?: IconName): IconName => {
  if (path === FOLDERS_NAME.INBOX) return 'inbox'
  if (path === FOLDERS_NAME.SENT) return 'send'
  if (path === FOLDERS_NAME.DRAFT) return 'file-text'
  if (path === FOLDERS_NAME.TRASH) return 'trash-2'
  if (path === FOLDERS_NAME.JUNK) return 'alert-triangle'
  if (defaultIcon) return defaultIcon
  return 'folder'
}

const iconSelectorByType = (
  type?: ImapFolderType,
  defaultIcon?: IconName
): IconName => getFolderIcon(type, defaultIcon)

/** @deprecated Prefer getFolderTranslationKey(folder.type) for system folders */
const nameSelector = (name: string): string | undefined => {
  if (name.toLocaleLowerCase() === FOLDERS_NAME.INBOX.toLocaleLowerCase())
    return 'folders.inbox.string'
  if (name.toLocaleLowerCase() === FOLDERS_NAME.SENT.toLocaleLowerCase())
    return 'folders.sent.string'
  if (name.toLocaleLowerCase() === FOLDERS_NAME.DRAFT.toLocaleLowerCase())
    return 'folders.drafts.string'
  if (name.toLocaleLowerCase() === FOLDERS_NAME.TRASH.toLocaleLowerCase())
    return 'folders.trash.string'
  if (name.toLocaleLowerCase() === FOLDERS_NAME.JUNK.toLocaleLowerCase())
    return 'folders.junk.string'
  return undefined
}

const nameSelectorByType = (type?: ImapFolderType): string | undefined =>
  getFolderTranslationKey(type)

export { iconSelector, iconSelectorByType, nameSelector, nameSelectorByType }
