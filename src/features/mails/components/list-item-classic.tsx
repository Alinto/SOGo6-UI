import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import MailListItemCheckbox from '@/features/mails/components/mail-list-item-checkbox'
import MailFolderLabel from '@/features/mails/components/mail/mail-folder-label'
import MailListLabels from '@/features/mails/components/mail/mail-list-labels'
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useMailFolderLabel } from '@/features/mails/hooks/use-mail-folder-label'
import {
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_NORMAL,
} from '@/features/mails/store/mail-compose-slice'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { getListDisplayContact } from '@/features/mails/utils/folder-type-helpers'
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
  Trash2,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'
import { ImapMessagesList } from '../mails-types'
import { formatDate } from './list-item-utils'
import {
  MailFlagButton,
  MailRowAnchor,
  MailRowStatus,
  useMailRowLink,
} from './mail-row-link'

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
  onOpenMail?: (id: string, folder: string) => void | Promise<void>
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
  const { account, folder } = useParams()
  const pathname = usePathname()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = folderPathFromParams(
    folder as string | string[] | undefined
  )
  // Search results can span multiple folders; data.folder carries the mail's
  // actual folder in that case, falling back to the route folder otherwise.
  const mailFolderPath = data.folder ?? folderString
  const { folderType } = useCurrentFolder(mailFolderPath, accountString)
  const folderLabel = useMailFolderLabel(data, mailFolderPath, folderType)
  const { id, from, flagged, hasAttachment } = data
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
  const { href, onClick } = useMailRowLink({
    folderType,
    mailFolderPath,
    accountId: accountString,
    mailId: id,
    onOpenMail,
  })

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
          data.seen ? '' : 'font-semibold',
          data.deleted && 'opacity-60'
        )}
      >
        <MailRowAnchor
          href={href}
          onClick={onClick}
          className="order-3 flex min-w-0 flex-1 flex-col justify-center gap-0.5"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <span
                className={`text-md min-w-0 truncate ${data.seen ? '' : 'font-semibold'}`}
              >
                {displayName}
              </span>
              {folderLabel && (
                <MailFolderLabel name={folderLabel} type={folderType} />
              )}
            </div>
            <span
              className={cn(
                'text-muted-foreground shrink-0 text-sm whitespace-nowrap',
                hasHoverActions &&
                  'group-focus-within:hidden group-hover:hidden'
              )}
            >
              {formatDate(data.date, undefined, tMinutesAgo)}
            </span>
          </div>
          <div className="flex w-full min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div
                className={`flex min-w-0 items-center gap-1 ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
              >
                {showHighPriority && (
                  <TooltipWrapper content={priorityTitle} side="top">
                    <ChevronsUp
                      className="text-warning h-4 w-4 shrink-0"
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
                <MailRowStatus
                  seen={data.seen}
                  hasAttachment={hasAttachment}
                  priority={
                    showHighPriority
                      ? data.priority === MAIL_PRIORITY_HIGHEST
                        ? 'highest'
                        : 'high'
                      : null
                  }
                  hasEvent={hasEventType}
                  hasContact={hasContactType}
                  answered={data.answered}
                  forwarded={data.forwarded}
                />
                <MailListLabels flags={data.flags} />
              </div>
              {showSnippet && (
                <span className="text-muted-foreground block truncate text-sm">
                  {data.snippet}
                </span>
              )}
            </div>
            {hasAttachment && (
              <Paperclip
                className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              />
            )}
          </div>
        </MailRowAnchor>

        <MailListItemCheckbox
          isSelected={isSelected}
          data={data}
          onHandleCheckboxClick={onHandleCheckboxClick}
          wrapperClassName={
            isSelected
              ? 'order-1 flex'
              : 'order-1 hidden group-hover:flex group-focus-within:flex'
          }
        />
        <span
          className={cn(
            'order-1 flex h-8 w-8 shrink-0 items-center justify-center',
            isSelected
              ? 'hidden'
              : 'group-focus-within:hidden group-hover:hidden'
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {(from.name?.[0] ?? from.email?.[0] ?? '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </span>
        <MailFlagButton
          flagged={flagged}
          onToggle={() => onToggleFlag?.(data.id)}
        />
        {hasHoverActions ? (
          <div className="order-4 hidden items-center gap-1 group-focus-within:flex group-hover:flex">
            {onToggleRead && (
              <TooltipButton
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                tooltipSide="top"
                tooltip={
                  data.seen
                    ? t('actions.mark_as_unread.string')
                    : t('actions.mark_as_read.string')
                }
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRead(data.id)
                }}
              >
                {data.seen ? <MailOpen size={16} /> : <Mail size={16} />}
              </TooltipButton>
            )}
            {onDelete && (
              <TooltipButton
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                tooltipSide="top"
                tooltip={t('actions.delete.string')}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(data.id)
                }}
              >
                <Trash2 size={16} />
              </TooltipButton>
            )}
            {onArchive && (
              <TooltipButton
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                tooltipSide="top"
                tooltip={t('actions.archive.string')}
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(data.id)
                }}
              >
                <Archive size={16} />
              </TooltipButton>
            )}
            {onMoveToInbox && (
              <TooltipButton
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                tooltipSide="top"
                tooltip={tBar('report_not_spam.string')}
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveToInbox(data.id)
                }}
              >
                <Inbox size={16} />
              </TooltipButton>
            )}
            {onSpam && (
              <TooltipButton
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                tooltipSide="top"
                tooltip={tBar('report_spam.string')}
                onClick={(e) => {
                  e.stopPropagation()
                  onSpam(data.id)
                }}
              >
                <ShieldX size={16} />
              </TooltipButton>
            )}
          </div>
        ) : null}
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default ListItemClassic
