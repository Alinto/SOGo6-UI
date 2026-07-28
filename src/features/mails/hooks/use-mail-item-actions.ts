'use client'

import { useCallback, useMemo } from 'react'
import type { ImapFolderType } from '../mails-types'
import {
  useGetFoldersQuery,
  useMailActionMutation,
  useMoveToTrashMutation,
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

export type UseMailItemActionsArgs = {
  accountId: string
  folder: string
  mailId?: string
  seen?: boolean
  onRemoved?: () => void
}

export type UseMailItemActionsReturn = {
  deleteMail: (targetMailId?: string) => Promise<void>
  markUnread: () => Promise<void>
  toggleRead: (targetMailId: string, currentlySeen: boolean) => Promise<void>
  toggleFlag: (targetMailId: string, currentlyFlagged: boolean) => Promise<void>
  markSpam: (targetMailId?: string) => Promise<void>
  markHam: (targetMailId?: string) => Promise<void>
  archiveMail: (targetMailId?: string, dest?: string) => Promise<void>
  moveMail: (destination: string, targetMailId?: string) => Promise<void>
  copyMail: (destination: string, targetMailId?: string) => Promise<void>
  applyLabel: (imapLabel: string) => Promise<void>
  removeLabel: (imapLabel: string) => Promise<void>
  markImportant: () => Promise<void>
  removeImportant: () => Promise<void>
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
  onRemoved,
}: UseMailItemActionsArgs): UseMailItemActionsReturn {
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

  const [moveToTrash, moveState] = useMoveToTrashMutation()
  const [mailAction, mailActionState] = useMailActionMutation()

  const isLoading = moveState.isLoading || mailActionState.isLoading

  const resolveMailId = useCallback(
    (targetMailId?: string) => targetMailId ?? mailId,
    [mailId]
  )

  const runWithRemoval = useCallback(
    async (id: string, action: () => Promise<unknown>): Promise<void> => {
      try {
        await action()
        onRemoved?.()
      } catch {
        // errors surfaced via createApiNotificationHandler
      }
    },
    [onRemoved]
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
    await runWithRemoval(mailId, () =>
      mailAction({
        accountId: accountKey,
        folder,
        mailId,
        action: 'untag',
        data: ['\\Seen'],
      }).unwrap()
    )
  }, [mailId, seen, runWithRemoval, mailAction, accountKey, folder])

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

  const toggleFlag = useCallback(
    async (targetMailId: string, currentlyFlagged: boolean) => {
      await mailAction({
        accountId: accountKey,
        folder,
        mailId: targetMailId,
        action: currentlyFlagged ? 'untag' : 'tag',
        data: ['\\Flagged'],
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

  const moveMail = useCallback(
    async (destination: string, targetMailId?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
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
    [resolveMailId, runWithRemoval, mailAction, accountKey, folder]
  )

  const copyMail = useCallback(
    async (destination: string, targetMailId?: string) => {
      const id = resolveMailId(targetMailId)
      if (!id) return
      try {
        await mailAction({
          accountId: accountKey,
          folder,
          mailId: id,
          action: 'copy',
          data: destination,
        }).unwrap()
      } catch {
        // errors surfaced via createApiNotificationHandler
      }
    },
    [resolveMailId, mailAction, accountKey, folder]
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

  const markImportant = useCallback(async () => {
    if (!mailId) return
    await mailAction({
      accountId: accountKey,
      folder,
      mailId,
      action: 'tag',
      data: ['\\Flagged'],
    }).unwrap()
  }, [mailId, mailAction, accountKey, folder])

  const removeImportant = useCallback(async () => {
    if (!mailId) return
    await mailAction({
      accountId: accountKey,
      folder,
      mailId,
      action: 'untag',
      data: ['\\Flagged'],
    }).unwrap()
  }, [mailId, mailAction, accountKey, folder])

  return {
    deleteMail,
    markUnread,
    toggleRead,
    toggleFlag,
    markSpam,
    markHam,
    archiveMail,
    moveMail,
    copyMail,
    applyLabel,
    removeLabel,
    markImportant,
    removeImportant,
    archiveDestination,
    isJunk,
    isTrash,
    folderType,
    isLoading,
  }
}
