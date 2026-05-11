'use client'

import { Checkbox } from '@/components/ui/checkbox'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import ListFilter from '@/features/mails/components/list/list-filter'
import ListFilterDropdown from '@/features/mails/components/list/list-filter-dropdown'
import ListPagination from '@/features/mails/components/list/list-pagination'
import ListSort from '@/features/mails/components/list/list-sort'
import { nameSelector } from '@/features/mails/components/utils'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Archive, Flame, Mail, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useMemo } from 'react'

const ListToolbar: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const tCommons = useTranslations('MAILS_COMMONS')
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const { folder, account } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const clientFilterActive = activeFilter !== 'all'

  const { data, currentPage } = useFolderMessages({ folder: folderString, accountId: accountString })

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const displayedCount = clientFilterActive
    ? filteredMails.length
    : (data?.total ?? 0)

  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )

  const allIds = useMemo(
    () => filteredMails.map((m) => String(m.id)),
    [filteredMails]
  )

  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const folderTranslation = useMemo(
    () => nameSelector(folderString),
    [folderString]
  )

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      dispatch(setSelectedMails(allIds))
    } else {
      dispatch(clearSelectedMails())
    }
  }

  return (
    <div className="bg-background border-b border-border flex w-full shrink-0 flex-col gap-1 px-3 py-2">
      <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-y-1">
        <div className="flex flex-row items-center gap-4">
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={handleSelectAll}
          />
          {selectedIds.length > 0 ? (
            <MailActionsBar
              actions={[
                { id: 'bulk-delete', title: 'Delete', icon: <Trash2 size={16} /> },
                { id: 'bulk-archive', title: 'Archive', icon: <Archive size={16} /> },
                { id: 'bulk-mark-read', title: 'Mark as read', icon: <Mail size={16} /> },
                { id: 'bulk-spam', title: 'Mark as spam', icon: <Flame size={16} /> },
                { id: 'bulk-label', title: 'Label', icon: <Tag size={16} /> },
              ]}
              onAction={(idx) => {
                switch (idx) {
                  case 0: console.log('TODO bulk delete', selectedIds); break
                  case 1: console.log('TODO bulk archive', selectedIds); break
                  case 2: console.log('TODO bulk mark as read', selectedIds); break
                  case 3: console.log('TODO bulk spam', selectedIds); break
                  case 4: console.log('TODO bulk label', selectedIds); break
                }
              }}
            />
          ) : (
            <>
              <span className="text-lg font-semibold">
                {folderTranslation ? tCommons(folderTranslation) : folderString}
              </span>
              <span className="text-muted-foreground hidden text-sm md:inline-block">
                {t('messages_number.string', { number: displayedCount })}
              </span>
            </>
          )}
        </div>
        <div className="flex min-w-0 flex-row flex-wrap items-center gap-2">
          {isMobile ? <ListFilterDropdown /> : <ListFilter />}
          {!isMobile && <ListSort />}
          <ListPagination
            hasNextPage={currentPage < (data?.totalPages ?? 1)}
            hasPreviousPage={currentPage > 1}
            currentPage={currentPage}
            totalPages={data?.totalPages ?? 1}
          />
        </div>
      </div>
    </div>
  )
}

export default ListToolbar
