import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  ADDRESS_BOOKS_SLICE,
  apiSlice,
  CONTACTS_AUTOCOMPLETE_SLICE,
  VCARD_SLICE,
} from '@/lib/redux/api/api-slice'
import type { AppDispatch } from '@/lib/redux/store'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  BookEntriesQueryParams,
  BookEntriesResponse,
  ContactSuggestion,
} from '../address-books-api-types'
import type { AddressBook, AddressBooks, ContactKind, VCard } from '../address-books-types'
import {
  addressBookContactPath,
  addressBookContactsPath,
  addressBookListPath,
  addressBookListsPath,
  addressBookPath,
  addressBooksCollectionPath,
  buildListQueryParams,
  contactsAutocompletePath,
  legacyAddressBookEntriesPath,
  legacyVCardPath,
  isLegacyAddressBooksApi,
} from '../utils/api-routes'
import {
  listTagId,
  normalizeSingleEntry,
  parseContactsAndListsFromBackend,
  parseFakeBookEntries,
} from '../utils/merge-book-entries'
import { normalizeAutocompleteResponse } from '../utils/normalize-autocomplete'
import {
  normalizeAddressBooksResponse,
  normalizeSingleAddressBookResponse,
} from '../utils/normalize-address-book'
import { normalizeContact } from '../utils/normalize-contact'
import { parseXPaginationFromMeta } from '../utils/parse-x-pagination'
import {
  serializeAddressBookCreate,
  serializeAddressBookPatch,
  serializeContactCreate,
  serializeContactPatch,
} from '../utils/serialize-contact'
import {
  serializeListCreate,
  serializeListPatch,
} from '../utils/serialize-list'
import { unwrapApiData } from '../utils/unwrap-api-data'

const vcardBookTag = (bookId: string) => ({
  type: VCARD_SLICE,
  id: `book:${bookId}`,
})

const notifyMutation =
  (options: {
    successTitle: string
    successMessage: string
    errorTitle: string
    errorMessage: string
  }) =>
  async (
    dispatch: AppDispatch,
    { queryFulfilled }: { queryFulfilled: Promise<unknown> }
  ) => {
    await createApiNotificationHandler(dispatch, options)(undefined, {
      queryFulfilled,
    })
  }

const notifyEntryCreate = notifyMutation({
  successTitle: 'address_book_entry_create.success.title.string',
  successMessage: 'address_book_entry_create.success.message.string',
  errorTitle: 'address_book_entry_create.error.title.string',
  errorMessage: 'address_book_entry_create.error.message.string',
})

const notifyEntryUpdate = notifyMutation({
  successTitle: 'address_book_entry_update.success.title.string',
  successMessage: 'address_book_entry_update.success.message.string',
  errorTitle: 'address_book_entry_update.error.title.string',
  errorMessage: 'address_book_entry_update.error.message.string',
})

const notifyEntryDelete = notifyMutation({
  successTitle: 'address_book_entry_delete.success.title.string',
  successMessage: 'address_book_entry_delete.success.message.string',
  errorTitle: 'address_book_entry_delete.error.title.string',
  errorMessage: 'address_book_entry_delete.error.message.string',
})

const notifyBookCreate = notifyMutation({
  successTitle: 'address_book_create.success.title.string',
  successMessage: 'address_book_create.success.message.string',
  errorTitle: 'address_book_create.error.title.string',
  errorMessage: 'address_book_create.error.message.string',
})

const notifyBookUpdate = notifyMutation({
  successTitle: 'address_book_update.success.title.string',
  successMessage: 'address_book_update.success.message.string',
  errorTitle: 'address_book_update.error.title.string',
  errorMessage: 'address_book_update.error.message.string',
})

const notifyBookDelete = notifyMutation({
  successTitle: 'address_book_delete.success.title.string',
  successMessage: 'address_book_delete.success.message.string',
  errorTitle: 'address_book_delete.error.title.string',
  errorMessage: 'address_book_delete.error.message.string',
})

export type GetAddressBookVCardsArg = {
  bookId: string
  params?: BookEntriesQueryParams
}

function isListKind(kind?: ContactKind): boolean {
  return kind === 'group'
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getAddressBooks: builder.query<AddressBooks, void>({
      query: () => addressBooksCollectionPath(),
      transformResponse: (response: unknown) =>
        normalizeAddressBooksResponse(response as Parameters<typeof normalizeAddressBooksResponse>[0]),
      providesTags: [ADDRESS_BOOKS_SLICE],
    }),

    getAddressBookVCards: builder.query<
      BookEntriesResponse,
      GetAddressBookVCardsArg | string
    >({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const bookId = typeof arg === 'string' ? arg : arg.bookId
        const params = typeof arg === 'string' ? undefined : arg.params
        const queryParams = buildListQueryParams(params, {
          omitShortSearch: !isLegacyAddressBooksApi(),
        })

        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyAddressBookEntriesPath(bookId),
            params: queryParams,
          })
          if (result.error) return { error: result.error }
          return { data: parseFakeBookEntries(result.data) }
        }

        const listParams = {
          ...queryParams,
          sort_by: queryParams?.sort_by === 'display_name' ? 'name' : queryParams?.sort_by,
        }

        const [contactsResult, listsResult] = await Promise.all([
          baseQuery({
            url: addressBookContactsPath(bookId),
            params: queryParams,
          }),
          baseQuery({
            url: addressBookListsPath(bookId),
            params: listParams,
          }),
        ])

        if (contactsResult.error) return { error: contactsResult.error }
        if (listsResult.error) return { error: listsResult.error }

        const contactsPagination = parseXPaginationFromMeta(
          contactsResult.meta as { response?: Response }
        )
        const listsPagination = parseXPaginationFromMeta(
          listsResult.meta as { response?: Response }
        )

        return {
          data: parseContactsAndListsFromBackend(
            contactsResult.data,
            listsResult.data,
            contactsPagination,
            listsPagination
          ),
        }
      },
      providesTags: (result, error, arg) => {
        const bookId = typeof arg === 'string' ? arg : arg.bookId
        return [{ type: ADDRESS_BOOKS_SLICE, id: bookId }]
      },
    }),

    getVCard: builder.query<
      VCard,
      { book_id: string; id: string; kind?: ContactKind }
    >({
      async queryFn({ book_id, id, kind }, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyVCardPath(book_id, id),
          })
          if (result.error) return { error: result.error }
          return { data: normalizeContact(result.data as VCard) }
        }

        if (isListKind(kind)) {
          const listResult = await baseQuery({
            url: addressBookListPath(book_id, id),
          })
          if (!listResult.error) {
            return {
              data: normalizeSingleEntry(listResult.data),
            }
          }
        }

        const contactResult = await baseQuery({
          url: addressBookContactPath(book_id, id),
        })
        if (!contactResult.error) {
          return { data: normalizeContact(unwrapApiData(contactResult.data)) }
        }

        const listResult = await baseQuery({
          url: addressBookListPath(book_id, id),
        })
        if (listResult.error) return { error: listResult.error }
        return { data: normalizeSingleEntry(listResult.data) }
      },
      providesTags: (result, error, { id, book_id }) => [
        { type: VCARD_SLICE, id: result?.kind === 'group' ? listTagId(id) : id },
        { type: VCARD_SLICE, id },
        vcardBookTag(book_id),
      ],
    }),

    updateVCard: builder.mutation<
      VCard,
      Partial<VCard> & { book_id: string; id: string; kind?: ContactKind }
    >({
      async queryFn({ book_id, id, kind, ...patch }, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyVCardPath(book_id, id),
            method: 'PATCH',
            body: patch,
          })
          if (result.error) return { error: result.error }
          return { data: normalizeContact(result.data as VCard) }
        }

        if (isListKind(kind ?? patch.kind)) {
          const body = serializeListPatch({
            name: patch.firstName,
            note: patch.note,
            memberContactIds: patch.members
              ?.map((member) => member.contactId)
              .filter((memberId): memberId is string => Boolean(memberId)),
          })
          const result = await baseQuery({
            url: addressBookListPath(book_id, id),
            method: 'PATCH',
            body,
          })
          if (result.error) return { error: result.error }
          return { data: normalizeSingleEntry(result.data) }
        }

        const result = await baseQuery({
          url: addressBookContactPath(book_id, id),
          method: 'PATCH',
          body: serializeContactPatch(patch),
        })
        if (result.error) return { error: result.error }
        return { data: normalizeContact(unwrapApiData(result.data)) }
      },
      invalidatesTags: (result, error, { id, book_id, kind }) => [
        { type: VCARD_SLICE, id: isListKind(kind ?? result?.kind) ? listTagId(id) : id },
        { type: VCARD_SLICE, id },
        { type: ADDRESS_BOOKS_SLICE, id: book_id },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryUpdate(dispatch, { queryFulfilled })
      },
    }),

    addVCardToAddressBook: builder.mutation<
      VCard,
      { id: string; vCard: Partial<VCard> & { kind?: ContactKind } }
    >({
      async queryFn({ id: bookId, vCard }, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyAddressBookEntriesPath(bookId),
            method: 'POST',
            body: vCard,
          })
          if (result.error) return { error: result.error }
          return { data: normalizeContact(result.data as VCard) }
        }

        if (isListKind(vCard.kind)) {
          const members =
            vCard.members
              ?.map((member) => member.contactId)
              .filter((memberId): memberId is string => Boolean(memberId)) ?? []
          const result = await baseQuery({
            url: addressBookListsPath(bookId),
            method: 'POST',
            body: serializeListCreate({
              name: vCard.firstName ?? '',
              description: vCard.note,
              members,
            }),
          })
          if (result.error) return { error: result.error }
          return { data: normalizeSingleEntry(result.data) }
        }

        const result = await baseQuery({
          url: addressBookContactsPath(bookId),
          method: 'POST',
          body: serializeContactCreate(vCard),
        })
        if (result.error) return { error: result.error }
        return { data: normalizeContact(unwrapApiData(result.data)) }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: ADDRESS_BOOKS_SLICE, id },
        { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryCreate(dispatch, { queryFulfilled })
      },
    }),

    deleteVCardFromAddressBook: builder.mutation<
      void,
      { id: string; vCardId: string; kind?: ContactKind }
    >({
      async queryFn({ id: bookId, vCardId, kind }, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyVCardPath(bookId, vCardId),
            method: 'DELETE',
          })
          if (result.error) return { error: result.error }
          return { data: undefined }
        }

        const url = isListKind(kind)
          ? addressBookListPath(bookId, vCardId)
          : addressBookContactPath(bookId, vCardId)
        const result = await baseQuery({ url, method: 'DELETE' })
        if (result.error) return { error: result.error }
        return { data: undefined }
      },
      invalidatesTags: (result, error, { id: bookId, vCardId, kind }) => [
        { type: ADDRESS_BOOKS_SLICE, id: bookId },
        { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
        { type: VCARD_SLICE, id: isListKind(kind) ? listTagId(vCardId) : vCardId },
        { type: VCARD_SLICE, id: vCardId },
        vcardBookTag(bookId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryDelete(dispatch, { queryFulfilled })
      },
    }),

    updateAddressBook: builder.mutation<
      AddressBook,
      Partial<AddressBook> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: addressBookPath(id),
        method: 'PATCH',
        body: serializeAddressBookPatch(patch),
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleAddressBookResponse(
          response as Parameters<typeof normalizeSingleAddressBookResponse>[0]
        ),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookUpdate(dispatch, { queryFulfilled })
      },
    }),

    deleteAddressBook: builder.mutation<void, string>({
      query: (id) => ({
        url: addressBookPath(id),
        method: 'DELETE',
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookDelete(dispatch, { queryFulfilled })
      },
    }),

    addAddressBook: builder.mutation<
      AddressBook,
      Omit<AddressBook, 'id' | 'default'>
    >({
      query: ({ name, description }) => ({
        url: addressBooksCollectionPath(),
        method: 'POST',
        body: serializeAddressBookCreate({ name, description }),
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleAddressBookResponse(
          response as Parameters<typeof normalizeSingleAddressBookResponse>[0]
        ),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookCreate(dispatch, { queryFulfilled })
      },
    }),

    searchContactsAutocomplete: builder.query<ContactSuggestion[], { q: string }>({
      query: ({ q }) => ({
        url: contactsAutocompletePath(),
        params: { q },
      }),
      transformResponse: (response: unknown) => normalizeAutocompleteResponse(response as never),
      keepUnusedDataFor: 30,
      providesTags: [CONTACTS_AUTOCOMPLETE_SLICE],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAddressBooksQuery,
  useUpdateAddressBookMutation,
  useGetAddressBookVCardsQuery,
  useGetVCardQuery,
  useUpdateVCardMutation,
  useAddVCardToAddressBookMutation,
  useDeleteVCardFromAddressBookMutation,
  useAddAddressBookMutation,
  useDeleteAddressBookMutation,
  useSearchContactsAutocompleteQuery,
  useLazySearchContactsAutocompleteQuery,
} = injectedEndpoints

export const addressBooksApiEndpoints = injectedEndpoints
