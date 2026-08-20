'use client'

import { Checkbox } from '@/components/ui/checkbox'
import ListFilter from '@/features/mails/components/list/list-filter'
import ListFilterDropdown from '@/features/mails/components/list/list-filter-dropdown'
import ListPagination from '@/features/mails/components/list/list-pagination'
import ListSort from '@/features/mails/components/list/list-sort'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailBulkLabelPickerDialog from '@/features/mails/components/mail/mail-bulk-label-picker-dialog'
import MailDetailNavigation from '@/features/mails/components/mail/mail-detail-navigation'
import MailMoveCopyMenu, {
  type MailMoveCopyMenuMode,
} from '@/features/mails/components/mail/mail-move-copy-menu'
import MailMoveDialog from '@/features/mails/components/mail/mail-move-dialog'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useListToolbarMode } from '@/features/mails/hooks/use-list-toolbar-mode'
import { useMailBatchActions } from '@/features/mails/hooks/use-mail-batch-actions'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import {
  folderPathFromParams,
  getFolderDisplayName,
} from '@/features/mails/utils/folder-path-from-params'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import {
  Archive,
  Flame,
  Inbox,
  Mail,
  MailOpen,
  Tag,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'

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
  const {
    batchDelete,
    batchArchive,
    batchMarkRead,
    batchMarkUnread,
    batchSpam,
    batchHam,
    batchMove,
    batchCopy,
    batchApplyLabels,
    batchRemoveLabels,
    isJunk,
    isLoading: isBatchActionLoading,
  } = useMailBatchActions({
    accountId: accountString,
    folder: folderPath,
  })

  const { hasUnreadSelected, hasReadSelected, selectedMailsFlags } =
    useMemo(() => {
      const selectedIdSet = new Set(selectedIds)
      const selectedMails = filteredMails.filter((m) =>
        selectedIdSet.has(String(m.id))
      )
      return {
        hasUnreadSelected: selectedMails.some((m) => !m.seen),
        hasReadSelected: selectedMails.some((m) => m.seen),
        selectedMailsFlags: selectedMails.map((m) => m.flags),
      }
    }, [filteredMails, selectedIds])

  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [createFolderMode, setCreateFolderMode] =
    useState<MailMoveCopyMenuMode | null>(null)

  const handleBulkAction = useCallback(
    async (idx: number) => {
      switch (idx) {
        case 0:
          await batchDelete(selectedIds)
          break
        case 1:
          await batchArchive(selectedIds)
          break
        case 2: {
          const selectedIdSet = new Set(selectedIds)
          const unreadIds = filteredMails
            .filter((m) => selectedIdSet.has(String(m.id)) && !m.seen)
            .map((m) => String(m.id))
          await batchMarkRead(unreadIds)
          break
        }
        case 3: {
          const selectedIdSet = new Set(selectedIds)
          const readIds = filteredMails
            .filter((m) => selectedIdSet.has(String(m.id)) && m.seen)
            .map((m) => String(m.id))
          await batchMarkUnread(readIds)
          break
        }
        case 4:
          if (isJunk) {
            await batchHam(selectedIds)
          } else {
            await batchSpam(selectedIds)
          }
          break
        case 5:
          // Bulk label: keep the selection until the picker dialog resolves.
          setLabelDialogOpen(true)
          return
        default:
          break
      }
      dispatch(clearSelectedMails())
    },
    [
      filteredMails,
      selectedIds,
      batchDelete,
      batchArchive,
      batchMarkRead,
      batchMarkUnread,
      batchSpam,
      batchHam,
      isJunk,
      dispatch,
    ]
  )

  const handleApplyBulkLabels = useCallback(
    async (labels: string[]) => {
      if (labels.length === 0) return
      await batchApplyLabels(selectedIds, labels)
      dispatch(clearSelectedMails())
    },
    [batchApplyLabels, selectedIds, dispatch]
  )

  const handleRemoveBulkLabels = useCallback(
    async (labels: string[]) => {
      if (labels.length === 0) return
      await batchRemoveLabels(selectedIds, labels)
      dispatch(clearSelectedMails())
    },
    [batchRemoveLabels, selectedIds, dispatch]
  )

  const handleSelectMoveCopyDestination = useCallback(
    (mode: MailMoveCopyMenuMode, destination: string) => {
      const run = mode === 'copy' ? batchCopy : batchMove
      void run(selectedIds, destination).then(() =>
        dispatch(clearSelectedMails())
      )
    },
    [batchCopy, batchMove, selectedIds, dispatch]
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
        <div className="flex h-8 min-w-0 flex-row items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? 'indeterminate' : false
              }
              onCheckedChange={handleSelectAll}
            />
          </span>
          {selectedIds.length > 0 ? (
            <MailActionsBar
              compact
              actions={[
                {
                  id: 'bulk-delete',
                  title: tActions('delete.string'),
                  icon: <Trash2 size={16} />,
                  disabled: isBatchActionLoading,
                },
                {
                  id: 'bulk-archive',
                  title: tActions('archive.string'),
                  icon: <Archive size={16} />,
                  disabled: isBatchActionLoading,
                },
                {
                  id: 'bulk-mark-read',
                  title: tActions('mark_as_read.string'),
                  icon: <MailOpen size={16} />,
                  disabled: isBatchActionLoading || !hasUnreadSelected,
                },
                {
                  id: 'bulk-mark-unread',
                  title: tActions('mark_as_unread.string'),
                  icon: <Mail size={16} />,
                  disabled: isBatchActionLoading || !hasReadSelected,
                },
                {
                  id: 'bulk-spam',
                  title: isJunk
                    ? tBar('report_not_spam.string')
                    : tBar('report_spam.string'),
                  icon: isJunk ? <Inbox size={16} /> : <Flame size={16} />,
                  disabled: isBatchActionLoading,
                },
                {
                  id: 'bulk-label',
                  title: tBar('label.string'),
                  icon: <Tag size={16} />,
                  disabled: isBatchActionLoading,
                },
              ]}
              onAction={(idx) => {
                void handleBulkAction(idx)
              }}
            >
              <MailMoveCopyMenu
                accountId={accountString}
                currentFolder={folderPath}
                disabled={isBatchActionLoading}
                onSelectDestination={handleSelectMoveCopyDestination}
                onCreateFolder={setCreateFolderMode}
              />
            </MailActionsBar>
          ) : (
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="text-lg leading-none font-semibold">
                {folderTitle}
              </span>
              <span className="text-muted-foreground hidden text-sm leading-none md:inline">
                {t('messages_number.string', { number: displayedCount })}
              </span>
            </div>
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

      <MailBulkLabelPickerDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        selectedMailsFlags={selectedMailsFlags}
        onApplyLabels={handleApplyBulkLabels}
        onRemoveLabels={handleRemoveBulkLabels}
        isLoading={isBatchActionLoading}
      />

      <MailMoveDialog
        open={createFolderMode != null}
        onOpenChange={(open) => {
          if (!open) setCreateFolderMode(null)
        }}
        accountId={accountString}
        currentFolder={folderPath}
        isLoading={isBatchActionLoading}
        mode={createFolderMode ?? 'move'}
        onConfirm={async (destination) => {
          const run = createFolderMode === 'copy' ? batchCopy : batchMove
          await run(selectedIds, destination)
          setCreateFolderMode(null)
          dispatch(clearSelectedMails())
        }}
      />
    </div>
  )
}

export default ListToolbar
