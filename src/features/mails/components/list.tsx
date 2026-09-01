import { TooltipProvider } from '@/components/ui/tooltip'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useOpenMailFromList } from '@/features/offline/hooks/use-open-mail-from-list'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect } from 'react'
import { useMailItemActions } from '../hooks/use-mail-item-actions'
import type { ImapMessagesList } from '../mails-types'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import MailListDraggable from './mail-list-draggable'
import AddressBookListSkeleton from './skeletons/skeleton'

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
  isFetching?: boolean
  type?: 'classic' | 'modern'
  hideToolbar?: boolean
}

const MessagesList: React.FC<MessagesListProps> = ({
  items,
  isLoading,
  isFetching = false,
  type,
  hideToolbar = false,
}) => {
  const t = useTranslations('MAILS_LIST')
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
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
    return <AddressBookListSkeleton />
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded">
        {!hideToolbar && (
          <div className="text-foreground flex min-w-0 shrink-0 flex-row flex-wrap items-center justify-between gap-y-1">
            <span className="text-muted-foreground hidden text-sm md:inline-block" />
          </div>
        )}
        <ul
          className={cn(
            'min-h-0 flex-1 overflow-y-auto rounded transition-opacity',
            isMobile && 'pb-12',
            isFetching && 'opacity-60'
          )}
        >
          {items.length === 0 && (
            <li className="text-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
              {t('no_items.string')}
            </li>
          )}
          {items.length > 0 &&
            items.map((item) => {
              const listItemComponent =
                type === 'classic' ? (
                  <ListItemClassic
                    data={item}
                    onHandleCheckboxClick={handleCheckboxClick}
                    isSelected={selectedIds.includes(String(item.id))}
                    onToggleRead={handleToggleRead}
                    onToggleFlag={handleToggleFlag}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onSpam={isJunk ? undefined : handleSpam}
                    onMoveToInbox={isJunk ? handleMoveToInbox : undefined}
                    onOpenMail={openMail}
                  />
                ) : (
                  <ListItem
                    data={item}
                    onHandleCheckboxClick={handleCheckboxClick}
                    isSelected={selectedIds.includes(String(item.id))}
                    onToggleRead={handleToggleRead}
                    onToggleFlag={handleToggleFlag}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onSpam={isJunk ? undefined : handleSpam}
                    onMoveToInbox={isJunk ? handleMoveToInbox : undefined}
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
    </TooltipProvider>
  )
}

export default MessagesList
