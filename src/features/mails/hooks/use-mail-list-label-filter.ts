'use client'

import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import type { MailSearchParams } from '../mails-types'
import { MAIL_LIST_LABEL_PARAM } from '../utils/client-mail-list-filter'
import { searchToLabelFilter, toMatchAll } from '../utils/quick-filter-search'
import { useActiveMailSearch } from './use-active-mail-search'
import { useMailListLabels } from './use-mail-list-labels'

const sameLabel = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/**
 * Selection of the quick label filter of the mail list: the URL labels
 * (`?label=A&label=B`) and the labels of the active `match:all` search,
 * every one of them being required.
 *
 * Checking a label adds it to the URL; during a `match:any` search, it also
 * turns the search into a `match:all` one for good, its own labels then
 * shown as checked. Unchecking a label of the search removes it from the
 * search.
 */
export function useMailListLabelFilter(): {
  labels: string[]
  toggle: (name: string, checked: boolean) => void
  /** Checks the label and goes to `path` (the current page by default),
   *  even when the label is already checked. */
  select: (name: string, path?: string) => void
  clear: () => void
} {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const urlLabels = useMailListLabels()
  const { search, replaceSearch } = useActiveMailSearch()

  const searchLabels = useMemo(
    () => (search ? searchToLabelFilter(search) : []),
    [search]
  )
  const labels = useMemo(() => {
    const merged = [...searchLabels]
    for (const label of urlLabels) {
      if (!merged.some((l) => sameLabel(l, label))) merged.push(label)
    }
    return merged
  }, [searchLabels, urlLabels])

  // Same URL handling as the other filters: keep the other parameters
  // (filter, sort…) and go back to the first page.
  const apply = (
    nextUrlLabels: string[],
    nextSearch: MailSearchParams | null,
    path = pathname
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search && nextSearch && nextSearch !== search) {
      replaceSearch(params, nextSearch)
    }
    params.delete(MAIL_LIST_LABEL_PARAM)
    nextUrlLabels.forEach((label) =>
      params.append(MAIL_LIST_LABEL_PARAM, label)
    )
    params.delete('page')
    const query = params.toString()
    push(query ? `${path}?${query}` : path)
  }

  const withSearchLabels = (next: string[]): MailSearchParams | null => {
    if (!search || next.length === searchLabels.length) return search
    const rest = { ...search }
    if (next.length > 0) rest.labels = next
    else delete rest.labels
    return rest
  }

  // Once the search is match:all, a label it already has is required: it is
  // not added to the URL (nor one already there).
  const addLabel = (name: string, path?: string) => {
    const nextSearch = search ? toMatchAll(search) : null
    const required = [
      ...urlLabels,
      ...(nextSearch ? searchToLabelFilter(nextSearch) : []),
    ]
    const nextUrlLabels = required.some((label) => sameLabel(label, name))
      ? urlLabels
      : [...urlLabels, name]
    apply(nextUrlLabels, nextSearch, path)
  }

  const toggle = (name: string, checked: boolean) => {
    if (checked) {
      if (labels.some((label) => sameLabel(label, name))) return
      addLabel(name)
    } else {
      apply(
        urlLabels.filter((label) => !sameLabel(label, name)),
        withSearchLabels(
          searchLabels.filter((label) => !sameLabel(label, name))
        )
      )
    }
  }

  const select = (name: string, path?: string) => addLabel(name, path)

  const clear = () => apply([], withSearchLabels([]))

  return { labels, toggle, select, clear }
}
