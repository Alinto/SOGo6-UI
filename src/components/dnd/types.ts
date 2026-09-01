import type { ImapFolderType } from '@/features/mails/mails-types'

export type MailDragData = {
  type: 'mail'
  mailId: string
  accountId: string
  folder: string
  folderType?: ImapFolderType
  subject: string
  from: string
  count: number
}

export type FolderDragData = {
  type: 'folder'
  folderPath: string
  folderType?: ImapFolderType
  folderName?: string
}

export type ContactDragData = {
  type: 'contact'
  contactId: string
}

export type BookDragData = {
  type: 'book'
  bookId: string
}

export type AppDragData =
  | MailDragData
  | FolderDragData
  | ContactDragData
  | BookDragData

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null
}

export function isMailDragData(data: unknown): data is MailDragData {
  return (
    isRecord(data) && data.type === 'mail' && typeof data.mailId === 'string'
  )
}

export function isFolderDragData(data: unknown): data is FolderDragData {
  return (
    isRecord(data) &&
    data.type === 'folder' &&
    typeof data.folderPath === 'string'
  )
}

export function isContactDragData(data: unknown): data is ContactDragData {
  return (
    isRecord(data) &&
    data.type === 'contact' &&
    typeof data.contactId === 'string'
  )
}
