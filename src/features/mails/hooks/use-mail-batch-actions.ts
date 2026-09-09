'use client'

import { useCallback, useMemo } from 'react'
import type { ImapFolderType, MailBatchActionType } from '../mails-types'
import {
  useGetFoldersQuery,
  useMailBatchActionMutation,
} from '../store/mails-api'
import {
  ARCHIVE_FOLDER_FALLBACK,
  findArchiveFolderPath,
} from '../utils/find-archive-folder-path'
import {
  findFolderByPath,
  isJunkFolderPath,
  isTrashFolderPath,
} from '../utils/find-folder-by-path'

export type UseMailBatchActionsArgs = {
  accountId: string
  folder: string
  /**
   * Per-mail folder overrides, keyed by mail id. Needed when the selection
   * comes from cross-folder search results, where `folder` (the currently
   * open route folder) doesn't necessarily match where a given mail lives.
   */
  folderById?: Record<string, string>
}

export type UseMailBatchActionsReturn = {
  batchDelete: (mailIds: string[]) => Promise<void>
  batchArchive: (mailIds: string[]) => Promise<void>
  batchMarkRead: (mailIds: string[]) => Promise<void>
  batchMarkUnread: (mailIds: string[]) => Promise<void>
  batchSpam: (mailIds: string[]) => Promise<void>
  batchHam: (mailIds: string[]) => Promise<void>
  /**
   * Marks each id as spam or ham depending on whether *its own* folder is
   * the Junk folder, not the currently open route folder. Needed because a
   * selection from cross-folder search results can mix junk and non-junk
   * mails.
   */
  batchToggleSpam: (mailIds: string[]) => Promise<void>
  batchMove: (mailIds: string[], destination: string) => Promise<void>
  batchCopy: (mailIds: string[], destination: string) => Promise<void>
  batchApplyLabels: (mailIds: string[], labels: string[]) => Promise<void>
  batchRemoveLabels: (mailIds: string[], labels: string[]) => Promise<void>
  archiveDestination: string
  isJunk: boolean
  isTrash: boolean
  folderType: ImapFolderType | undefined
  isLoading: boolean
}

export function useMailBatchActions({
  accountId,
  folder,
  folderById,
}: UseMailBatchActionsArgs): UseMailBatchActionsReturn {
  const accountKey = accountId || '0'

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

  const [mailBatchAction, mailBatchActionState] = useMailBatchActionMutation()
  const isLoading = mailBatchActionState.isLoading

  const runBatch = useCallback(
    async (
      mailIds: string[],
      action: MailBatchActionType,
      data?: string | string[] | null
    ) => {
      if (mailIds.length === 0) return

      // Mails selected from cross-folder search results don't all live in
      // `folder` (the currently open route folder) — group them by their
      // actual folder so one request can carry every folder at once.
      const folders: Record<string, string[]> = {}
      for (const id of mailIds) {
        const targetFolder = folderById?.[id] ?? folder
        ;(folders[targetFolder] ??= []).push(id)
      }

      await mailBatchAction({
        accountId: accountKey,
        folders,
        action,
        data,
      })
        .unwrap()
        .catch(() => {
          // errors surfaced via createApiNotificationHandler
        })
    },
    [mailBatchAction, accountKey, folder, folderById]
  )

  const batchDelete = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'delete'),
    [runBatch]
  )

  const batchArchive = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'move', archiveDestination),
    [runBatch, archiveDestination]
  )

  const batchMarkRead = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'tag', ['\\Seen']),
    [runBatch]
  )

  const batchMarkUnread = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'untag', ['\\Seen']),
    [runBatch]
  )

  const batchSpam = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'spam'),
    [runBatch]
  )

  const batchHam = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'ham'),
    [runBatch]
  )

  const batchToggleSpam = useCallback(
    async (mailIds: string[]) => {
      const junkIds: string[] = []
      const nonJunkIds: string[] = []
      for (const id of mailIds) {
        const targetFolder = folderById?.[id] ?? folder
        const targetFolderIsJunk =
          targetFolder === folder
            ? isJunk
            : isJunkFolderPath(
                targetFolder,
                findFolderByPath(folders ?? [], targetFolder)
              )
        ;(targetFolderIsJunk ? junkIds : nonJunkIds).push(id)
      }
      await Promise.all([batchHam(junkIds), batchSpam(nonJunkIds)])
    },
    [folderById, folder, isJunk, folders, batchHam, batchSpam]
  )

  const batchMove = useCallback(
    (mailIds: string[], destination: string) =>
      runBatch(mailIds, 'move', destination),
    [runBatch]
  )

  const batchCopy = useCallback(
    (mailIds: string[], destination: string) =>
      runBatch(mailIds, 'copy', destination),
    [runBatch]
  )

  const batchApplyLabels = useCallback(
    (mailIds: string[], labels: string[]) => runBatch(mailIds, 'tag', labels),
    [runBatch]
  )

  const batchRemoveLabels = useCallback(
    (mailIds: string[], labels: string[]) => runBatch(mailIds, 'untag', labels),
    [runBatch]
  )

  return {
    batchDelete,
    batchArchive,
    batchMarkRead,
    batchMarkUnread,
    batchSpam,
    batchHam,
    batchToggleSpam,
    batchMove,
    batchCopy,
    batchApplyLabels,
    batchRemoveLabels,
    archiveDestination,
    isJunk,
    isTrash,
    folderType,
    isLoading,
  }
}
