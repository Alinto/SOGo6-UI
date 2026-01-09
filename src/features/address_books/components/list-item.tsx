import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { VCard } from '../address-books-types'

interface ListItemProps {
  data: VCard
  isSelected: boolean
  isActive?: boolean
  showCheckbox?: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: VCard) => void
}

const ListItem: React.FC<ListItemProps> = ({
  data,
  isSelected,
  isActive = false,
  showCheckbox = false,
  onHandleCheckboxClick,
}) => {
  const { push } = useRouter()
  const { book_id } = useParams()
  const { firstName, lastName, id } = data
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const [isHovered, setIsHovered] = useState(false)

  const shouldShowCheckbox = showCheckbox || isHovered || isSelected

  const getItemStyles = () => {
    const baseStyles =
      'my-1 flex cursor-pointer flex-row items-center gap-2 rounded-md p-2 transition-all duration-200'

    if (isActive && isSelected) {
      return `${baseStyles} bg-primary/10 border-l-4 border-primary`
    }
    if (isActive) {
      return `${baseStyles} bg-muted border-l-4 border-primary`
    }
    if (isSelected) {
      return `${baseStyles} bg-primary/10 hover:bg-primary/15`
    }
    return `${baseStyles} hover:bg-accent/50`
  }

  const handleItemClick = () => {
    push(`/address_books/${book_id}/${id}`)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onHandleCheckboxClick(e, data)
  }

  return (
    <div
      className={getItemStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
    >
      {shouldShowCheckbox && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                <Checkbox
                  className="bg-background shrink-0 cursor-pointer"
                  checked={isSelected}
                  onClick={handleCheckboxClick}
                  aria-label={
                    isSelected ? t('deselect.string') : t('select.string')
                  }
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSelected ? t('deselect.string') : t('select.string')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {!shouldShowCheckbox && (
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src="/images/account-avatar.svg" />
          <AvatarFallback>
            {firstName[0]?.toUpperCase()}
            {lastName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex min-w-0 flex-1 truncate text-sm">
        {firstName} {lastName}
      </div>
    </div>
  )
}

export default ListItem
