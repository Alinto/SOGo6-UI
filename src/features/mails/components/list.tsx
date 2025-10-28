import Draggable from '@/components/dnd/draggable'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'
import { ImapMessagesList } from '../mails-types'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import ListFilter from './list/list-filter'
import ListPagination from './list/list-pagination'
import ListSort from './list/list-sort'
import AddressBookListSkeleton from './skeletons/skeleton'
import { nameSelector } from './utils'

interface MessagesListProps {
  items: ImapMessagesList[]
  total: number
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
  const t = useTranslations('MAILS_LIST')

  const { folder } = useParams()

  const [selectedItems, setSelectedItems] = React.useState<ImapMessagesList[]>(
    []
  )
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
    <div className="flex max-h-[90vh] min-h-0 w-full flex-col rounded">
      <div className="text-foreground flex flex-row items-center justify-between">
        <div className="ml-2.5 flex flex-row items-center gap-4">
          <Checkbox />
          <span className="text-lg font-semibold">
            {t(
              nameSelector(folder as string) ??
                decodeURIComponent(folder as string)
            )}
          </span>
          <span className="">
            {t('messages_number.string', { number: total })}
          </span>
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <ListFilter />
          <ListSort />
          <ListPagination
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            currentPage={page ?? 1}
            totalPages={totalPages ?? 1}
          />
        </div>
      </div>
      <ul className="scrollbar-thin-gray mt-2 overflow-y-auto rounded">
        {items.length === 0 && (
          <li className="text-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
            {t('no_items.string')}
          </li>
        )}
        {items.length > 0 &&
          items.map((item) => (
            <li key={item.id}>
              <Draggable id={item.id}>
                {type === 'classic' ? (
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
                  />
                )}
              </Draggable>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default MessagesList
