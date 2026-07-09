'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import type { ImapFolder, ImapFolderType } from '../mails-types'
import { useGetFoldersQuery } from '../store/mails-api'
import { findFolderByPath } from '../utils/find-folder-by-path'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import {
  isVirtualFolder,
  normalizeFolderType,
} from '../utils/folder-type-helpers'

export interface UseCurrentFolderResult {
  folder: ImapFolder | undefined
  folderType: ImapFolderType | undefined
  folderPath: string
  accountId: string
  isSelectable: boolean
  isVirtual: boolean
  isLoading: boolean
}

export function useCurrentFolder(
  folderOverride?: string,
  accountIdOverride?: string
): UseCurrentFolderResult {
  const params = useParams()
  const accountParam = params.account
  const folderParam = params.folder

  const accountId =
    accountIdOverride ??
    (Array.isArray(accountParam) ? accountParam[0] : (accountParam ?? '0'))

  const folderPath =
    folderOverride ??
    folderPathFromParams(folderParam as string | string[] | undefined)

  const { data: folders, isLoading } = useGetFoldersQuery({ accountId })

  const folder = useMemo(
    () => (folders ? findFolderByPath(folders, folderPath) : undefined),
    [folders, folderPath]
  )

  const folderType = folder?.type
  const isSelectable = folder?.selectable ?? true
  const isVirtual = folder ? isVirtualFolder(folder) : false

  return {
    folder,
    folderType: normalizeFolderType(folderType) ?? folderType,
    folderPath,
    accountId,
    isSelectable,
    isVirtual,
    isLoading,
  }
}
