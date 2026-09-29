'use client'

import { useCallback, useMemo } from 'react'
import { useGetFoldersQuery } from '../store/mails-api'
import { findFolderByPath } from '../utils/find-folder-by-path'
import {
  FULL_FOLDER_PERMISSIONS,
  getPermissionsForFolder,
  intersectFolderPermissions,
  type FolderPermissions,
} from '../utils/folder-permissions'

/** Permissions of the connected user on one folder of the given account. */
export function useFolderPermissions(
  accountId: string,
  folderPath?: string
): FolderPermissions {
  const { data: folders } = useGetFoldersQuery({ accountId: accountId || '0' })

  return useMemo(() => {
    if (!folderPath || !folders) return FULL_FOLDER_PERMISSIONS
    return getPermissionsForFolder(findFolderByPath(folders, folderPath))
  }, [folders, folderPath])
}

export interface FolderPermissionsResolver {
  /** Permissions on a single folder path (unrestricted when unknown). */
  forFolder: (folderPath?: string) => FolderPermissions
  /** Permissions common to several folder paths (all must allow). */
  forFolders: (folderPaths: string[]) => FolderPermissions
}

/**
 * Resolves permissions for arbitrary folder paths, e.g. the folders of a
 * selection made from cross-folder search results.
 */
export function useFolderPermissionsResolver(
  accountId: string
): FolderPermissionsResolver {
  const { data: folders } = useGetFoldersQuery({ accountId: accountId || '0' })

  const forFolder = useCallback(
    (folderPath?: string) => {
      if (!folderPath || !folders) return FULL_FOLDER_PERMISSIONS
      return getPermissionsForFolder(findFolderByPath(folders, folderPath))
    },
    [folders]
  )

  const forFolders = useCallback(
    (folderPaths: string[]) =>
      intersectFolderPermissions(
        Array.from(new Set(folderPaths)).map((path) => forFolder(path))
      ),
    [forFolder]
  )

  return useMemo(() => ({ forFolder, forFolders }), [forFolder, forFolders])
}
