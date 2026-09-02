import type { IconName } from 'lucide-react/dynamic'
import type { ImapFolderType, ImapMessagesList } from '../mails-types'

export type NormalizedFolderType = ImapFolderType | undefined

export function normalizeFolderType(
  type?: ImapFolderType
): NormalizedFolderType {
  if (!type) return undefined
  if (type === 'DRAFTS') return 'DRAFT'
  return type
}

export function isDraftFolderType(type?: ImapFolderType): boolean {
  const normalized = normalizeFolderType(type)
  return normalized === 'DRAFT'
}

export function isSentFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'SENT'
}

export function isJunkFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'JUNK'
}

export function isTrashFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'TRASH'
}

export function isTemplateFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'TEMPLATE'
}

export function isInboxFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'INBOX'
}

export function isNormalFolderType(type?: ImapFolderType): boolean {
  return normalizeFolderType(type) === 'NORMAL' || type === undefined
}

export function getFolderIcon(
  type?: ImapFolderType,
  defaultIcon?: IconName
): IconName {
  switch (normalizeFolderType(type)) {
    case 'INBOX':
      return 'inbox'
    case 'SENT':
      return 'send'
    case 'DRAFT':
      return 'file-text'
    case 'TRASH':
      return 'trash-2'
    case 'JUNK':
      return 'shield-x'
    case 'TEMPLATE':
      return 'layers'
    default:
      return defaultIcon ?? 'folder'
  }
}

export function getFolderTranslationKey(
  type?: ImapFolderType
): string | undefined {
  switch (normalizeFolderType(type)) {
    case 'INBOX':
      return 'folders.inbox.string'
    case 'SENT':
      return 'folders.sent.string'
    case 'DRAFT':
      return 'folders.drafts.string'
    case 'TRASH':
      return 'folders.trash.string'
    case 'JUNK':
      return 'folders.junk.string'
    case 'TEMPLATE':
      return 'folders.template.string'
    default:
      return undefined
  }
}

export function shouldHideUnseenCount(type?: ImapFolderType): boolean {
  const normalized = normalizeFolderType(type)
  return normalized === 'SENT' || normalized === 'DRAFT'
}

export function shouldShowRecipientInList(type?: ImapFolderType): boolean {
  return isSentFolderType(type) || isDraftFolderType(type)
}

export function getListDisplayContact(
  mail: Pick<ImapMessagesList, 'from' | 'to'>,
  folderType?: ImapFolderType
): string {
  if (shouldShowRecipientInList(folderType)) {
    const recipient = mail.to[0]
    return recipient?.name || recipient?.email || ''
  }
  return mail.from.name || mail.from.email
}

export function isVirtualFolder(folder: { selectable?: boolean }): boolean {
  return folder.selectable === false
}
