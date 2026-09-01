import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import MailListItemCheckbox from '@/features/mails/components/mail-list-item-checkbox'
import MailListLabels from '@/features/mails/components/mail/mail-list-labels'
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useOpenDraftOnClick } from '@/features/mails/hooks/use-open-draft-on-click'
import {
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_NORMAL,
} from '@/features/mails/store/mail-compose-slice'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { getListDisplayContact } from '@/features/mails/utils/folder-type-helpers'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Archive,
  Calendar,
  ChevronsUp,
  Forward,
  Inbox,
  Mail,
  MailOpen,
  Paperclip,
  Reply,
  ShieldX,
  Star,
  Trash2,
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
  onToggleFlag?: (id: string) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onSpam?: (id: string) => void
  onMoveToInbox?: (id: string) => void
  onOpenMail?: (id: string) => void | Promise<void>
}

const ListItemClassic: React.FC<ListItemClassicProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
  onToggleRead,
  onToggleFlag,
  onDelete,
  onArchive,
  onSpam,
  onMoveToInbox,
  onOpenMail,
}) => {
  const t = useTranslations('MAILS_LIST')
  const tBar = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const tMinutesAgo = (count: number) => t('time.minutes_ago.string', { count })
  const { push } = useRouter()
  const { account, folder } = useParams()
  const pathname = usePathname()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const { folderType } = useCurrentFolder(folderString, accountString)
  const { openDraftIfNeeded } = useOpenDraftOnClick()
  const { id, from, flagged, hasAttachment } = data
  const [isHovered, setIsHovered] = useState(false)
  const showHighPriority = data.priority < MAIL_PRIORITY_NORMAL
  const priorityTitle =
    data.priority === MAIL_PRIORITY_HIGHEST
      ? t('priority.highest.string')
      : t('priority.high.string')
  const showSnippet = data.snippet.trim().length > 0
  const hasEventType = data.mailType.includes('event')
  const hasContactType = data.mailType.includes('contact')
  const displayName = getListDisplayContact(data, folderType)
  const hasHoverActions = Boolean(
    onToggleRead || onDelete || onArchive || onSpam || onMoveToInbox
  )

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
        onClick={async () => {
          const openedDraft = await openDraftIfNeeded({
            folderType,
            folderPath: folderString,
            accountId: accountString,
            mailId: id,
          })
          if (openedDraft) return
          if (onOpenMail) {
            await onOpenMail(String(id))
            return
          }
          push(`/u/${accountString}/${encodeURIComponent(folderString)}/${id}`)
        }}
      >
        {(isHovered || isSelected) && (
          <MailListItemCheckbox
            isSelected={isSelected}
            data={data}
            onHandleCheckboxClick={onHandleCheckboxClick}
          />
        )}
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center',
            isHovered || isSelected ? 'hidden' : ''
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {(from.name?.[0] ?? from.email?.[0] ?? '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </span>
        <div>
          <Star
            fill={flagged ? 'yellow' : 'white'}
            className="h-4 w-4 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
            strokeWidth={1}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFlag?.(data.id)
            }}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex w-full items-center justify-between gap-2">
            <span
              className={`text-md min-w-0 truncate ${data.seen ? '' : 'font-semibold'}`}
            >
              {displayName}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {hasHoverActions && (
                <div className="hidden items-center gap-1 group-hover:flex">
                  {onToggleRead && (
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
                        {data.seen ? (
                          <MailOpen size={16} />
                        ) : (
                          <Mail size={16} />
                        )}
                      </button>
                    </TooltipWrapper>
                  )}
                  {onDelete && (
                    <TooltipWrapper
                      content={t('actions.delete.string')}
                      side="top"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(data.id)
                        }}
                        className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TooltipWrapper>
                  )}
                  {onArchive && (
                    <TooltipWrapper
                      content={t('actions.archive.string')}
                      side="top"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onArchive(data.id)
                        }}
                        className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
                      >
                        <Archive size={16} />
                      </button>
                    </TooltipWrapper>
                  )}
                  {onMoveToInbox && (
                    <TooltipWrapper
                      content={tBar('report_not_spam.string')}
                      side="top"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveToInbox(data.id)
                        }}
                        className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
                      >
                        <Inbox size={16} />
                      </button>
                    </TooltipWrapper>
                  )}
                  {onSpam && (
                    <TooltipWrapper
                      content={tBar('report_spam.string')}
                      side="top"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSpam(data.id)
                        }}
                        className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
                      >
                        <ShieldX size={16} />
                      </button>
                    </TooltipWrapper>
                  )}
                </div>
              )}
              <span
                className={cn(
                  'text-muted-foreground shrink-0 text-sm whitespace-nowrap',
                  hasHoverActions && 'group-hover:hidden'
                )}
              >
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
                  <TooltipWrapper content={priorityTitle} side="top">
                    <ChevronsUp
                      className="h-4 w-4 shrink-0 text-orange-600"
                      aria-hidden
                    />
                  </TooltipWrapper>
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
                    'min-w-0 shrink truncate',
                    data.deleted && 'line-through'
                  )}
                >
                  {data.subject}
                </span>
                <MailListLabels flags={data.flags} />
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
