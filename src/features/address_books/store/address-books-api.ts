import { createContactApiNotificationHandler } from '../utils/contact-api-notification-handler'
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
  addressBookContactExportPath,
  addressBookContactPath,
  addressBookContactsImportPath,
  addressBookContactsPath,
  addressBookExportPath,
  addressBookImportPath,
  addressBookListExportPath,
  addressBookListPath,
  addressBookListsImportPath,
  addressBookListsPath,
  addressBookPath,
  addressBooksCollectionPath,
  allContactsPath,
  buildListQueryParams,
  contactsAutocompletePath,
  legacyAddressBookEntriesPath,
  legacyVCardPath,
  isLegacyAddressBooksApi,
  mapContactSortToListSort,
} from '../utils/api-routes'
import {
  FULL_LISTS_PAGE_SIZE,
} from '../address-books-constants'
import {
  fetchContactLookupMap,
} from '../utils/fetch-contact-lookup-map'
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
import { normalizeContact, normalizeContactsList } from '../utils/normalize-contact'
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
import { unwrapJobId } from '@/features/jobs/utils/unwrap-job-data'
import type { ContactJobEnqueueResponse } from '@/features/jobs/jobs-api-types'
import {
  CONTACT_EXPORT_ACCEPT,
  type ContactTransferFormat,
} from '../utils/contact-transfer-formats'

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
    api: { queryFulfilled: Promise<unknown> }
  ) => {
    await createContactApiNotificationHandler(dispatch, options)(undefined, api)
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

        const listParams: Record<string, string | number> = {
          ...(queryParams ?? {}),
          sort_by: mapContactSortToListSort(
            queryParams?.sort_by as Parameters<typeof mapContactSortToListSort>[0]
          ),
          page_size: FULL_LISTS_PAGE_SIZE,
        }
        delete listParams.page

        const [contactsResult, listsResult, contactsByKey] = await Promise.all([
          baseQuery({
            url: addressBookContactsPath(bookId),
            params: queryParams,
          }),
          baseQuery({
            url: addressBookListsPath(bookId),
            params: listParams,
          }),
          fetchContactLookupMap(bookId, baseQuery),
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
            contactsByKey,
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
      Partial<VCard> & {
        book_id: string
        id: string
        kind?: ContactKind
        patchBody?: import('../address-books-api-types').ContactPatchBody
      }
    >({
      async queryFn({ book_id, id, kind, patchBody, ...patch }, _api, _extraOptions, baseQuery) {
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
          body: patchBody ?? serializeContactPatch(patch),
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
      {
        id: string
        vCard: Partial<VCard> & { kind?: ContactKind }
        createBody?: import('../address-books-api-types').ContactCreateBody
      }
    >({
      async queryFn({ id: bookId, vCard, createBody }, _api, _extraOptions, baseQuery) {
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
          body: createBody ?? serializeContactCreate(vCard),
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

    getAddressBookContactPicker: builder.query<VCard[], string>({
      async queryFn(bookId, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyAddressBookEntriesPath(bookId),
          })
          if (result.error) return { error: result.error }
          const entries = parseFakeBookEntries(result.data).items
          return {
            data: entries.filter((entry) => entry.kind !== 'group'),
          }
        }

        const contactsByKey = await fetchContactLookupMap(bookId, baseQuery)
        return {
          data: Array.from(contactsByKey.values()).filter(
            (entry, index, all) =>
              entry.kind !== 'group' &&
              all.findIndex((item) => item.id === entry.id) === index
          ),
        }
      },
      providesTags: (result, error, bookId) => [vcardBookTag(bookId)],
    }),

    searchAllContacts: builder.query<
      BookEntriesResponse,
      { params?: BookEntriesQueryParams; minSearchLength?: number }
    >({
      async queryFn({ params, minSearchLength = 2 }, _api, _extraOptions, baseQuery) {
        if (isLegacyAddressBooksApi()) {
          const result = await baseQuery({
            url: legacyAddressBookEntriesPath('all'),
            params: buildListQueryParams(params),
          })
          if (result.error) return { error: result.error }
          const parsed = parseFakeBookEntries(result.data)
          return {
            data: {
              ...parsed,
              contactTotal: parsed.total,
              listTotal: 0,
            },
          }
        }

        const queryParams = buildListQueryParams(params, {
          omitShortSearch: true,
          minSearchLength,
        })
        const result = await baseQuery({
          url: allContactsPath(),
          params: queryParams,
        })
        if (result.error) return { error: result.error }

        const pagination = parseXPaginationFromMeta(
          result.meta as { response?: Response }
        )
        const contacts = normalizeContactsList(unwrapApiData(result.data))

        return {
          data: {
            items: contacts,
            total: pagination?.total ?? contacts.length,
            contactTotal: pagination?.total ?? contacts.length,
            listTotal: 0,
            page: pagination?.page ?? params?.page ?? 1,
            pageSize: pagination?.page_size ?? params?.page_size ?? 20,
            totalPages: pagination?.total_pages ?? 1,
          },
        }
      },
      providesTags: [{ type: ADDRESS_BOOKS_SLICE, id: 'ALL_CONTACTS' }],
    }),

    importAddressBookDocument: builder.mutation<
      { job_id: string },
      { file: File; format: ContactTransferFormat }
    >({
      query: ({ file, format }) => {
        const body = new FormData()
        body.append('file', file)
        return {
          url: addressBookImportPath(),
          method: 'POST',
          params: { format },
          body,
        }
      },
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
    }),

    importContactsDocument: builder.mutation<
      { job_id: string },
      { bookId: string; file: File; format: ContactTransferFormat }
    >({
      query: ({ bookId, file, format }) => {
        const body = new FormData()
        body.append('file', file)
        return {
          url: addressBookContactsImportPath(bookId),
          method: 'POST',
          params: { format },
          body,
        }
      },
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: ADDRESS_BOOKS_SLICE, id: bookId },
        { type: ADDRESS_BOOKS_SLICE, id: 'ALL_CONTACTS' },
      ],
    }),

    importListsDocument: builder.mutation<
      { job_id: string },
      { bookId: string; file: File; format: ContactTransferFormat }
    >({
      query: ({ bookId, file, format }) => {
        const body = new FormData()
        body.append('file', file)
        return {
          url: addressBookListsImportPath(bookId),
          method: 'POST',
          params: { format },
          body,
        }
      },
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: ADDRESS_BOOKS_SLICE, id: bookId },
      ],
    }),

    exportAddressBookDocument: builder.mutation<
      { job_id: string },
      { bookId: string; format: ContactTransferFormat }
    >({
      query: ({ bookId, format }) => ({
        url: addressBookExportPath(bookId),
        method: 'GET',
        headers: {
          Accept: CONTACT_EXPORT_ACCEPT[format],
        },
      }),
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
    }),

    exportContactDocument: builder.mutation<
      { job_id: string },
      { bookId: string; contactId: string; format: ContactTransferFormat }
    >({
      query: ({ bookId, contactId, format }) => ({
        url: addressBookContactExportPath(bookId, contactId),
        method: 'GET',
        headers: {
          Accept: CONTACT_EXPORT_ACCEPT[format],
        },
      }),
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
    }),

    exportListDocument: builder.mutation<
      { job_id: string },
      { bookId: string; listId: string; format: ContactTransferFormat }
    >({
      query: ({ bookId, listId, format }) => ({
        url: addressBookListExportPath(bookId, listId),
        method: 'GET',
        headers: {
          Accept: CONTACT_EXPORT_ACCEPT[format],
        },
      }),
      transformResponse: (response: ContactJobEnqueueResponse) => ({
        job_id: unwrapJobId(response),
      }),
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
  useGetAddressBookContactPickerQuery,
  useSearchAllContactsQuery,
  useImportAddressBookDocumentMutation,
  useImportContactsDocumentMutation,
  useImportListsDocumentMutation,
  useExportAddressBookDocumentMutation,
  useExportContactDocumentMutation,
  useExportListDocumentMutation,
} = injectedEndpoints

export const addressBooksApiEndpoints = injectedEndpoints
