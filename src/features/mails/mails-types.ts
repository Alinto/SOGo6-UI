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

export interface ImapMessagesAPIResponse {
  messages: ImapMessagesList[]
  total: number
  pageSize: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
