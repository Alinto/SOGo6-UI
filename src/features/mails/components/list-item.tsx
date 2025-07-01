import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Paperclip, Star } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { ImapMessageList } from '../mails-types'

interface ListItemProps {
  data: ImapMessageList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessageList) => void
}

const ListItem: React.FC<ListItemProps> = ({
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

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const isCurrentWeek = date >= startOfWeek && date < now && !isToday

    if (diffHours < 1 && isToday) {
      return `${diffMinutes} min ago`
    } else if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (isCurrentWeek) {
      return date.toLocaleDateString([], { weekday: 'long' }) // e.g., "Monday"
    } else if (date.getFullYear() < now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <>
      <div
        className={`hover:bg-secondary flex h-11 cursor-pointer flex-row items-center gap-2 p-2 ${
          isSelectedClass
        } ${data.seen ? '' : 'bg-primary/15 font-semibold'} `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (mail_id) {
            // If mail_id is present, we are in a detail view, so we just update the URL
            const newPath = pathname.replace(/\/[^/]+$/, `/${id}`)
            push(newPath)
          } else {
            // If mail_id is not present, we are in a list view, so we navigate to the detail view
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
              e.stopPropagation() // Prevent triggering the parent click event
              // Handle star toggle logic here if needed
            }}
          />
        </div>
        <div
          className={`text-md w-1/5 truncate ${data.seen ? '' : 'font-semibold'}`}
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

export default ListItem
