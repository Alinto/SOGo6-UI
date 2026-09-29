import type { FolderShareRights } from '../../mails-types'
import {
  FULL_FOLDER_PERMISSIONS,
  NO_FOLDER_PERMISSIONS,
  getFolderPermissions,
  getPermissionsForFolder,
  intersectFolderPermissions,
} from '../folder-permissions'

const readOnly: FolderShareRights = {
  userCanViewFolder: 1,
  userCanReadMails: 1,
}

describe('getFolderPermissions', () => {
  it('grants everything when the backend sent no rights', () => {
    expect(getFolderPermissions(undefined)).toEqual(FULL_FOLDER_PERMISSIONS)
    expect(getFolderPermissions(null)).toEqual(FULL_FOLDER_PERMISSIONS)
  })

  it('grants nothing for an empty rights object', () => {
    expect(getFolderPermissions({})).toEqual(NO_FOLDER_PERMISSIONS)
  })

  it('only allows reading with the l and r rights', () => {
    const permissions = getFolderPermissions(readOnly)
    expect(permissions).toEqual({
      ...NO_FOLDER_PERMISSIONS,
      canView: true,
      canRead: true,
      canCopyOut: true,
    })
  })

  it('cannot read without the r right, even when the folder is visible', () => {
    const permissions = getFolderPermissions({ userCanViewFolder: 1 })
    expect(permissions.canView).toBe(true)
    expect(permissions.canRead).toBe(false)
    expect(permissions.canCopyOut).toBe(false)
  })

  it('maps flag rights: s marks read, w writes other flags', () => {
    const seenOnly = getFolderPermissions({
      ...readOnly,
      userCanMarkMailsRead: 1,
    })
    expect(seenOnly.canMarkRead).toBe(true)
    expect(seenOnly.canWriteFlags).toBe(false)

    const writeOnly = getFolderPermissions({
      ...readOnly,
      userCanWriteMails: 1,
    })
    expect(writeOnly.canMarkRead).toBe(false)
    expect(writeOnly.canWriteFlags).toBe(true)
  })

  it('needs both t and e to delete mails and move them out', () => {
    const erase = getFolderPermissions({ ...readOnly, userCanEraseMails: 1 })
    expect(erase.canDelete).toBe(false)
    expect(erase.canMoveOut).toBe(false)
    expect(erase.canEmpty).toBe(false)

    const eraseAndExpunge = getFolderPermissions({
      ...readOnly,
      userCanEraseMails: 1,
      userCanExpungeFolder: 1,
    })
    expect(eraseAndExpunge.canDelete).toBe(true)
    expect(eraseAndExpunge.canMoveOut).toBe(true)
    expect(eraseAndExpunge.canEmpty).toBe(true)
    expect(eraseAndExpunge.canExpunge).toBe(true)
  })

  it('cannot move mails out without being able to read them', () => {
    const permissions = getFolderPermissions({
      userCanEraseMails: 1,
      userCanExpungeFolder: 1,
    })
    expect(permissions.canDelete).toBe(true)
    expect(permissions.canMoveOut).toBe(false)
  })

  it('allows inserting mails with the i right only', () => {
    expect(getFolderPermissions({ userCanInsertMails: 1 }).canInsert).toBe(true)
    expect(getFolderPermissions(readOnly).canInsert).toBe(false)
  })

  it('maps folder management rights', () => {
    const permissions = getFolderPermissions({
      userCanCreateSubfolders: 1,
      userCanRemoveFolder: 1,
      userIsAdministrator: 1,
    })
    expect(permissions.canCreateSubfolder).toBe(true)
    expect(permissions.canRemoveFolder).toBe(true)
    expect(permissions.canRename).toBe(true)
    expect(permissions.canAdmin).toBe(true)

    const createOnly = getFolderPermissions({ userCanCreateSubfolders: 1 })
    expect(createOnly.canRename).toBe(false)
  })
})

describe('getPermissionsForFolder', () => {
  it('does not restrict an unknown folder', () => {
    expect(getPermissionsForFolder(undefined)).toEqual(FULL_FOLDER_PERMISSIONS)
  })

  it('uses the rights of the folder node', () => {
    expect(getPermissionsForFolder({ rights: {} })).toEqual(
      NO_FOLDER_PERMISSIONS
    )
    expect(getPermissionsForFolder({})).toEqual(FULL_FOLDER_PERMISSIONS)
  })
})

describe('intersectFolderPermissions', () => {
  it('does not restrict when there is no folder', () => {
    expect(intersectFolderPermissions([])).toEqual(FULL_FOLDER_PERMISSIONS)
  })

  it('allows an action only if every folder allows it', () => {
    const result = intersectFolderPermissions([
      FULL_FOLDER_PERMISSIONS,
      getFolderPermissions(readOnly),
    ])
    expect(result.canRead).toBe(true)
    expect(result.canDelete).toBe(false)
    expect(result.canMarkRead).toBe(false)
  })
})
