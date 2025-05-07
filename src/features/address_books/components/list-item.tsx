import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from '@/lib/i18n/navigation'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { VCard } from '../address-books-types'

interface ListItemProps {
  data: VCard
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: VCard) => void
}

const ListItem: React.FC<ListItemProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
}) => {
  const { push } = useRouter()
  const { book_id } = useParams()
  const { firstName, lastName, id } = data
  const [isHovered, setIsHovered] = useState(false)
  const isSelectedClass = isSelected ? 'bg-primary/20 rounded-full' : ''

  return (
    <div
      className={`flex flex-row items-center my-1 gap-2 p-2 hover:rounded-full hover:bg-primary/50 ${
        isSelectedClass
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        push(`/address_books/${book_id}/${id}`)
      }}
    >
      {(isHovered || isSelected) && (
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
          <Checkbox
            className="shrink-0 bg-white cursor-pointer"
            checked={isSelected}
            onClick={(e) => {
              onHandleCheckboxClick(e, data)
            }}
          />
        </span>
      )}
      <Avatar className={!isHovered && !isSelected ? '' : 'hidden'}>
        <AvatarImage src="/images/account-avatar.svg" />
        <AvatarFallback>
          {firstName[0].toUpperCase()}
          {lastName[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {firstName} {lastName}
      </div>
    </div>
  )
}

export default ListItem
