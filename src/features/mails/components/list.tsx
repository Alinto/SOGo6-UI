import { TooltipProvider } from '@/components/ui/tooltip'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useOpenMailFromList } from '@/features/offline/hooks/use-open-mail-from-list'
import { useDelayedFlag } from '@/hooks/use-delayed-flag'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect } from 'react'
import { useFolderPermissionsResolver } from '../hooks/use-folder-permissions'
import { useMailItemActions } from '../hooks/use-mail-item-actions'
import type { ImapMessagesList } from '../mails-types'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import ListLoadingOverlay from './list-loading-overlay'
import MailListDraggable from './mail-list-draggable'
import AddressBookListSkeleton from './skeletons/skeleton'

/** Fast reloads finish before this delay and never show the spinner. */
const LIST_LOADING_OVERLAY_DELAY_MS = 300

interface MessagesListProps {
  items: ImapMessagesList[]
  // Pagination metadata is rendered by ListToolbar (ListPagination), not here.
  // These props are kept for callers that surface pagination outside the list.
  total?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  isLoading: boolean
  /** A new page or sort is loading: spinner after a short delay. */
  isFetching?: boolean
  /** The user clicked Refresh: spinner at once. */
  isRefreshing?: boolean
  type?: 'classic' | 'modern'
  hideToolbar?: boolean
}

const MessagesList: React.FC<MessagesListProps> = ({
  items,
  isLoading,
  isFetching = false,
  isRefreshing = false,
  type,
  hideToolbar = false,
}) => {
  const t = useTranslations('MAILS_LIST')
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const isDelayedFetching = useDelayedFlag(
    isFetching,
    LIST_LOADING_OVERLAY_DELAY_MS
  )
  const showFetching = isRefreshing || isDelayedFetching
  const { folder, account } = useParams()
  const accountIdStr = (Array.isArray(account) ? account[0] : account) ?? '0'
  const folderStr = folderPathFromParams(
    folder as string | string[] | undefined
  )

  const {
    deleteMail,
    toggleRead,
    toggleFlag,
    archiveMail,
    markSpam,
    markHam,
    isJunk,
    folderType,
  } = useMailItemActions({
    accountId: accountIdStr,
    folder: folderStr,
  })

  const handleToggleRead = useCallback(
    (id: string) => {
      const item = items.find((m) => String(m.id) === String(id))
      if (!item) return
      void toggleRead(id, item.seen)
    },
    [items, toggleRead]
  )

  const handleToggleFlag = useCallback(
    (id: string) => {
      const item = items.find((m) => String(m.id) === String(id))
      if (!item) return
      void toggleFlag(id, item.flagged)
    },
    [items, toggleFlag]
  )

  const handleDelete = useCallback(
    (id: string) => {
      void deleteMail(id)
    },
    [deleteMail]
  )

  const handleArchive = useCallback(
    (id: string) => {
      void archiveMail(id)
    },
    [archiveMail]
  )

  const handleSpam = useCallback(
    (id: string) => {
      void markSpam(id)
    },
    [markSpam]
  )

  const handleMoveToInbox = useCallback(
    (id: string) => {
      void markHam(id)
    },
    [markHam]
  )

  const { openMail } = useOpenMailFromList()
  const permissionsResolver = useFolderPermissionsResolver(accountIdStr)

  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )

  // Reset selection when folder changes
  useEffect(() => {
    dispatch(clearSelectedMails())
  }, [folderStr, dispatch])

  const handleCheckboxClick = (e: React.MouseEvent, item: ImapMessagesList) => {
    e.stopPropagation()
    const id = String(item.id)
    const next = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id]
    dispatch(setSelectedMails(next))
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        <AddressBookListSkeleton />
        <ListLoadingOverlay />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded">
        {!hideToolbar && (
          <div className="text-foreground flex min-w-0 shrink-0 flex-row flex-wrap items-center justify-between gap-y-1">
            <span className="text-muted-foreground hidden text-sm md:inline-block" />
          </div>
        )}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {showFetching && <ListLoadingOverlay />}
          <ul
            className={cn(
              'min-h-0 flex-1 overflow-y-auto rounded transition-opacity',
              isMobile && 'pb-12',
              showFetching && 'opacity-60'
            )}
          >
            {items.length === 0 && (
              <li className="text-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
                {t('no_items.string')}
              </li>
            )}
            {items.length > 0 &&
              items.map((item) => {
                // Search results can span folders: each mail is judged on its own folder.
                const permissions = permissionsResolver.forFolder(
                  item.folder ?? folderStr
                )
                const onMoveOut = permissions.canMoveOut
                const actionProps = {
                  onToggleRead: permissions.canMarkRead
                    ? handleToggleRead
                    : undefined,
                  onToggleFlag: permissions.canWriteFlags
                    ? handleToggleFlag
                    : undefined,
                  onDelete: permissions.canDelete ? handleDelete : undefined,
                  onArchive: onMoveOut ? handleArchive : undefined,
                  onSpam: isJunk || !onMoveOut ? undefined : handleSpam,
                  onMoveToInbox:
                    isJunk && onMoveOut ? handleMoveToInbox : undefined,
                }
                const listItemComponent =
                  type === 'classic' ? (
                    <ListItemClassic
                      data={item}
                      onHandleCheckboxClick={handleCheckboxClick}
                      isSelected={selectedIds.includes(String(item.id))}
                      {...actionProps}
                      onOpenMail={openMail}
                    />
                  ) : (
                    <ListItem
                      data={item}
                      onHandleCheckboxClick={handleCheckboxClick}
                      isSelected={selectedIds.includes(String(item.id))}
                      {...actionProps}
                      onOpenMail={openMail}
                    />
                  )
                return (
                  <li key={item.id}>
                    {isMobile ? (
                      listItemComponent
                    ) : (
                      <MailListDraggable
                        item={item}
                        accountId={accountIdStr}
                        folder={folderStr}
                        folderType={folderType}
                        canMoveOut={onMoveOut}
                        selectedIds={selectedIds}
                      >
                        {listItemComponent}
                      </MailListDraggable>
                    )}
                  </li>
                )
              })}
          </ul>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default MessagesList
