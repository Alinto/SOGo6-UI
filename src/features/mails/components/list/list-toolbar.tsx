'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  downloadBlobAsFile,
  filenameFromContentDisposition,
} from '@/features/jobs'
import ListBreadcrumb from '@/features/mails/components/list/list-breadcrumb'
import ListFilter from '@/features/mails/components/list/list-filter'
import ListFilterDropdown from '@/features/mails/components/list/list-filter-dropdown'
import ListLabelFilter from '@/features/mails/components/list/list-label-filter'
import ListPagination from '@/features/mails/components/list/list-pagination'
import ListRefresh from '@/features/mails/components/list/list-refresh'
import ListSort from '@/features/mails/components/list/list-sort'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailBulkLabelPickerDialog from '@/features/mails/components/mail/mail-bulk-label-picker-dialog'
import MailBulkMoreActionsMenu from '@/features/mails/components/mail/mail-bulk-more-actions-menu'
import MailDetailNavigation from '@/features/mails/components/mail/mail-detail-navigation'
import MailMoveCopyMenu, {
  type MailMoveCopyMenuMode,
} from '@/features/mails/components/mail/mail-move-copy-menu'
import MailMoveDialog from '@/features/mails/components/mail/mail-move-dialog'
import { useFastAccess } from '@/features/mails/components/sidebars/fast-access/context'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useListToolbarMode } from '@/features/mails/hooks/use-list-toolbar-mode'
import { useMailBatchActions } from '@/features/mails/hooks/use-mail-batch-actions'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useDownloadSelectedMailsMutation } from '@/features/mails/store/mails-api'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import {
  folderPathFromParams,
  getFolderDisplayName,
} from '@/features/mails/utils/folder-path-from-params'
import { ADVANCED_SEARCH_ROUTE_SEGMENT } from '@/features/mails/utils/mail-search-form'
import { useMinWidth } from '@/hooks/use-min-width'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { Inbox, Mail, MailOpen, ShieldX, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'

/** Toolbar content width from which everything fits on one line: a 1600px
 *  window with the full left menu (1600 - 272 menu - 40 rail - 24 padding). */
const WIDE_TOOLBAR_MIN_WIDTH = 1264

const ListToolbar: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const tCommons = useTranslations('MAILS_COMMONS')
  const isMobile = useIsMobile()
  // Measured in JS (not a container query) so that the DOM order, hence the
  // keyboard order, follows the layout.
  const { ref: toolbarRef, matches: isWide } = useMinWidth<HTMLDivElement>(
    WIDE_TOOLBAR_MIN_WIDTH
  )
  const isSidePanelOpen = useFastAccess()?.isOpen ?? false
  const toolbarMode = useListToolbarMode()
  const dispatch = useAppDispatch()
  const { folder, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')

  const {
    data,
    currentPage,
    isSearchActive,
    clientLabels,
    refresh,
    isRefreshing,
  } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  // Search results can span multiple folders; map each result's id back to
  // its actual folder so bulk actions target the right one (see
  // useMailBatchActions).
  const folderById = useMemo(() => {
    if (!isSearchActive) return undefined
    const map: Record<string, string> = {}
    for (const mail of data?.mails ?? []) {
      if (mail.folder) map[String(mail.id)] = mail.folder
    }
    return map
  }, [isSearchActive, data])

  // The server filters folder lists and, during a search, the search itself
  // carries the quick filters (see useFolderMessages): only the labels it
  // cannot express are filtered here.
  const clientFilterActive = clientLabels.length > 0

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], 'all', clientLabels),
    [data, clientLabels]
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
    () =>
      folderPath === ADVANCED_SEARCH_ROUTE_SEGMENT
        ? tCommons('search.advanced.string')
        : getFolderDisplayName(folderPath, tCommons),
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
    batchMarkRead,
    batchMarkUnread,
    batchToggleSpam,
    batchMarkImportant,
    batchRemoveImportant,
    batchPhishing,
    batchIllegal,
    batchMove,
    batchCopy,
    batchApplyLabels,
    batchRemoveLabels,
    getPermissionsForIds,
    isJunk,
    isLoading: isBatchActionLoading,
  } = useMailBatchActions({
    accountId: accountString,
    folder: folderPath,
    folderById,
  })

  // A bulk action is allowed only if the rights allow it on every selected folder.
  const permissions = useMemo(
    () => getPermissionsForIds(selectedIds),
    [getPermissionsForIds, selectedIds]
  )

  const {
    hasUnreadSelected,
    hasReadSelected,
    hasNotImportantSelected,
    hasImportantSelected,
    selectedMailsFlags,
  } = useMemo(() => {
    const selectedIdSet = new Set(selectedIds)
    const selectedMails = filteredMails.filter((m) =>
      selectedIdSet.has(String(m.id))
    )
    return {
      hasUnreadSelected: selectedMails.some((m) => !m.seen),
      hasReadSelected: selectedMails.some((m) => m.seen),
      hasNotImportantSelected: selectedMails.some((m) => !m.flagged),
      hasImportantSelected: selectedMails.some((m) => m.flagged),
      selectedMailsFlags: selectedMails.map((m) => m.flags),
    }
  }, [filteredMails, selectedIds])

  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [downloadSelectedMails, { isLoading: isDownloading }] =
    useDownloadSelectedMailsMutation()
  const [createFolderMode, setCreateFolderMode] =
    useState<MailMoveCopyMenuMode | null>(null)

  const handleBulkAction = useCallback(
    async (idx: number) => {
      switch (idx) {
        case 0: {
          const selectedIdSet = new Set(selectedIds)
          const unreadIds = filteredMails
            .filter((m) => selectedIdSet.has(String(m.id)) && !m.seen)
            .map((m) => String(m.id))
          await batchMarkRead(unreadIds)
          break
        }
        case 1: {
          const selectedIdSet = new Set(selectedIds)
          const readIds = filteredMails
            .filter((m) => selectedIdSet.has(String(m.id)) && m.seen)
            .map((m) => String(m.id))
          await batchMarkUnread(readIds)
          break
        }
        case 2:
          await batchDelete(selectedIds)
          break
        case 3:
          // Splits the selection by each mail's own folder internally, so a
          // cross-folder search selection mixing junk and non-junk mails is
          // still handled correctly.
          await batchToggleSpam(selectedIds)
          break
        case 4:
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
      batchMarkRead,
      batchMarkUnread,
      batchToggleSpam,
      dispatch,
    ]
  )

  const handleBulkDownload = useCallback(async () => {
    if (selectedIds.length === 0) return
    const folders: Record<string, number[]> = {}
    for (const id of selectedIds) {
      const uid = Number(id)
      if (!Number.isInteger(uid)) continue
      const targetFolder = folderById?.[id] ?? folderPath
      ;(folders[targetFolder] ??= []).push(uid)
    }
    if (Object.keys(folders).length === 0) return
    try {
      const result = await downloadSelectedMails({
        accountId: accountString,
        folders,
      }).unwrap()
      downloadBlobAsFile(
        result.blob,
        filenameFromContentDisposition(result.contentDisposition, 'mails.zip')
      )
      dispatch(clearSelectedMails())
    } catch {
      // Keep the selection so the user can retry the download.
    }
  }, [
    accountString,
    downloadSelectedMails,
    dispatch,
    folderById,
    folderPath,
    selectedIds,
  ])

  const handleBulkMarkImportant = useCallback(async () => {
    const selectedIdSet = new Set(selectedIds)
    const notImportantIds = filteredMails
      .filter((m) => selectedIdSet.has(String(m.id)) && !m.flagged)
      .map((m) => String(m.id))
    await batchMarkImportant(notImportantIds)
    dispatch(clearSelectedMails())
  }, [filteredMails, selectedIds, batchMarkImportant, dispatch])

  const handleBulkRemoveImportant = useCallback(async () => {
    const selectedIdSet = new Set(selectedIds)
    const importantIds = filteredMails
      .filter((m) => selectedIdSet.has(String(m.id)) && m.flagged)
      .map((m) => String(m.id))
    await batchRemoveImportant(importantIds)
    dispatch(clearSelectedMails())
  }, [filteredMails, selectedIds, batchRemoveImportant, dispatch])

  const handleBulkPhishing = useCallback(async () => {
    await batchPhishing(selectedIds)
    dispatch(clearSelectedMails())
  }, [batchPhishing, selectedIds, dispatch])

  const handleBulkIllegal = useCallback(async () => {
    await batchIllegal(selectedIds)
    dispatch(clearSelectedMails())
  }, [batchIllegal, selectedIds, dispatch])

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

  const breadcrumb =
    selectedIds.length === 0 ? (
      <div
        data-testid="list-toolbar-breadcrumb"
        className={cn(
          'flex h-9 min-w-0 grow',
          isWide ? 'basis-0' : 'basis-full'
        )}
      >
        <ListBreadcrumb
          accountId={accountString}
          folderPath={folderPath}
          fallbackTitle={folderTitle}
          suffix={
            <span className="text-muted-foreground hidden text-sm leading-none md:inline">
              {t('messages_number.string', { number: displayedCount })}
            </span>
          }
        />
      </div>
    ) : null

  return (
    <div
      ref={toolbarRef}
      className="bg-background border-border @container/list-toolbar flex w-full min-w-0 shrink-0 flex-col gap-1 overflow-x-hidden border-b px-3 py-2"
    >
      {/* Layout, without selection (the DOM order follows the visual order,
          for keyboard navigation):
          - narrow toolbar (< WIDE_TOOLBAR_MIN_WIDTH): mobile (menu in a
            drawer, < 768px), tablet (menu as an icon rail, < 1024px) and
            windows up to ~1600px (full menu): the breadcrumb alone on the
            first line, with the full width; checkbox, refresh and controls on
            a second line, with compact filters (dropdown);
          - wide toolbar (large screen): everything on one line, the
            breadcrumb taking the width left between the checkbox group and
            the controls, with the filter toggle buttons.
          With a selection, the actions bar sits next to the checkbox and the
          controls wrap below when needed. */}
      <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-x-2 gap-y-1">
        {!isWide && breadcrumb}
        <div className="flex h-9 min-w-0 flex-row items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? 'indeterminate' : false
              }
              onCheckedChange={handleSelectAll}
              aria-label={
                allSelected
                  ? t('actions.deselect_all.string')
                  : t('actions.select_all.string')
              }
            />
          </span>
          <ListRefresh onRefresh={refresh} isRefreshing={isRefreshing} />
          {selectedIds.length > 0 && (
            <MailActionsBar
              compact
              actions={[
                {
                  id: 'bulk-mark-read',
                  title: tActions('mark_as_read.string'),
                  icon: <MailOpen size={16} />,
                  disabled:
                    isBatchActionLoading ||
                    !hasUnreadSelected ||
                    !permissions.canMarkRead,
                },
                {
                  id: 'bulk-mark-unread',
                  title: tActions('mark_as_unread.string'),
                  icon: <Mail size={16} />,
                  disabled:
                    isBatchActionLoading ||
                    !hasReadSelected ||
                    !permissions.canMarkRead,
                },
                {
                  id: 'bulk-delete',
                  title: tActions('delete.string'),
                  icon: <Trash2 size={16} />,
                  disabled: isBatchActionLoading || !permissions.canDelete,
                },
                {
                  // Label reflects the currently open folder; the action
                  // itself (batchToggleSpam) resolves the right direction
                  // per mail, so a mixed cross-folder selection still works.
                  id: 'bulk-spam',
                  title: isJunk
                    ? tBar('report_not_spam.string')
                    : tBar('report_spam.string'),
                  icon: isJunk ? <Inbox size={16} /> : <ShieldX size={16} />,
                  disabled: isBatchActionLoading || !permissions.canMoveOut,
                },
                {
                  id: 'bulk-label',
                  title: tBar('label.string'),
                  icon: <Tag size={16} />,
                  disabled: isBatchActionLoading || !permissions.canWriteFlags,
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
                moveDisabled={!permissions.canMoveOut}
                copyDisabled={!permissions.canCopyOut}
                onSelectDestination={handleSelectMoveCopyDestination}
                onCreateFolder={setCreateFolderMode}
              />
              <MailBulkMoreActionsMenu
                disabled={isBatchActionLoading || isDownloading}
                moveDisabled={!permissions.canMoveOut}
                showMarkImportant={
                  hasNotImportantSelected && permissions.canWriteFlags
                }
                showRemoveImportant={
                  hasImportantSelected && permissions.canWriteFlags
                }
                onMarkImportant={() => void handleBulkMarkImportant()}
                onRemoveImportant={() => void handleBulkRemoveImportant()}
                onPhishing={() => void handleBulkPhishing()}
                onIllegal={() => void handleBulkIllegal()}
                onDownload={() => void handleBulkDownload()}
                triggerClassName="h-8 w-8 rounded-r-md"
              />
            </MailActionsBar>
          )}
        </div>
        {isWide && breadcrumb}
        {/* On two lines, the controls never wrap below the checkbox (that
            would make a third line): they take the width left (basis-0), get
            more compact as the toolbar narrows (sort icon only < 560px, no
            page menu < 500px, no layout toggle < 460px when the right panel
            is open) and scroll as a last resort. The first item's auto margin
            aligns them right yet keeps an overflow scrollable (justify-end
            would hide it); the padding keeps focus rings visible. With a
            selection, they wrap below the actions bar. */}
        <div
          data-testid="list-toolbar-controls"
          className={cn(
            'flex min-w-0 flex-row items-center gap-2',
            selectedIds.length > 0
              ? 'shrink-0 flex-wrap'
              : isWide
                ? 'shrink-0 flex-nowrap'
                : '-m-0.75 grow basis-0 flex-nowrap overflow-x-auto p-0.75 [scrollbar-width:none] *:first:ml-auto'
          )}
        >
          {/* Compact filters (dropdown) on two lines, toggle buttons on one. */}
          {!isWide && <ListFilterDropdown />}
          {!isWide && <ListLabelFilter compact />}
          {!isMobile && (
            <ListFilter
              showFilters={isWide}
              layoutToggleClassName={
                isSidePanelOpen ? '@max-[460px]/list-toolbar:hidden' : undefined
              }
            />
          )}
          {!isMobile && (
            <ListSort labelClassName="@max-[560px]/list-toolbar:hidden" />
          )}
          <ListPagination
            pageMenuClassName="@max-[500px]/list-toolbar:hidden"
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
