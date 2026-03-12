import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useRouter } from '@/lib/i18n/navigation'
import { Paperclip, Star } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { ImapMessagesList } from '../mails-types'

interface ListItemClassicProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
}

const ListItemClassic: React.FC<ListItemClassicProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
}) => {
  const { push } = useRouter()
  const { account, folder } = useParams()
  const pathname = usePathname()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const { id, from, flagged, hasAttachment } = data
  const [isHovered, setIsHovered] = useState(false)

  // Highlight when this mail is open in the right panel
  const isOpenInPanel = decodeURIComponent(pathname).endsWith(`/${id}`)
  const isSelectedClass = isSelected
    ? 'bg-primary/20'
    : isOpenInPanel
      ? 'bg-secondary'
      : ''

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
        className={`hover:bg-secondary flex h-14 cursor-pointer flex-row items-center gap-2 p-2 transition-colors duration-75 ${
          isSelectedClass
        } ${data.seen ? '' : 'bg-primary/15 font-semibold'} `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          push(`/u/${accountString}/${encodeURIComponent(folderString)}/${id}`)
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
              ? from.name[0]?.toUpperCase()
              : from.email[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Star
            fill={flagged ? 'yellow' : 'white'}
            className="h-4 w-4 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
            strokeWidth={1}
          />
        </div>
        <div className="flex w-full flex-col justify-center">
          <div className="flex w-full items-center justify-between">
            <span
              className={`text-md truncate ${data.seen ? '' : 'font-semibold'}`}
            >
              {from.name || from.email}
            </span>
            <span className="text-muted-foreground ml-2 text-sm whitespace-nowrap">
              {formatDate(data.date)}
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <span
              className={`truncate ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
            >
              {data.subject}
            </span>
            {hasAttachment && <Paperclip className="ml-2 h-4 w-4 shrink-0" />}
          </div>
        </div>
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default ListItemClassic
