import type { SogoModule } from '@/features/user-profile/profile-types'
import type { ImapFolder, ImapFolderType } from '../mails-types'
import { canRenameFolder } from './can-rename-folder'
import {
  isJunkFolderType,
  isNormalFolderType,
  isTrashFolderType,
  isVirtualFolder,
} from './folder-type-helpers'

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
  folderSharingDisabled?: SogoModule[]
}

const ACTION_UNAVAILABLE_KEY = 'folders.actions.action_unavailable.string'

/** Backend PATCH folders / mark-as-read / export are not implemented yet. */
const BACKEND_BLOCKED_ACTIONS = new Set<FolderActionId>([
  'mark_as_read',
  'export',
  'move_to',
  'set_as',
])

function isNormalOnlyAction(id: FolderActionId): boolean {
  return id === 'rename' || id === 'move_to' || id === 'delete' || id === 'set_as'
}

function buildAction(
  id: FolderActionId,
  translationKey: string,
  options?: Partial<FolderActionDefinition>
): FolderActionDefinition {
  const backendBlocked = BACKEND_BLOCKED_ACTIONS.has(id)
  return {
    id,
    translationKey,
    disabled: backendBlocked || options?.disabled,
    disabledReasonKey: backendBlocked
      ? ACTION_UNAVAILABLE_KEY
      : options?.disabledReasonKey,
    destructive: options?.destructive,
    separatorBefore: options?.separatorBefore,
  }
}

export function getFolderActions(
  folder: Pick<ImapFolder, 'type' | 'selectable' | 'default'>,
  options: GetFolderActionsOptions = {}
): FolderActionDefinition[] {
  const { mailPurgeAllow = false, folderSharingDisabled = [] } = options
  const isSharingDisabled = folderSharingDisabled.includes('mail')

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

  const actions: FolderActionDefinition[] = [
    buildAction('mark_as_read', 'folders.actions.mark_as_read.string'),
    buildAction('new_subfolder', 'folders.actions.new_subfolder.string'),
  ]

  if (!isSharingDisabled) {
    actions.push(
      buildAction('sharing', 'folders.actions.sharing.string', {
        separatorBefore: true,
      })
    )
  }

  actions.push(
    buildAction('export', 'folders.actions.export.string', {
      separatorBefore: !isSharingDisabled,
    })
  )

  if (mailPurgeAllow) {
    actions.push(
      buildAction('purge', 'folders.actions.purge.string', {
        separatorBefore: true,
      })
    )
  }

  actions.push(
    buildAction('expunge', 'folders.actions.expunge.string', {
      separatorBefore: !mailPurgeAllow,
    })
  )

  if (isTrashOrJunk) {
    actions.push(
      buildAction('empty_folder', 'folders.actions.empty_folder.string', {
        separatorBefore: true,
      })
    )
  }

  if (isNormal) {
    const renameAllowed = canRenameFolder(folder)
    if (renameAllowed) {
      actions.push(
        buildAction('rename', 'folders.actions.rename.string', {
          separatorBefore: true,
        })
      )
    }
    actions.push(
      buildAction('move_to', 'folders.actions.move_to.string'),
      buildAction('set_as', 'folders.actions.set_as.string'),
      buildAction('delete', 'folders.actions.delete.string', {
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
