import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Paperclip, Star } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { memo, useState } from 'react'
import { ImapMessagesList } from '../mails-types'
import { formatDate } from './list-item-utils'

interface ListItemDesktopProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
}

const ListItemDesktop: React.FC<ListItemDesktopProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
}) => {
  const { push } = useRouter()
  const pathname = usePathname()
  const { mail_id } = useParams()
  const { id, from, flagged, hasAttachment } = data
  const [isHovered, setIsHovered] = useState(false)
  const isSelectedClass = isSelected ? 'bg-primary/20' : ''

  return (
    <>
      <div
        className={`hover:bg-secondary flex cursor-pointer flex-row items-center gap-2 p-2 transition-colors duration-75 ${
          isSelectedClass
        } ${data.seen ? '' : 'bg-primary/15 font-semibold'} `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (mail_id) {
            const newPath = `${pathname}/${id}`
            push(newPath)
          } else {
            push(`${pathname}/${id}`)
          }
        }}
      >
        {(isHovered || isSelected) && (
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
            <Checkbox
              className="shrink-0 cursor-pointer bg-white"
              checked={isSelected}
              onClick={(e) => {
                onHandleCheckboxClick(e, data)
              }}
            />
          </span>
        )}
        <Avatar className={!isHovered && !isSelected ? 'h-6 w-6' : 'hidden'}>
          <AvatarImage src="/images/account-avatar.svg" />
          <AvatarFallback>
            {from.name.length
              ? from.name[0].toUpperCase()
              : from.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Star
            fill={flagged ? 'yellow' : 'white'}
            className="h-4 w-4 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
            strokeWidth={1}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
        </div>
        <div
          className={`text-md w-1/5 truncate ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
        >
          {from.name || from.email}
        </div>
        <span
          className={`w-3/5 ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
        >
          {data.subject}
        </span>
        <span className="text-muted-foreground w-1/5 text-right">
          {hasAttachment && <Paperclip className="mr-2 inline h-4 w-4" />}
          {formatDate(data.date)}
        </span>
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default memo(ListItemDesktop)
