import Draggable from '@/components/dnd/draggable'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { ImapMessagesList } from '../mails-types'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import AddressBookListSkeleton from './skeletons/skeleton'

interface MessagesListProps {
  items: ImapMessagesList[]
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
  const { folder } = useParams()

  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(String(item.id))),
    [items, selectedIds]
  )

  // Reset selection when folder changes
  useEffect(() => {
    dispatch(clearSelectedMails())
  }, [folder, dispatch])

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
      <div className="flex min-h-0 w-full flex-1 flex-col rounded overflow-hidden">
        {!hideToolbar && (
          <div className="text-foreground flex min-w-0 shrink-0 flex-row flex-wrap items-center justify-between gap-y-1">
            <span className="text-muted-foreground hidden text-sm md:inline-block" />
          </div>
        )}
        <ul className={cn('min-h-0 flex-1 overflow-y-auto rounded transition-opacity', isMobile && 'pb-12', isFetching && 'opacity-50 pointer-events-none')}>
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
                    isSelected={selectedItems.includes(item)}
                  />
                ) : (
                  <ListItem
                    data={item}
                    onHandleCheckboxClick={handleCheckboxClick}
                    isSelected={selectedItems.includes(item)}
                    onToggleRead={(id) => console.log('TODO toggleRead', id)}
                    onDelete={(id) => console.log('TODO delete', id)}
                    onArchive={(id) => console.log('TODO archive', id)}
                  />
                )
              return (
                <li key={item.id}>
                  {isMobile ? (
                    listItemComponent
                  ) : (
                    <Draggable id={item.id}>{listItemComponent}</Draggable>
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
