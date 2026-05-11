import type { FolderShareRights, ShareRightPreset } from '../mails-types'

export const SHARE_PRESETS: Record<ShareRightPreset, FolderShareRights> = {
  none: {
    userCanViewFolder: 0,
    userCanReadMails: 0,
    userCanMarkMailsRead: 0,
    userCanWriteMails: 0,
    userCanInsertMails: 0,
    userCanPostMails: 0,
    userCanCreateSubfolders: 0,
    userCanRemoveFolder: 0,
    userCanEraseMails: 0,
    userCanExpungeFolder: 0,
    userIsAdministrator: 0,
  },
  read: {
    userCanViewFolder: 1,
    userCanReadMails: 1,
  },
  write: {
    userCanViewFolder: 1,
    userCanReadMails: 1,
    userCanMarkMailsRead: 1,
    userCanWriteMails: 1,
    userCanInsertMails: 1,
    userCanPostMails: 1,
  },
  admin: {
    userCanViewFolder: 1,
    userCanReadMails: 1,
    userCanMarkMailsRead: 1,
    userCanWriteMails: 1,
    userCanInsertMails: 1,
    userCanPostMails: 1,
    userCanCreateSubfolders: 1,
    userCanRemoveFolder: 1,
    userCanEraseMails: 1,
    userCanExpungeFolder: 1,
    userIsAdministrator: 1,
  },
}

export function detectPreset(rights: FolderShareRights): ShareRightPreset {
  if (rights.userIsAdministrator === 1) return 'admin'
  if (rights.userCanWriteMails === 1) return 'write'
  if (rights.userCanReadMails === 1) return 'read'
  return 'none'
}
