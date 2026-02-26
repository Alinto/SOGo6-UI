import Draggable from '@/components/dnd/draggable'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Archive, Flame, Mail, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useMemo } from 'react'
import { ImapMessagesList } from '../mails-types'
import MailActionsBar from './mail/mail-action-bar'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import ListFilter from './list/list-filter'
import ListFilterDropdown from './list/list-filter-dropdown'
import ListPagination from './list/list-pagination'
import ListSort from './list/list-sort'
import AddressBookListSkeleton from './skeletons/skeleton'
import { nameSelector } from './utils'

interface MessagesListProps {
  items: ImapMessagesList[]
  total: number | undefined
  page: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  isLoading: boolean
  type?: 'classic' | 'modern'
}

const MessagesList: React.FC<MessagesListProps> = ({
  items,
  total,
  totalPages,
  hasNextPage = false,
  hasPreviousPage = false,
  page,
  isLoading,
  type,
}) => {
  const tMailsCommons = useTranslations('MAILS_COMMONS')
  const t = useTranslations('MAILS_LIST')
  const isMobile = useIsMobile()
  const [selectedItems, setSelectedItems] = React.useState<ImapMessagesList[]>(
    []
  )
  const { folder } = useParams()
  const folderTranslation = useMemo(() => {
    return nameSelector(folder as string)
  }, [folder])
  const handleCheckboxClick = (e: React.MouseEvent, item: ImapMessagesList) => {
    e.stopPropagation() // Prevent triggering the parent click event
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }
  if (isLoading) {
    return <AddressBookListSkeleton />
  }
  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex min-h-0 w-full flex-col rounded">
      <div className="text-foreground flex flex-row items-center justify-between">
        <div className="ml-2.5 flex flex-row items-center gap-4">
          <Checkbox
            checked={
              items.length > 0 && selectedItems.length === items.length
                ? true
                : selectedItems.length > 0
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(checked) => {
              setSelectedItems(checked ? [...items] : [])
            }}
          />
          {selectedItems.length > 0 ? (
            <MailActionsBar
              actions={[
                { id: 'bulk-delete', title: 'Delete', icon: <Trash2 size={16} /> },
                { id: 'bulk-archive', title: 'Archive', icon: <Archive size={16} /> },
                { id: 'bulk-mark-read', title: 'Mark as read', icon: <Mail size={16} /> },
                { id: 'bulk-spam', title: 'Mark as spam', icon: <Flame size={16} /> },
                { id: 'bulk-label', title: 'Label', icon: <Tag size={16} /> },
              ]}
              onAction={(idx) => {
                const ids = selectedItems.map((item) => item.id)
                switch (idx) {
                  case 0: console.log('TODO bulk delete', ids); break
                  case 1: console.log('TODO bulk archive', ids); break
                  case 2: console.log('TODO bulk mark as read', ids); break
                  case 3: console.log('TODO bulk spam', ids); break
                  case 4: console.log('TODO bulk label', ids); break
                }
              }}
            />
          ) : (
            <>
          <span className="text-lg font-semibold">
            {tMailsCommons(folderTranslation as string)}
          </span>
          <span className="text-muted-foreground hidden text-sm md:inline-block">
            {t('messages_number.string', { number: total ?? 0 })}
          </span>
            </>
          )}
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="hidden lg:flex">
            <ListFilter />
          </div>
          <div className="lg:hidden">
            <ListFilterDropdown />
          </div>
          {!isMobile && <ListSort />}
          <ListPagination
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            currentPage={page ?? 1}
            totalPages={totalPages ?? 1}
          />
        </div>
      </div>
      <ul className={cn('mt-2 rounded', isMobile && 'pb-12')}>
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
