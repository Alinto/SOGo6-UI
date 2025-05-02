import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
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
  const { firstName, lastName } = data
  const [isHovered, setIsHovered] = useState(false)
  const isSelectedClass = isSelected ? 'bg-primary/20 rounded-full' : ''

  return (
    <div
      className={`flex flex-row items-center my-1 gap-2 p-2 hover:rounded-full hover:bg-primary/50 cursor-pointer ${
        isSelectedClass
      }`}
      onMouseEnter={() => setIsHovered(true)} // Show checkbox on hover
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        console.log('Item clicked:', data)
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
      {!isHovered && !isSelected && (
        <Avatar>
          <AvatarImage src="/images/account-avatar.svg" />
          <AvatarFallback>
            {firstName[0].toUpperCase()}
            {lastName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        {firstName} {lastName}
      </div>
    </div>
  )
}

export default ListItem
