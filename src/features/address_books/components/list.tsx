import Draggable from '@/components/dnd/draggable'
import { Button } from '@/components/ui/button'
import { ListFilter, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const params = useParams()
  const contact_id = params?.contact_id as string | undefined
  const [selectedItems, setSelectedItems] = React.useState<VCard[]>([])

  const handleCheckboxClick = (e: React.MouseEvent, item: VCard) => {
    e.stopPropagation()
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const handleDeselectAll = () => {
    setSelectedItems([])
  }

  const hasSelections = selectedItems.length > 0
  const showCheckboxes = hasSelections

  if (isLoading) {
    return <AddressBookListSkeleton />
  }

  return (
    <div className="flex w-full flex-col rounded p-4">
      <div className="text-muted-foreground flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {hasSelections ? (
            <>
              <span className="text-sm font-medium">
                {t('selected_count.string', {
                  number: selectedItems.length,
                })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDeselectAll}
                aria-label={t('deselect_all.string')}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <span className="text-sm">
              {t('contacts_number.string', {
                number: items.length,
              })}
            </span>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <ListFilter className="h-4 w-4" />
          <span className="text-muted-foreground text-xs">
            {t('filters.name.string')}
          </span>
        </div>
      </div>
      <ul className="mt-4">
        {items.length === 0 && (
          <li className="text-muted-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
            {t('no_items.string')}
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
                  isActive={contact_id === item.id}
                  showCheckbox={showCheckboxes}
                />
              </Draggable>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default AddressBookList
