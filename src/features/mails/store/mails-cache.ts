import {
  apiSlice,
  FOLDER_MESSAGES_SLICE,
  MAIL_SLICE,
  MAILS_FOLDERS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { RootState } from '@/lib/redux/store'
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import type {
  ImapMessages,
  ImapMessagesBackendResponse,
  ImapMessagesList,
  MailActionType,
} from '../mails-types'
import type { MailListQueryParams } from './mails-api'
import { recomputePagination } from './mails-normalizers'

export type GetFolderMessagesCacheArg = {
  accountId?: string
  folder: string
  params?: MailListQueryParams & Record<string, string | number | boolean>
}

export type MailActionInitiateArg = {
  accountId?: string
  folder: string
  mailId: string
  action: MailActionType
  data?: string | string[] | null
}

type PatchResult = { undo: () => void }

function pageSizeFromArg(queryArg: GetFolderMessagesCacheArg): number {
  const raw = queryArg.params?.page_size
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 20
}

/**
 * Typed wrappers around apiSlice cache utilities.
 * The casts are necessary because apiSlice is typed before mails endpoints
 * are merged via injectEndpoints — endpoint types are not yet available at
 * definition time. This is a known RTK Query circular reference limitation.
 */
export const folderMessagesCache = {
  /**
   * @internal `selectCachedArgsForQuery` is a stable helper on `apiSlice.util`
   * in @reduxjs/toolkit 2.x. If it ever disappears, replace with a manual
   * tracking slice (a Set<string> of active cache keys) or `onCacheEntryAdded`.
   */
  selectCachedArgs(state: RootState): GetFolderMessagesCacheArg[] {
    return (
      apiSlice.util as {
        selectCachedArgsForQuery: (
          s: RootState,
          name: string
        ) => GetFolderMessagesCacheArg[]
      }
    ).selectCachedArgsForQuery(state, 'getFolderMessages')
  },
  selectData(
    state: RootState,
    queryArg: GetFolderMessagesCacheArg
  ): ImapMessagesBackendResponse | undefined {
    const slice = (
      apiSlice.endpoints as {
        getFolderMessages: {
          select: (
            a: GetFolderMessagesCacheArg
          ) => (s: RootState) => { data?: ImapMessagesBackendResponse }
        }
      }
    ).getFolderMessages.select(queryArg)(state)
    return slice.data
  },
  updateQueryData(
    queryArg: GetFolderMessagesCacheArg,
    recipe: (draft: ImapMessagesBackendResponse) => void
  ): unknown {
    return (
      apiSlice.util as unknown as {
        updateQueryData: (
          name: string,
          arg: GetFolderMessagesCacheArg,
          recipe: (draft: ImapMessagesBackendResponse) => void
        ) => unknown
      }
    ).updateQueryData('getFolderMessages', queryArg, recipe)
  },
  initiateMailAction(
    arg: MailActionInitiateArg,
    options?: { subscribe?: boolean }
  ) {
    return (
      apiSlice.endpoints as {
        mailAction: {
          initiate: (
            a: MailActionInitiateArg,
            o?: { subscribe?: boolean }
          ) => UnknownAction & { unwrap: () => Promise<unknown> }
        }
      }
    ).mailAction.initiate(arg, options)
  },
}

export function normalizeMailActionDataArray(
  data: string | string[] | null | undefined
): string[] {
  if (data == null) return []
  return Array.isArray(data) ? data : [data]
}

export function isMailActionSeenFlagToggle(arg: {
  action: string
  data?: string | string[] | null
}): boolean {
  if (arg.action !== 'tag' && arg.action !== 'untag') return false
  return normalizeMailActionDataArray(arg.data).includes('\\Seen')
}

/** Mail actions that remove the message from its source folder. */
export function isFolderRemovingAction(action: string): boolean {
  return (
    action === 'move' ||
    action === 'spam' ||
    action === 'ham' ||
    action === 'delete'
  )
}

/** RTK Query tags to invalidate after a mail (batch) action. */
export function mailActionInvalidationTags(arg: {
  folder: string
  action: string
  data?: string | string[] | null
  mailIds: string[]
}): Array<string | { type: string; folder?: string; id?: string }> {
  if (isMailActionSeenFlagToggle(arg)) {
    return [MAILS_FOLDERS_SLICE]
  }

  const tags: Array<string | { type: string; folder?: string; id?: string }> = [
    { type: FOLDER_MESSAGES_SLICE, folder: arg.folder },
    MAILS_FOLDERS_SLICE,
    ...arg.mailIds.map((id) => ({ type: MAIL_SLICE, id })),
  ]

  if (
    (arg.action === 'move' || arg.action === 'copy') &&
    typeof arg.data === 'string' &&
    arg.data !== '' &&
    arg.data !== arg.folder
  ) {
    tags.push({ type: FOLDER_MESSAGES_SLICE, folder: arg.data })
  }

  return tags
}

export function findListItemInFolderCaches(
  state: RootState,
  accountId: string,
  folder: string,
  mailId: string
): ImapMessagesList | undefined {
  const cachedArgs = folderMessagesCache.selectCachedArgs(state)
  for (const queryArg of cachedArgs) {
    const qAccount = queryArg.accountId ?? '0'
    if (qAccount !== accountId || queryArg.folder !== folder) continue
    const data = folderMessagesCache.selectData(state, queryArg)
    const mails = data?.mails
    if (!mails?.length) continue
    const found = mails.find((m) => String(m.id) === String(mailId))
    if (found) return found
  }
  return undefined
}

/**
 * Patches the seen flag for every mail in `mailIds` in one pass per cached
 * folder page.
 */
export function dispatchSeenPatchOnAllFolderMessageCachesBatch(
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
  state: RootState,
  arg: {
    accountId?: string
    folder: string
    mailIds: string[]
    seen: boolean
  }
): PatchResult[] {
  const accountKey = arg.accountId ?? '0'
  const idSet = new Set(arg.mailIds.map(String))
  const patches: PatchResult[] = []
  const cachedArgs = folderMessagesCache.selectCachedArgs(state)
  for (const queryArg of cachedArgs) {
    const qAccount = queryArg.accountId ?? '0'
    if (qAccount !== accountKey || queryArg.folder !== arg.folder) continue
    const action = folderMessagesCache.updateQueryData(queryArg, (draft) => {
      draft.mails.forEach((m) => {
        if (idSet.has(String(m.id))) m.seen = arg.seen
      })
    })
    const patch = dispatch(action as UnknownAction) as unknown
    if (patch && typeof (patch as { undo?: () => void }).undo === 'function') {
      patches.push(patch as PatchResult)
    }
  }
  return patches
}

/** Single-mail convenience wrapper around {@link dispatchSeenPatchOnAllFolderMessageCachesBatch}. */
export function dispatchSeenPatchOnAllFolderMessageCaches(
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
  state: RootState,
  arg: {
    accountId?: string
    folder: string
    mailId: string
    seen: boolean
  }
): PatchResult[] {
  return dispatchSeenPatchOnAllFolderMessageCachesBatch(dispatch, state, {
    accountId: arg.accountId,
    folder: arg.folder,
    mailIds: [arg.mailId],
    seen: arg.seen,
  })
}

/**
 * Optimistically removes every mail whose id is in `mailIds` from each cached
 * folder page (in a single patch per page) and adjusts `total` / `totalPages`
 * / pagination flags so the toolbar counter and the list stay consistent
 * instantly (before the invalidation-driven refetch reconciles). Returns the
 * patch results so the caller can roll back on failure.
 */
export function removeMailsFromAllFolderCaches(
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
  state: RootState,
  arg: {
    accountId?: string
    folder: string
    mailIds: string[]
  }
): PatchResult[] {
  const accountKey = arg.accountId ?? '0'
  const idSet = new Set(arg.mailIds.map(String))
  const patches: PatchResult[] = []
  const cachedArgs = folderMessagesCache.selectCachedArgs(state)
  for (const queryArg of cachedArgs) {
    const qAccount = queryArg.accountId ?? '0'
    if (qAccount !== accountKey || queryArg.folder !== arg.folder) continue
    const data = folderMessagesCache.selectData(state, queryArg)
    if (!data?.mails?.some((m) => idSet.has(String(m.id)))) continue
    const pageSize = pageSizeFromArg(queryArg)
    const action = folderMessagesCache.updateQueryData(queryArg, (draft) => {
      const before = draft.mails.length
      draft.mails = draft.mails.filter((m) => !idSet.has(String(m.id)))
      const removed = before - draft.mails.length
      if (removed > 0 && typeof draft.total === 'number' && draft.total > 0) {
        draft.total = Math.max(0, draft.total - removed)
      }
      recomputePagination(draft, pageSize)
    })
    const patch = dispatch(action as UnknownAction) as unknown
    if (patch && typeof (patch as { undo?: () => void }).undo === 'function') {
      patches.push(patch as PatchResult)
    }
  }
  return patches
}

/** Single-mail convenience wrapper around {@link removeMailsFromAllFolderCaches}. */
export function removeMailFromAllFolderCaches(
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
  state: RootState,
  arg: {
    accountId?: string
    folder: string
    mailId: string
  }
): PatchResult[] {
  return removeMailsFromAllFolderCaches(dispatch, state, {
    accountId: arg.accountId,
    folder: arg.folder,
    mailIds: [arg.mailId],
  })
}

export function dispatchGetMailSeenPatch(
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
  arg: {
    accountId?: string
    folder: string
    mailId: string
    seen: boolean
  }
): PatchResult | undefined {
  const action = (
    apiSlice.util as unknown as {
      updateQueryData: (
        name: string,
        queryArg: { accountId?: string; folder: string; mailId: string },
        recipe: (draft: ImapMessages) => void
      ) => unknown
    }
  ).updateQueryData(
    'getMail',
    {
      accountId: arg.accountId,
      folder: arg.folder,
      mailId: arg.mailId,
    },
    (draft) => {
      draft.seen = arg.seen
    }
  )
  const patch = dispatch(action as UnknownAction) as unknown
  if (patch && typeof (patch as { undo?: () => void }).undo === 'function') {
    return patch as PatchResult
  }
  return undefined
}
