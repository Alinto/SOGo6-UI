import Draggable from '@/components/dnd/draggable'
import { ListFilter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { VCard } from '../address-books-types'
import ListItem from './list-item'
import AddressBookListSkeleton from './skeletons/skeleton'

interface AddressBookListProps {
  items: VCard[]
  isLoading: boolean
}

const AddressBookList: React.FC<AddressBookListProps> = ({
  items,
  isLoading,
}) => {
  const t = useTranslations('Address_Books')
  const [selectedItems, setSelectedItems] = React.useState<VCard[]>([])
  const handleCheckboxClick = (e: React.MouseEvent, item: VCard) => {
    e.stopPropagation() // Prevent triggering the parent click event
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }
  if (isLoading) {
    return <AddressBookListSkeleton />
  }
  return (
    <div className="flex w-full flex-col rounded p-4">
      <div className="flex flex-row items-center justify-between text-gray-500">
        <span>
          {t('list.contacts_number.string', { number: items.length })}
        </span>
        <div className="flex flex-row items-center justify-between">
          <ListFilter />
          <span className="ml-2 text-gray-400">
            {t('list.filters.name.string')}
          </span>
        </div>
      </div>
      <ul className="mt-4">
        {items.length === 0 && (
          <li className="mt-3 flex h-14 items-center justify-center rounded-full text-center text-gray-600">
            {t('list.no_items.string')}
          </li>
        )}
        {items.length > 0 &&
          items.map((item) => (
            <li key={item.id}>
              <Draggable id={item.id}>
                <ListItem
                  data={item}
                  onHandleCheckboxClick={handleCheckboxClick}
                  isSelected={selectedItems.includes(item)}
                />
              </Draggable>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default AddressBookList
