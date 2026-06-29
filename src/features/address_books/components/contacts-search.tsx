'use client'

import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'
import {
  selectAddressBooksUi,
  setSearchQuery,
} from '../store/address-books-ui-slice'

function ContactsSearch() {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const dispatch = useAppDispatch()
  const searchQuery = useAppSelector(
    (state) => selectAddressBooksUi(state).searchQuery
  )
  const [searchInput, setSearchInput] = useState(searchQuery)

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(setSearchQuery(searchInput))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [dispatch, searchInput])

  return (
    <div className="relative w-full">
      <Input
        type="text"
        className="text-foreground caret-foreground placeholder:text-transparent"
        placeholder={t('search_placeholder.string')}
        aria-label={t('search_placeholder.string')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        data-testid="contacts-search"
        autoComplete="off"
      />
      {!searchInput && (
        <div className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center gap-2 px-3 text-sm">
          <SearchIcon className="size-4 shrink-0 opacity-70" aria-hidden />
          {t('search_placeholder.string')}
        </div>
      )}
    </div>
  )
}

export default memo(ContactsSearch)
