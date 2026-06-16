'use client'

import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'
import { selectTasksUi, setSearchQuery } from '../store/tasks-ui-slice'
import { CALENDAR_TEXT_SEARCH_MAX_LENGTH } from '@/features/calendars/calendar-constants'

function TasksSearch() {
  const t = useTranslations('TASKS')
  const dispatch = useAppDispatch()
  const searchQuery = useAppSelector((state) => selectTasksUi(state).searchQuery)
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
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        data-testid="tasks-search"
        autoComplete="off"
        maxLength={CALENDAR_TEXT_SEARCH_MAX_LENGTH}
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

export default memo(TasksSearch)
