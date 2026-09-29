import type { FolderShareRights, ImapFolder } from '../mails-types'

/**
 * What the connected user may do in a mail folder, derived from the IMAP ACL
 * rights (RFC 4314) the backend sends on each folder.
 */
export interface FolderPermissions {
  /** See the folder (`l`). */
  canView: boolean
  /** Open the folder and read its mails (`l` + `r`). */
  canRead: boolean
  /** Mark mails read / unread (`s`). */
  canMarkRead: boolean
  /** Write other flags: starred, labels, priority (`w`). */
  canWriteFlags: boolean
  /** Insert / copy / move mails into the folder (`i`). */
  canInsert: boolean
  /** Post mails to the folder (`p`). */
  canPost: boolean
  /** Copy mails out of the folder (`r`). */
  canCopyOut: boolean
  /** Delete mails: flag deleted + expunge (`t` + `e`). */
  canDelete: boolean
  /** Move mails out of the folder: read + delete (`r` + `t` + `e`). */
  canMoveOut: boolean
  /** Create subfolders (`k`). */
  canCreateSubfolder: boolean
  /** Delete the folder itself (`x`). */
  canRemoveFolder: boolean
  /** Rename the folder (`x` + `k`). */
  canRename: boolean
  /** Expunge / purge the folder (`e`). */
  canExpunge: boolean
  /** Empty the folder (`t` + `e`). */
  canEmpty: boolean
  /** Administer the folder's rights, i.e. share it (`a`). */
  canAdmin: boolean
}

export const FULL_FOLDER_PERMISSIONS: FolderPermissions = {
  canView: true,
  canRead: true,
  canMarkRead: true,
  canWriteFlags: true,
  canInsert: true,
  canPost: true,
  canCopyOut: true,
  canDelete: true,
  canMoveOut: true,
  canCreateSubfolder: true,
  canRemoveFolder: true,
  canRename: true,
  canExpunge: true,
  canEmpty: true,
  canAdmin: true,
}

export const NO_FOLDER_PERMISSIONS: FolderPermissions = {
  canView: false,
  canRead: false,
  canMarkRead: false,
  canWriteFlags: false,
  canInsert: false,
  canPost: false,
  canCopyOut: false,
  canDelete: false,
  canMoveOut: false,
  canCreateSubfolder: false,
  canRemoveFolder: false,
  canRename: false,
  canExpunge: false,
  canEmpty: false,
  canAdmin: false,
}

const has = (rights: FolderShareRights, field: keyof FolderShareRights) =>
  rights[field] === 1

/**
 * Permissions derived from a folder's rights. Without `rights` (fake API,
 * legacy backend, folder not loaded yet) the user is considered to have every
 * right, whereas an empty object means no right at all.
 */
export function getFolderPermissions(
  rights?: FolderShareRights | null
): FolderPermissions {
  if (!rights) return FULL_FOLDER_PERMISSIONS

  const canView = has(rights, 'userCanViewFolder')
  const canRead = canView && has(rights, 'userCanReadMails')
  const canDelete =
    has(rights, 'userCanEraseMails') && has(rights, 'userCanExpungeFolder')

  return {
    canView,
    canRead,
    canMarkRead: has(rights, 'userCanMarkMailsRead'),
    canWriteFlags: has(rights, 'userCanWriteMails'),
    canInsert: has(rights, 'userCanInsertMails'),
    canPost: has(rights, 'userCanPostMails'),
    canCopyOut: canRead,
    canDelete,
    canMoveOut: canRead && canDelete,
    canCreateSubfolder: has(rights, 'userCanCreateSubfolders'),
    canRemoveFolder: has(rights, 'userCanRemoveFolder'),
    canRename:
      has(rights, 'userCanRemoveFolder') &&
      has(rights, 'userCanCreateSubfolders'),
    canExpunge: has(rights, 'userCanExpungeFolder'),
    canEmpty: canDelete,
    canAdmin: has(rights, 'userIsAdministrator'),
  }
}

/** Permissions of a folder node; unknown folders are not restricted. */
export function getPermissionsForFolder(
  folder?: Pick<ImapFolder, 'rights'> | null
): FolderPermissions {
  return getFolderPermissions(folder?.rights)
}

/**
 * Permissions common to several folders: an action is allowed only if it is
 * allowed on every one of them (e.g. a selection spanning search results).
 * No folder means no restriction.
 */
export function intersectFolderPermissions(
  list: FolderPermissions[]
): FolderPermissions {
  if (list.length === 0) return FULL_FOLDER_PERMISSIONS
  const keys = Object.keys(
    FULL_FOLDER_PERMISSIONS
  ) as (keyof FolderPermissions)[]
  const result = { ...FULL_FOLDER_PERMISSIONS }
  for (const permissions of list) {
    for (const key of keys) {
      result[key] = result[key] && permissions[key]
    }
  }
  return result
}
