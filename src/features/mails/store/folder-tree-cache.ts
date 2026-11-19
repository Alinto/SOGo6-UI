import { apiSlice, MAILS_FOLDERS_SLICE } from '@/lib/redux/api/api-slice'
import type { RootState } from '@/lib/redux/store'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { ImapFolder } from '../mails-types'

type GetFoldersArg = { accountId?: string } | undefined
type FolderArg = { accountId: string; folderPath: string }

/**
 * Sets the unseen count of the folder at `path` in a folder tree (mutates
 * it, meant for an Immer draft). Returns whether the folder was found.
 */
export function setFolderUnseenCount(
  folders: ImapFolder[],
  path: string,
  unseenCount: number
): boolean {
  for (const folder of folders) {
    if (folder.path === path) {
      folder.unseen_count = unseenCount
      return true
    }
    const nested = folder.subfolders ?? folder.children
    if (nested && setFolderUnseenCount(nested, path, unseenCount)) return true
  }
  return false
}

/*
 * Typed wrappers around apiSlice utilities: the mails endpoints are injected
 * after apiSlice is typed, so their types are not visible on it (same
 * limitation as in mails-cache.ts).
 */
const util = apiSlice.util as unknown as {
  invalidateTags: (tags: string[]) => UnknownAction
  selectCachedArgsForQuery: (state: RootState, name: string) => GetFoldersArg[]
  updateQueryData: (
    name: string,
    arg: GetFoldersArg,
    recipe: (draft: ImapFolder[]) => void
  ) => UnknownAction
}

const getFolderEndpoint = (
  apiSlice.endpoints as unknown as {
    getFolder: {
      initiate: (
        arg: FolderArg,
        options?: { subscribe?: boolean; forceRefetch?: boolean }
      ) => UnknownAction & { unwrap: () => Promise<ImapFolder> }
    }
  }
).getFolder

/**
 * Reloads one folder (`GET mailboxes/{id}/folders/{path}`) and copies its
 * unseen count into every cached folder tree of that mailbox, instead of
 * reloading the whole tree. If that request fails, the whole tree is
 * reloaded so the badge does not keep its previous count.
 */
export async function refreshFolderUnseenCount(
  dispatch: (action: UnknownAction) => unknown,
  getState: () => unknown,
  { accountId, folderPath }: FolderArg
): Promise<void> {
  let folder: ImapFolder
  try {
    folder = await (
      dispatch(
        getFolderEndpoint.initiate(
          { accountId, folderPath },
          { subscribe: false, forceRefetch: true }
        )
      ) as { unwrap: () => Promise<ImapFolder> }
    ).unwrap()
  } catch {
    dispatch(util.invalidateTags([MAILS_FOLDERS_SLICE]))
    return
  }

  const cachedArgs = util.selectCachedArgsForQuery(
    getState() as RootState,
    'getFolders'
  )
  for (const arg of cachedArgs) {
    if ((arg?.accountId ?? '0') !== accountId) continue
    dispatch(
      util.updateQueryData('getFolders', arg, (draft) => {
        setFolderUnseenCount(draft, folderPath, folder.unseen_count)
      })
    )
  }
}
