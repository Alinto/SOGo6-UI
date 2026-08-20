export type ImapFolderType =
  | 'INBOX'
  | 'SENT'
  | 'DRAFT'
  | 'DRAFTS'
  | 'TRASH'
  | 'JUNK'
  | 'TEMPLATE'
  | 'NORMAL'

export type MailActionType = 'tag' | 'untag' | 'move' | 'spam' | 'ham' | 'copy'

export type MailBatchActionType = MailActionType | 'delete'

export interface ImapFolder {
  name: string
  path: string
  unseen_count: number
  messages: number
  flags: string[]
  delimiter: string
  readOnly: boolean
  selectable: boolean
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
  answered: boolean
  forwarded: boolean
  deleted: boolean
  /** 1–5, 3 = normal ; 1–2 = haute priorité */
  priority: number
  /** Ex. `"event"`, `"contact"` (API : `mail_type`) */
  mailType: string[]
  /** IMAP keywords/flags, incl. custom mail category names (e.g. "Work"). */
  flags?: string[]
}

export interface ImapAttachmentPart {
  partId: string
  name: string
  contentType: string
  size: number
}

export interface ImapAttachments {
  parts?: ImapAttachmentPart[]
  zipUri?: string
  count: number
}

/** Calendar / contact metadata attached to a mail (API: `mail_type_data`). */
export interface MailTypeDataItem {
  ics_content?: string
  vcard_content?: string
  /** Set by backend after inbound iMIP processing (phase 2). */
  event_key?: string
  method?: string
}

export interface ImapMessages {
  id?: string
  uid?: string
  attachments:
    | ImapAttachments
    | Array<{
        contentType: string
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
  /** Ex. `"event"`, `"contact"` (API snake_case). */
  mail_type?: string[]
  mailType?: string[]
  mail_type_data?: MailTypeDataItem[]
  mailTypeData?: MailTypeDataItem[]
}

export interface ImapMessagesAPIResponse {
  /** Éléments bruts avant `mapMailToListItem` (API / fakeApi). */
  messages: unknown[]
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
  users: Record<
    string,
    {
      uid: string
      c_email?: string
      cn?: string
      userClass: 'normal-user' | 'public-user'
      rights: FolderShareRights
    }
  >
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
