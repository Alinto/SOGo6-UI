export interface ImapFolder {
  name: string
  path: string
  unseen: number
  messages: number
  flags: string[]
  delimiter: string
  readOnly: boolean
  default?: boolean
  subfolders?: ImapFolder[]
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
  id: string
  attachments: ImapAttachments
  contentUri: string
  seen: boolean
  answered: boolean
  recent: boolean
  deleted: boolean
  hasAttachment: boolean
  important: boolean
  date: number
  subject: string
  is_mailing_list: boolean
  from: string
  to: string[]
  cc: string[]
  bcc: string[]
  size: number
  imageBlocked: boolean
  body: string
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
