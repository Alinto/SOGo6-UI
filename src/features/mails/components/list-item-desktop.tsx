import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Archive, Mail, MailOpen, Paperclip, Star, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { memo } from 'react'
import { ImapMessagesList } from '../mails-types'
import { formatDate } from './list-item-utils'

interface ListItemDesktopProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
  onToggleRead?: (id: string) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
}

const ListItemDesktop: React.FC<ListItemDesktopProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
  onToggleRead,
  onDelete,
  onArchive,
}) => {
  const t = useTranslations('MAILS_LIST')
  const { push } = useRouter()
  const pathname = usePathname()
  const { mail_id } = useParams()
  const { id, from, flagged, hasAttachment } = data
  const isSelectedClass = isSelected ? 'bg-primary/20' : ''

  return (
    <>
      <div
        className={`group hover:bg-secondary flex min-h-10 cursor-pointer flex-row items-center gap-2 p-2 transition-colors duration-75 ${isSelectedClass} ${data.seen ? '' : 'bg-primary/15 font-semibold'}`}
        onClick={() => {
          if (mail_id) {
            const newPath = `${pathname}/${id}`
            push(newPath)
          } else {
            push(`${pathname}/${id}`)
          }
        }}
      >
        <span
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden ${
            isSelected ? 'flex' : 'hidden group-hover:flex'
          }`}
        >
          <Checkbox
            className="shrink-0 cursor-pointer bg-white"
            checked={isSelected}
            onClick={(e) => onHandleCheckboxClick(e, data)}
          />
        </span>

        <Avatar
          className={`h-6 w-6 group-hover:hidden ${isSelected ? 'hidden' : ''}`}
        >
          <AvatarImage src="/images/account-avatar.svg" />
          <AvatarFallback>
            {(from.name?.[0] ?? from.email?.[0] ?? '?').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <Star
            fill={flagged ? 'yellow' : 'white'}
            className="h-4 w-4 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
            strokeWidth={1}
            onClick={(e) => e.stopPropagation()}
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

        <span className="text-muted-foreground w-1/5 text-right group-hover:hidden">
          {hasAttachment && <Paperclip className="mr-2 inline h-4 w-4" />}
          {formatDate(data.date)}
        </span>

        <div className="hidden w-1/5 items-center justify-end gap-1 group-hover:flex">
          <TooltipWrapper
            content={
              data.seen
                ? t('actions.mark_as_unread.string')
                : t('actions.mark_as_read.string')
            }
            side="top"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleRead?.(data.id)
              }}
              className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
            >
              {data.seen ? <MailOpen size={16} /> : <Mail size={16} />}
            </button>
          </TooltipWrapper>

          <TooltipWrapper content={t('actions.delete.string')} side="top">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(data.id)
              }}
              className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </TooltipWrapper>

          <TooltipWrapper content={t('actions.archive.string')} side="top">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onArchive?.(data.id)
              }}
              className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
            >
              <Archive size={16} />
            </button>
          </TooltipWrapper>
        </div>
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default memo(ListItemDesktop)
