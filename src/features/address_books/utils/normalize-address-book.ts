import type {
  ApiAddressBook,
  ApiAddressBooksData,
  ApiDataResponse,
} from '../address-books-api-types'
import type { AddressBook, AddressBooks } from '../address-books-types'
import { unwrapApiData } from './unwrap-api-data'

function mapSourceTypeToUi(
  sourceType?: ApiAddressBook['source_type']
): AddressBook['type'] {
  if (sourceType === 'ldap') return 'global'
  if (sourceType === 'carddav') return 'shared'
  return 'personal'
}

export function normalizeAddressBook(raw: ApiAddressBook): AddressBook {
  const id = raw.key
  return {
    id,
    name: raw.name,
    description: raw.description ?? '',
    type: mapSourceTypeToUi(raw.source_type),
    default: raw.is_default ?? false,
  }
}

function isFakeAddressBooksShape(
  response: unknown
): response is AddressBooks {
  return (
    response !== null &&
    typeof response === 'object' &&
    ('personals' in response || 'globals' in response || 'subscriptions' in response)
  )
}

export function normalizeAddressBooksResponse(
  response: ApiDataResponse<ApiAddressBooksData> | ApiAddressBooksData | AddressBooks
): AddressBooks {
  if (isFakeAddressBooksShape(response)) {
    return response
  }

  const data = unwrapApiData(response)
  if (isFakeAddressBooksShape(data)) {
    return data
  }

  const books = (data as ApiAddressBooksData).addressbooks ?? []
  const personals: AddressBook[] = []
  const subscriptions: AddressBook[] = []
  const globals: AddressBook[] = []

  for (const book of books) {
    const normalized = normalizeAddressBook(book)
    if (book.source_type === 'ldap') {
      globals.push(normalized)
    } else if (book.source_type === 'carddav') {
      subscriptions.push(normalized)
    } else {
      personals.push(normalized)
    }
  }

  return { personals, subscriptions, globals }
}

export function normalizeSingleAddressBookResponse(
  response: ApiDataResponse<ApiAddressBook> | ApiAddressBook | AddressBook
): AddressBook {
  if (
    response &&
    typeof response === 'object' &&
    'id' in response &&
    !('key' in response && 'source_type' in response)
  ) {
    return response as AddressBook
  }
  return normalizeAddressBook(unwrapApiData(response as ApiDataResponse<ApiAddressBook>))
}
