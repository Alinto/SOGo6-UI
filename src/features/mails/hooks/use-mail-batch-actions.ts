'use client'

import { useCallback, useMemo } from 'react'
import type { ImapFolderType, MailBatchActionType } from '../mails-types'
import {
  useGetFoldersQuery,
  useMailBatchActionMutation,
} from '../store/mails-api'
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
  batchMarkImportant: (mailIds: string[]) => Promise<void>
  batchRemoveImportant: (mailIds: string[]) => Promise<void>
  batchPhishing: (mailIds: string[]) => Promise<void>
  batchIllegal: (mailIds: string[]) => Promise<void>
  batchMove: (mailIds: string[], destination: string) => Promise<void>
  batchCopy: (mailIds: string[], destination: string) => Promise<void>
  batchApplyLabels: (mailIds: string[], labels: string[]) => Promise<void>
  batchRemoveLabels: (mailIds: string[], labels: string[]) => Promise<void>
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

  const batchMarkImportant = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'tag', ['\\Flagged']),
    [runBatch]
  )

  const batchRemoveImportant = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'untag', ['\\Flagged']),
    [runBatch]
  )

  const batchPhishing = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'phishing'),
    [runBatch]
  )

  const batchIllegal = useCallback(
    (mailIds: string[]) => runBatch(mailIds, 'illegal'),
    [runBatch]
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
    batchMarkRead,
    batchMarkUnread,
    batchSpam,
    batchHam,
    batchToggleSpam,
    batchMarkImportant,
    batchRemoveImportant,
    batchPhishing,
    batchIllegal,
    batchMove,
    batchCopy,
    batchApplyLabels,
    batchRemoveLabels,
    isJunk,
    isTrash,
    folderType,
    isLoading,
  }
}
