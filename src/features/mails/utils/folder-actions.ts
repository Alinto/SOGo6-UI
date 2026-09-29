import type { ImapFolder, ImapFolderType } from '../mails-types'
import {
  isJunkFolderType,
  isNormalFolderType,
  isTrashFolderType,
  isVirtualFolder,
} from './folder-type-helpers'

import type { SogoModule } from '@/features/user-profile/profile-types'
import { canRenameFolder } from './can-rename-folder'
import {
  getPermissionsForFolder,
  type FolderPermissions,
} from './folder-permissions'

export type FolderActionId =
  | 'rename'
  | 'mark_as_read'
  | 'new_subfolder'
  | 'sharing'
  | 'export'
  | 'purge'
  | 'expunge'
  | 'empty_folder'
  | 'move_to'
  | 'set_as'
  | 'delete'

export interface FolderActionDefinition {
  id: FolderActionId
  translationKey: string
  disabled?: boolean
  disabledReasonKey?: string
  destructive?: boolean
  separatorBefore?: boolean
}

export interface GetFolderActionsOptions {
  mailPurgeAllow?: boolean
  folderExportDisabled?: boolean
  folderSharingDisabled?: SogoModule[]
}

const ACTION_UNAVAILABLE_KEY = 'folders.actions.action_unavailable.string'
const PERMISSION_DENIED_KEY = 'folders.actions.permission_denied.string'

/** Backend PATCH folders / mark-as-read / export are not implemented yet. */
const BACKEND_BLOCKED_ACTIONS = new Set<FolderActionId>([
  'mark_as_read',
  'export',
  'move_to',
  'set_as',
])

/** Whether the user's rights on the folder allow the given action. */
function isActionPermitted(
  id: FolderActionId,
  permissions: FolderPermissions
): boolean {
  switch (id) {
    case 'mark_as_read':
      return permissions.canMarkRead
    case 'new_subfolder':
      return permissions.canCreateSubfolder
    case 'sharing':
      return permissions.canAdmin
    case 'export':
      return permissions.canRead
    case 'purge':
    case 'expunge':
      return permissions.canExpunge
    case 'empty_folder':
      return permissions.canEmpty
    case 'rename':
    case 'move_to':
      return permissions.canRename
    case 'delete':
      return permissions.canRemoveFolder
    case 'set_as':
      return true
  }
}

function isNormalOnlyAction(id: FolderActionId): boolean {
  return (
    id === 'rename' || id === 'move_to' || id === 'delete' || id === 'set_as'
  )
}

function buildAction(
  id: FolderActionId,
  translationKey: string,
  options?: Partial<FolderActionDefinition> & {
    permissions?: FolderPermissions
  }
): FolderActionDefinition {
  const backendBlocked = BACKEND_BLOCKED_ACTIONS.has(id)
  const permissionDenied =
    !backendBlocked &&
    options?.permissions != null &&
    !isActionPermitted(id, options.permissions)
  return {
    id,
    translationKey,
    disabled: backendBlocked || permissionDenied || options?.disabled,
    disabledReasonKey: backendBlocked
      ? ACTION_UNAVAILABLE_KEY
      : permissionDenied
        ? PERMISSION_DENIED_KEY
        : options?.disabledReasonKey,
    destructive: options?.destructive,
    separatorBefore: options?.separatorBefore,
  }
}

export function getFolderActions(
  folder: Pick<ImapFolder, 'type' | 'selectable' | 'default' | 'rights'>,
  options: GetFolderActionsOptions = {}
): FolderActionDefinition[] {
  const {
    mailPurgeAllow = false,
    folderSharingDisabled = [],
    folderExportDisabled,
  } = options
  const isSharingDisabled = folderSharingDisabled.includes('mail')
  const permissions = getPermissionsForFolder(folder)

  if (isVirtualFolder(folder)) {
    return [
      buildAction('delete', 'folders.actions.delete.string', {
        destructive: true,
      }),
    ]
  }

  const folderType = folder.type
  const isNormal = isNormalFolderType(folderType)
  const isTrashOrJunk =
    isTrashFolderType(folderType) || isJunkFolderType(folderType)

  const build = (
    id: FolderActionId,
    translationKey: string,
    actionOptions?: Partial<FolderActionDefinition>
  ) => buildAction(id, translationKey, { ...actionOptions, permissions })

  const actions: FolderActionDefinition[] = [
    build('mark_as_read', 'folders.actions.mark_as_read.string'),
    build('new_subfolder', 'folders.actions.new_subfolder.string'),
  ]

  if (!isSharingDisabled) {
    actions.push(
      build('sharing', 'folders.actions.sharing.string', {
        separatorBefore: true,
      })
    )
  }

  if (!folderExportDisabled) {
    actions.push(
      build('export', 'folders.actions.export.string', {
        separatorBefore: !isSharingDisabled,
      })
    )
  }

  if (mailPurgeAllow) {
    actions.push(
      build('purge', 'folders.actions.purge.string', {
        separatorBefore: true,
      })
    )
  }

  actions.push(
    build('expunge', 'folders.actions.expunge.string', {
      separatorBefore: !mailPurgeAllow,
    })
  )

  if (isTrashOrJunk) {
    actions.push(
      build('empty_folder', 'folders.actions.empty_folder.string', {
        separatorBefore: true,
      })
    )
  }

  if (isNormal) {
    const renameAllowed = canRenameFolder(folder)
    if (renameAllowed) {
      actions.push(
        build('rename', 'folders.actions.rename.string', {
          separatorBefore: true,
        })
      )
    }
    actions.push(
      build('move_to', 'folders.actions.move_to.string'),
      build('set_as', 'folders.actions.set_as.string'),
      build('delete', 'folders.actions.delete.string', {
        destructive: true,
        separatorBefore: true,
      })
    )
  }

  return actions.filter((action) => {
    if (isNormalOnlyAction(action.id)) {
      return isNormal
    }
    return true
  })
}

export const SET_AS_FOLDER_TYPES: ImapFolderType[] = [
  'DRAFT',
  'SENT',
  'TRASH',
  'JUNK',
  'TEMPLATE',
]
