import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRouter } from '@/lib/i18n/navigation'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { memo, useState } from 'react'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { VCard } from '../address-books-types'
import { getContactDisplayName } from '../utils/contact-list'
import {
  getDistributionListMemberCount,
  isDistributionList,
} from '../utils/distribution-list'

interface ListItemProps {
  data: VCard
  isSelected: boolean
  isActive?: boolean
  showCheckbox?: boolean
  allContactsView?: boolean
  sourceBookName?: string | null
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: VCard) => void
}

function getContactPhotoSrc(data: VCard): string | undefined {
  const candidates = [data.photo, ...(data.photos ?? [])].filter(
    Boolean
  ) as string[]
  return candidates.find(
    (src) =>
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('http://') ||
      src.startsWith('https://')
  )
}

function ListItem({
  data,
  isSelected,
  isActive = false,
  showCheckbox = false,
  allContactsView = false,
  sourceBookName = null,
  onHandleCheckboxClick,
}: ListItemProps) {
  const { push } = useRouter()
  const { book_id } = useParams()
  const { firstName, lastName, id } = data
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const [isHovered, setIsHovered] = useState(false)
  const isList = isDistributionList(data)
  const displayName = getContactDisplayName(data)
  const photoSrc = getContactPhotoSrc(data)

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
    const targetBookId =
      book_id === ALL_CONTACTS_BOOK_ID
        ? (data.addressBookKey ?? book_id)
        : book_id
    const kindQuery = isList ? '?kind=group' : ''
    push(`/address_books/${targetBookId}/${id}${kindQuery}`)
  }

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleItemClick()
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onHandleCheckboxClick(e, data)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={getItemStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
      onKeyDown={handleItemKeyDown}
      aria-label={displayName}
      aria-current={isActive ? 'true' : undefined}
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
          {isList ? (
            <AvatarFallback className="bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </AvatarFallback>
          ) : (
            <>
              {photoSrc ? (
                <AvatarImage src={photoSrc} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback>
                {firstName[0]?.toUpperCase()}
                {lastName[0]?.toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      )}
      <div className="flex min-w-0 flex-1 flex-col truncate">
        <span className="truncate text-sm">{displayName}</span>
        {allContactsView && sourceBookName && (
          <span className="text-muted-foreground truncate text-xs">
            {t('source_address_book.string', { name: sourceBookName })}
          </span>
        )}
        {isList && (
          <span className="text-muted-foreground truncate text-xs">
            {t('list_member_count.string', {
              number: getDistributionListMemberCount(data),
            })}
          </span>
        )}
      </div>
    </div>
  )
}

export default memo(ListItem)
