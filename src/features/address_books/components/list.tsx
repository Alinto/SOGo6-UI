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
    <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 p-4 rounded">
      <div className="flex flex-row items-center justify-between text-gray-500">
        <span>
          {t('list.contacts_number.string', { number: items.length })}
        </span>
        <div className="flex flex-row items-center">
          <ListFilter />
          <span className="ml-2 text-gray-400">
            {t('list.filters.name.string')}
          </span>
        </div>
      </div>
      <ul className="mt-4">
        {items.length === 0 && (
          <li className="mt-3 h-14 text-gray-600 rounded-full bg-secondary text-center flex items-center justify-center">
            {t('list.no_items.string')}
          </li>
        )}
        {items.length > 0 &&
          items.map((item) => (
            <li key={item.id}>
              <ListItem
                data={item}
                onHandleCheckboxClick={handleCheckboxClick}
                isSelected={selectedItems.includes(item)}
              />
            </li>
          ))}
      </ul>
    </div>
  )
}

export default AddressBookList
