import type { ContactKind } from './address-books-types'

export interface ApiDataResponse<T> {
  data: T
  error_code?: string
  error_msg?: string
}

export type ApiAddressBookSourceType =
  | 'undefined'
  | 'local'
  | 'carddav'
  | 'ldap'

export interface ApiAddressBook {
  key: string
  name: string
  description?: string | null
  is_default?: boolean
  source_type?: ApiAddressBookSourceType
  ctag?: number
}

export interface ApiAddressBooksData {
  addressbooks: ApiAddressBook[]
  total_count: number
}

export interface ApiContactEmail {
  value: string
  types?: string[]
  pref?: number | null
}

export interface ApiContactPhone {
  number: string
  types?: string[]
  pref?: number | null
}

export interface ApiContactAddress {
  po_box?: string | null
  extended?: string | null
  street?: string | null
  locality?: string | null
  region?: string | null
  postal_code?: string | null
  country?: string | null
  types?: string[]
  pref?: number | null
}

export interface ApiContactUrl {
  value: string
  type?: string | null
}

export interface ApiContactImpp {
  uri: string
  type?: string | null
}

export interface ApiContact {
  key: string
  addressbook_key?: string | null
  uid?: string | null
  version?: string
  kind?: ContactKind | 'org'
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  prefix?: string | null
  suffix?: string | null
  nickname?: string | null
  organization?: string | null
  department?: string | null
  job_title?: string | null
  role?: string | null
  emails?: ApiContactEmail[]
  phones?: ApiContactPhone[]
  addresses?: ApiContactAddress[]
  urls?: ApiContactUrl[]
  impp?: ApiContactImpp[]
  photos?: string[]
  categories?: string[]
  birthday?: string | null
  anniversary?: string | null
  geo?: string | null
  note?: string | null
  public_key?: string | null
  sound?: string | null
  timezone?: string | null
  extra_properties?: Record<string, string>
  import_format?: string
  rev?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ApiContactsListData {
  contacts: ApiContact[]
}

export interface ApiDistributionList {
  key: string
  uid?: string | null
  name: string
  description?: string | null
  members: string[]
  member_count?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface ApiListsCollectionData {
  lists: ApiDistributionList[]
}

export interface ApiSuggestionMember {
  contact_key?: string | null
  name?: string | null
  email?: string | null
}

export interface ApiContactSuggestion {
  type: 'contact' | 'list'
  name?: string | null
  email?: string | null
  contact_key?: string | null
  list_key?: string | null
  member_count?: number | null
  members?: ApiSuggestionMember[] | null
  address_book?: { key?: string | null; name?: string | null } | null
}

export interface ApiAutocompleteData {
  suggestions: ApiContactSuggestion[]
}

export type ContactSortField =
  | 'display_name'
  | 'last_name'
  | 'first_name'
  | 'organization'
  | 'created_at'
  | 'updated_at'

export type ListSortField = 'name' | 'created_at' | 'updated_at'

export interface BookEntriesQueryParams {
  search?: string
  page?: number
  page_size?: number
  sort_by?: ContactSortField | ListSortField
  sort_order?: 'asc' | 'desc'
}

export interface BookEntriesResponse {
  items: import('./address-books-types').VCard[]
  total: number
  page: number
  totalPages: number
}

export interface ContactCreateBody {
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  prefix?: string | null
  suffix?: string | null
  nickname?: string | null
  kind?: ContactKind | 'org'
  organization?: string | null
  department?: string | null
  job_title?: string | null
  role?: string | null
  emails?: ApiContactEmail[]
  phones?: ApiContactPhone[]
  addresses?: ApiContactAddress[]
  urls?: ApiContactUrl[]
  impp?: ApiContactImpp[]
  photos?: string[]
  categories?: string[]
  birthday?: string | null
  anniversary?: string | null
  geo?: string | null
  note?: string | null
  public_key?: string | null
  sound?: string | null
  timezone?: string | null
  extra_properties?: Record<string, string>
}

export type ContactPatchBody = Partial<ContactCreateBody>

export interface ListCreateBody {
  name: string
  description?: string | null
  members?: string[]
}

export type ListPatchBody = Partial<ListCreateBody>

export interface ContactSuggestion {
  type: 'contact' | 'list'
  name?: string
  email?: string
  contactKey?: string
  listKey?: string
  memberCount?: number
  members?: ApiSuggestionMember[]
  addressBookKey?: string
  addressBookName?: string
}
