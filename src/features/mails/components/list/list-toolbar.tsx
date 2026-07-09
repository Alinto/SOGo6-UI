'use client'

import { Checkbox } from '@/components/ui/checkbox'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import ListFilter from '@/features/mails/components/list/list-filter'
import ListFilterDropdown from '@/features/mails/components/list/list-filter-dropdown'
import ListPagination from '@/features/mails/components/list/list-pagination'
import ListSort from '@/features/mails/components/list/list-sort'
import MailDetailNavigation from '@/features/mails/components/mail/mail-detail-navigation'
import { useListToolbarMode } from '@/features/mails/hooks/use-list-toolbar-mode'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useMailItemActions } from '@/features/mails/hooks/use-mail-item-actions'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import {
  folderPathFromParams,
  getFolderDisplayName,
} from '@/features/mails/utils/folder-path-from-params'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Archive, Flame, Inbox, Mail, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

const ListToolbar: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const tCommons = useTranslations('MAILS_COMMONS')
  const isMobile = useIsMobile()
  const toolbarMode = useListToolbarMode()
  const dispatch = useAppDispatch()
  const { folder, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const clientFilterActive = activeFilter !== 'all'

  const { data, currentPage } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

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

  const folderTitle = useMemo(
    () => getFolderDisplayName(folderPath, tCommons),
    [folderPath, tCommons]
  )

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      dispatch(setSelectedMails(allIds))
    } else {
      dispatch(clearSelectedMails())
    }
  }

  const tActions = useTranslations('MAILS_LIST.actions')
  const tBar = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const { deleteMail, archiveMail, toggleRead, markSpam, markHam, isJunk } =
    useMailItemActions({
      accountId: accountString,
      folder: folderPath,
    })

  const handleBulkAction = useCallback(
    async (idx: number) => {
      const mailsById = new Map(
        filteredMails.map((m) => [String(m.id), m])
      )
      for (const id of selectedIds) {
        const item = mailsById.get(id)
        switch (idx) {
          case 0:
            await deleteMail(id)
            break
          case 1:
            await archiveMail(id)
            break
          case 2:
            if (item && !item.seen) {
              await toggleRead(id, false)
            }
            break
          case 3:
            if (isJunk) {
              await markHam(id)
            } else {
              await markSpam(id)
            }
            break
          case 4:
            break
          default:
            break
        }
      }
      dispatch(clearSelectedMails())
    },
    [
      filteredMails,
      selectedIds,
      deleteMail,
      archiveMail,
      toggleRead,
      markSpam,
      markHam,
      isJunk,
      dispatch,
    ]
  )

  if (toolbarMode === 'hidden') {
    return null
  }

  if (toolbarMode === 'detail-navigation') {
    return (
      <div className="bg-background border-border flex w-full min-w-0 shrink-0 flex-col gap-1 overflow-x-hidden border-b px-3 py-2">
        <div className="flex min-w-0 flex-row items-center justify-end">
          <MailDetailNavigation showPosition />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border-border flex w-full min-w-0 shrink-0 flex-col gap-1 overflow-x-hidden border-b px-3 py-2">
      <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-y-1">
        <div className="flex min-w-0 flex-row items-center gap-4">
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={handleSelectAll}
          />
          {selectedIds.length > 0 ? (
            <MailActionsBar
              actions={[
                {
                  id: 'bulk-delete',
                  title: tActions('delete.string'),
                  icon: <Trash2 size={16} />,
                },
                {
                  id: 'bulk-archive',
                  title: tActions('archive.string'),
                  icon: <Archive size={16} />,
                },
                {
                  id: 'bulk-mark-read',
                  title: tActions('mark_as_read.string'),
                  icon: <Mail size={16} />,
                },
                {
                  id: 'bulk-spam',
                  title: isJunk
                    ? tBar('move_to_inbox.string')
                    : tBar('report_spam.string'),
                  icon: isJunk ? <Inbox size={16} /> : <Flame size={16} />,
                },
                {
                  id: 'bulk-label',
                  title: tBar('label.string'),
                  icon: <Tag size={16} />,
                  disabled: true,
                },
              ]}
              onAction={(idx) => {
                void handleBulkAction(idx)
              }}
            />
          ) : (
            <>
              <span className="text-lg font-semibold">{folderTitle}</span>
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
