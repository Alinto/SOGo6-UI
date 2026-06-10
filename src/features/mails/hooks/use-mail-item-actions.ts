'use client'

import { useCallback, useMemo } from 'react'
import type { ImapFolderType } from '../mails-types'
import {
  useGetFoldersQuery,
  useMailActionMutation,
  useMoveToTrashMutation,
} from '../store/mails-api'
import { findArchiveFolderPath, ARCHIVE_FOLDER_FALLBACK } from '../utils/find-archive-folder-path'
import {
  findFolderByPath,
  isJunkFolderPath,
  isTrashFolderPath,
} from '../utils/find-folder-by-path'
import {
  buildMailFolderKey,
  getPostRemovalTarget,
  type MailNavigationContext,
  type PostRemovalTarget,
} from '../utils/mail-detail-navigation'

export type UseMailItemActionsArgs = {
  accountId: string
  folder: string
  mailId?: string
  seen?: boolean
  navigation?: MailNavigationContext
  onRemoved?: (result: PostRemovalTarget) => void
}

export type UseMailItemActionsReturn = {
  deleteMail: (targetMailId?: string) => Promise<void>
  markUnread: () => Promise<void>
  toggleRead: (targetMailId: string, currentlySeen: boolean) => Promise<void>
  markSpam: (targetMailId?: string) => Promise<void>
  markHam: (targetMailId?: string) => Promise<void>
  archiveMail: (targetMailId?: string, dest?: string) => Promise<void>
  applyLabel: (imapLabel: string) => Promise<void>
  removeLabel: (imapLabel: string) => Promise<void>
  archiveDestination: string
  isJunk: boolean
  isTrash: boolean
  folderType: ImapFolderType | undefined
  isLoading: boolean
}

export function useMailItemActions({
  accountId,
  folder,
  mailId,
  seen,
  navigation,
  onRemoved,
}: UseMailItemActionsArgs): UseMailItemActionsReturn {
  const accountKey = accountId || '0'
  const currentFolderKey = buildMailFolderKey(accountKey, folder)

  const { data: folders } = useGetFoldersQuery({ accountId: accountKey })
  const currentFolder = useMemo(
    () => findFolderByPath(folders ?? [], folder),
    [folders, folder]
  )

  const isJunk = isJunkFolderPath(folder, currentFolder)
  const isTrash = isTrashFolderPath(folder, currentFolder)
  const folderType = currentFolder?.type
  const archiveDestination =
    findArchiveFolderPath(folders) ?? ARCHIVE_FOLDER_FALLBACK

  const [moveToTrash, moveState] = useMoveToTrashMutation()
  const [mailAction, mailActionState] = useMailActionMutation()

  const isLoading = moveState.isLoading || mailActionState.isLoading

  const resolveMailId = useCallback(
    (targetMailId?: string) => targetMailId ?? mailId,
    [mailId]
  )

  const runWithRemoval = useCallback(
    async (
      id: string,
      action: () => Promise<unknown>
    ): Promise<void> => {
      const removalTarget = getPostRemovalTarget({
        mailId: id,
        navigation,
        currentFolderKey,
      })
      try {
        await action()
        onRemoved?.(removalTarget)
      } catch {
        // errors surfaced via createApiNotificationHandler
      }
    },
    [navigation, currentFolderKey, onRemoved]
  )

  const deleteMail = useCallback(
    async (targetMailId?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
      await runWithRemoval(id, () =>
        moveToTrash({
          accountId: accountKey,
          folder,
          mailId: id,
        }).unwrap()
      )
    },
    [resolveMailId, runWithRemoval, moveToTrash, accountKey, folder]
  )

  const markUnread = useCallback(async () => {
    if (!mailId || seen === false) return
    try {
      await mailAction({
        accountId: accountKey,
        folder,
        mailId,
        action: 'untag',
        data: ['\\Seen'],
      }).unwrap()
    } catch {
      // handled by notifications if configured
    }
  }, [mailId, seen, mailAction, accountKey, folder])

  const toggleRead = useCallback(
    async (targetMailId: string, currentlySeen: boolean) => {
      await mailAction({
        accountId: accountKey,
        folder,
        mailId: targetMailId,
        action: currentlySeen ? 'untag' : 'tag',
        data: ['\\Seen'],
      }).unwrap()
    },
    [mailAction, accountKey, folder]
  )

  const markSpam = useCallback(
    async (targetMailId?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
      await runWithRemoval(id, () =>
        mailAction({
          accountId: accountKey,
          folder,
          mailId: id,
          action: 'spam',
        }).unwrap()
      )
    },
    [resolveMailId, runWithRemoval, mailAction, accountKey, folder]
  )

  const markHam = useCallback(
    async (targetMailId?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
      await runWithRemoval(id, () =>
        mailAction({
          accountId: accountKey,
          folder,
          mailId: id,
          action: 'ham',
        }).unwrap()
      )
    },
    [resolveMailId, runWithRemoval, mailAction, accountKey, folder]
  )

  const archiveMail = useCallback(
    async (targetMailId?: string, dest?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
      const destination = dest ?? archiveDestination
      await runWithRemoval(id, () =>
        mailAction({
          accountId: accountKey,
          folder,
          mailId: id,
          action: 'move',
          data: destination,
        }).unwrap()
      )
    },
    [
      resolveMailId,
      runWithRemoval,
      archiveDestination,
      mailAction,
      accountKey,
      folder,
    ]
  )

  const applyLabel = useCallback(
    async (imapLabel: string) => {
      if (!mailId) return
      await mailAction({
        accountId: accountKey,
        folder,
        mailId,
        action: 'tag',
        data: [imapLabel],
      }).unwrap()
    },
    [mailId, mailAction, accountKey, folder]
  )

  const removeLabel = useCallback(
    async (imapLabel: string) => {
      if (!mailId) return
      await mailAction({
        accountId: accountKey,
        folder,
        mailId,
        action: 'untag',
        data: [imapLabel],
      }).unwrap()
    },
    [mailId, mailAction, accountKey, folder]
  )

  return {
    deleteMail,
    markUnread,
    toggleRead,
    markSpam,
    markHam,
    archiveMail,
    applyLabel,
    removeLabel,
    archiveDestination,
    isJunk,
    isTrash,
    folderType,
    isLoading,
  }
}
