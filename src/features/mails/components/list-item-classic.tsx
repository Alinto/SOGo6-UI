import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  ChevronsUp,
  Forward,
  Mail,
  MailOpen,
  Paperclip,
  Reply,
  Star,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { ImapMessagesList } from '../mails-types'
import { formatDate } from './list-item-utils'

interface ListItemClassicProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
  onToggleRead?: (id: string) => void
}

const ListItemClassic: React.FC<ListItemClassicProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
  onToggleRead,
}) => {
  const t = useTranslations('MAILS_LIST')
  const tMinutesAgo = (count: number) =>
    t('time.minutes_ago.string', { count })
  const { push } = useRouter()
  const { account, folder } = useParams()
  const pathname = usePathname()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const { id, from, flagged, hasAttachment } = data
  const [isHovered, setIsHovered] = useState(false)
  const showHighPriority = data.priority <= 2
  const showSnippet = data.snippet.trim().length > 0
  const hasEventType = data.mailType.includes('event')
  const hasContactType = data.mailType.includes('contact')

  // Highlight when this mail is open in the right panel
  const isOpenInPanel = decodeURIComponent(pathname).endsWith(`/${id}`)
  const isSelectedClass = isSelected
    ? 'bg-primary/20'
    : isOpenInPanel
      ? 'bg-secondary'
      : ''

  return (
    <>
      <div
        className={cn(
          'group hover:bg-secondary flex min-h-14 cursor-pointer flex-row items-center gap-2 p-2 transition-colors duration-75',
          isSelectedClass,
          data.seen ? '' : 'bg-primary/15 font-semibold',
          data.deleted && 'opacity-60'
        )}
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
          <AvatarFallback>
            {(from.name?.[0] ?? from.email?.[0] ?? '?').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Star
            fill={flagged ? 'yellow' : 'white'}
            className="h-4 w-4 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
            strokeWidth={1}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex w-full items-center justify-between gap-2">
            <span
              className={`text-md min-w-0 truncate ${data.seen ? '' : 'font-semibold'}`}
            >
              {from.name || from.email}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {onToggleRead && (
                <div className="hidden group-hover:flex">
                  <TooltipWrapper
                    content={
                      data.seen
                        ? t('actions.mark_as_unread.string')
                        : t('actions.mark_as_read.string')
                    }
                    side="top"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleRead(data.id)
                      }}
                      className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
                    >
                      {data.seen ? <MailOpen size={16} /> : <Mail size={16} />}
                    </button>
                  </TooltipWrapper>
                </div>
              )}
              <span className="text-muted-foreground shrink-0 text-sm whitespace-nowrap">
                {formatDate(data.date, undefined, tMinutesAgo)}
              </span>
            </div>
          </div>
          <div className="flex w-full min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div
                className={`flex min-w-0 items-center gap-1 ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
              >
                {showHighPriority && (
                  <ChevronsUp
                    className="h-4 w-4 shrink-0 text-orange-600"
                    aria-hidden
                  />
                )}
                {hasEventType && (
                  <Calendar
                    className="text-muted-foreground h-4 w-4 shrink-0"
                    aria-hidden
                  />
                )}
                {hasContactType && (
                  <User
                    className="text-muted-foreground h-4 w-4 shrink-0"
                    aria-hidden
                  />
                )}
                {data.answered && (
                  <Reply
                    className="text-muted-foreground h-4 w-4 shrink-0"
                    aria-hidden
                  />
                )}
                {data.forwarded && (
                  <Forward
                    className="text-muted-foreground h-4 w-4 shrink-0"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    data.deleted && 'line-through'
                  )}
                >
                  {data.subject}
                </span>
              </div>
              {showSnippet && (
                <p className="text-muted-foreground truncate text-sm">
                  {data.snippet}
                </p>
              )}
            </div>
            {hasAttachment && (
              <Paperclip className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            )}
          </div>
        </div>
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default ListItemClassic
