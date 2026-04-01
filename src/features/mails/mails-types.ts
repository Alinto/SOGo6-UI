export type ImapFolderType =
  | 'INBOX'
  | 'SENT'
  | 'DRAFT'
  | 'DRAFTS'
  | 'TRASH'
  | 'JUNK'
  | 'TEMPLATE'
  | 'NORMAL'

export interface ImapFolder {
  name: string
  path: string
  unseen: number
  messages: number
  flags: string[]
  delimiter: string
  readOnly: boolean
  default?: boolean
  type?: ImapFolderType
  subfolders?: ImapFolder[]
  children?: ImapFolder[]
}

export interface ImapMessagesList {
  id: string
  subject: string
  from: { name: string; email: string }
  to: { name: string; email: string }[]
  date: string
  seen: boolean
  flagged: boolean
  hasAttachment: boolean
  snippet: string
  size?: number
}

export interface ImapAttachmentPart {
  partId: string
  name: string
  contentType: string
  size: number
  downloadUri: string
  displayUri: string
}

export interface ImapAttachments {
  parts?: ImapAttachmentPart[]
  zipUri?: string
  count: number
}

export interface ImapMessages {
  id?: string
  uid?: string
  attachments: ImapAttachments | Array<{
    contentType: string
    displayUri: string
    downloadUri: string
    extension: string
    filename: string
    size: number
  }>
  contentUri?: string
  seen: boolean
  answered: boolean
  recent?: boolean
  deleted: boolean
  hasAttachment?: boolean
  has_attachment?: boolean
  important?: boolean
  date: number | string
  subject: string
  isMailingList?: boolean
  from: { name: string; email: string }
  to: Array<{ name: string; email: string }>
  cc: Array<{ name: string; email: string }>
  bcc?: Array<{ name: string; email: string }>
  reply_to?: Array<{ name: string; email: string }>
  size: number
  imageBlocked?: boolean
  body?: string
  contents?: Array<{
    content: string
    contentType: string
    shouldDisplayAttachment: boolean
  }>
  flags?: string[]
  flagged?: boolean
  return_path?: string
  priority?: number
  should_ask_receipt?: boolean
  is_signed?: boolean
  valid?: boolean | null
  certificates?: unknown[]
}

export interface ImapMessagesAPIResponse {
  messages: ImapMessagesList[]
  total: number
  pageSize: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ImapMessagesBackendResponse {
  mails: ImapMessagesList[]
  total: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface FolderShareRights {
  userCanViewFolder?: number
  userCanReadMails?: number
  userCanMarkMailsRead?: number
  userCanWriteMails?: number
  userCanInsertMails?: number
  userCanPostMails?: number
  userCanCreateSubfolders?: number
  userCanRemoveFolder?: number
  userCanEraseMails?: number
  userCanExpungeFolder?: number
  userIsAdministrator?: number
}

export interface FolderShareUser {
  uid: string
  c_email?: string
  cn?: string
  userClass: 'normal-user' | 'public-user'
  isGroup?: number
  rights: FolderShareRights
}

export interface FolderShareData {
  users: Record<string, {
    uid: string
    c_email?: string
    cn?: string
    userClass: 'normal-user' | 'public-user'
    rights: FolderShareRights
  }>
}

export type ShareRightPreset = 'read' | 'write' | 'admin' | 'none'

export interface CreateFolderBody {
  name: string
  parent: string // empty string "" for root-level folder
}

export interface UpdateFolderBody {
  name?: string
  subscribed?: number
  type?: string
}
