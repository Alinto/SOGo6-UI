import { apiSlice } from '@/lib/redux/api/api-slice'
import type { AppDispatch, RootState } from '@/lib/redux/store'
import type {
  BookEntriesQueryParams,
  BookEntriesResponse,
} from '../address-books-api-types'
import type { SharedAddressBook, VCard } from '../address-books-types'

type GetAddressBookVCardsArg =
  | { bookId: string; params?: BookEntriesQueryParams }
  | string

type PatchUndo = { undo: () => void }

function getBookIdFromArg(arg: GetAddressBookVCardsArg | string): string {
  return typeof arg === 'string' ? arg : arg.bookId
}

export function patchAllBookEntryCaches(
  dispatch: AppDispatch,
  getState: () => RootState,
  bookId: string,
  recipe: (draft: BookEntriesResponse) => void
): PatchUndo[] {
  const cachedArgs = apiSlice.util.selectCachedArgsForQuery(
    getState(),
    'getAddressBookVCards'
  ) as Array<GetAddressBookVCardsArg | string>

  const undos: PatchUndo[] = []
  for (const arg of cachedArgs) {
    if (getBookIdFromArg(arg) !== bookId) continue
    const patch = dispatch(
      apiSlice.util.updateQueryData('getAddressBookVCards', arg, recipe)
    ) as PatchUndo
    undos.push(patch)
  }
  return undos
}

export function undoEntryCachePatches(patches: PatchUndo[]): void {
  for (const patch of patches) {
    patch.undo()
  }
}

export function upsertEntryInBookCaches(
  dispatch: AppDispatch,
  getState: () => RootState,
  bookId: string,
  entry: VCard
): PatchUndo[] {
  return patchAllBookEntryCaches(dispatch, getState, bookId, (draft) => {
    const index = draft.items.findIndex((item) => item.id === entry.id)
    if (index >= 0) {
      draft.items[index] = { ...draft.items[index], ...entry }
      return
    }
    draft.items.unshift(entry)
    draft.total = (draft.total ?? 0) + 1
    if (entry.kind === 'group') {
      draft.listTotal = (draft.listTotal ?? 0) + 1
    } else {
      draft.contactTotal = (draft.contactTotal ?? 0) + 1
    }
  })
}

export function removeEntryFromBookCaches(
  dispatch: AppDispatch,
  getState: () => RootState,
  bookId: string,
  entryId: string,
  kind?: VCard['kind']
): PatchUndo[] {
  return patchAllBookEntryCaches(dispatch, getState, bookId, (draft) => {
    const index = draft.items.findIndex((item) => item.id === entryId)
    if (index < 0) return
    const removed = draft.items[index]
    draft.items.splice(index, 1)
    draft.total = Math.max(0, (draft.total ?? 1) - 1)
    if ((kind ?? removed.kind) === 'group') {
      draft.listTotal = Math.max(0, (draft.listTotal ?? 1) - 1)
    } else {
      draft.contactTotal = Math.max(0, (draft.contactTotal ?? 1) - 1)
    }
  })
}

/** apiSlice is typed with empty endpoints; injected names are not on its util. */
const selectCachedArgsByName = apiSlice.util
  .selectCachedArgsForQuery as unknown as (
  state: unknown,
  endpointName: string
) => unknown[]

const updateQueryDataByName = apiSlice.util.updateQueryData as unknown as <T>(
  endpointName: string,
  arg: unknown,
  updateRecipe: (draft: T) => void
) => Parameters<AppDispatch>[0]

/**
 * Shows the new subscription state in every cached owner's address book list
 * right away, so the dialog's button does not flip back while the list
 * refetches.
 */
export function patchSharedOwnerAddressBooks(
  dispatch: AppDispatch,
  getState: () => RootState,
  key: string,
  subscribed: boolean
): PatchUndo[] {
  const owners = selectCachedArgsByName(
    getState(),
    'getSharedAddressBooksByOwner'
  ) as string[]

  return owners.map(
    (owner) =>
      dispatch(
        updateQueryDataByName<SharedAddressBook[]>(
          'getSharedAddressBooksByOwner',
          owner,
          (draft) => {
            for (const book of draft) {
              if (book.key === key) book.subscribed = subscribed
            }
          }
        )
      ) as unknown as PatchUndo
  )
}

export function patchVCardDetailCache(
  dispatch: AppDispatch,
  args: { book_id: string; id: string; kind?: VCard['kind'] },
  recipe: (draft: VCard) => void
): PatchUndo | undefined {
  const patch = dispatch(
    apiSlice.util.updateQueryData('getVCard', args, recipe)
  ) as PatchUndo | undefined
  return patch
}
