export interface ImapFolder {
  name: string
  path: string
  unseen: number
  messages: number
  flags: string[]
  delimiter: string
  readOnly: boolean
  subfolders?: ImapFolder[]
}