import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import {
  createDraft,
  selectAllDrafts,
  selectOpenDraftIds,
  setActiveDraft,
} from '@/features/mails/store'
import { useLazyGetEditMessageQuery } from '@/features/mails/store/mails-api'
import { apiDataToMailComposeDraft } from '@/features/mails/utils/mail-compose-from-api'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import {
  Archive,
  Flame,
  Inbox,
  Calendar,
  ChevronsUp,
  Forward,
  Mail,
  MailOpen,
  Paperclip,
  Reply,
  Star,
  Trash2,
  User,
} from 'lucide-react'
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
  onSpam?: (id: string) => void
  onMoveToInbox?: (id: string) => void
}

const ListItemDesktop: React.FC<ListItemDesktopProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
  onToggleRead,
  onDelete,
  onArchive,
  onSpam,
  onMoveToInbox,
}) => {
  const t = useTranslations('MAILS_LIST')
  const tBar = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const { push } = useRouter()
  const { account, folder } = useParams()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const { id, from, to, flagged, hasAttachment } = data
  const isSelectedClass = isSelected ? 'bg-primary/20' : ''
  const showHighPriority = data.priority <= 2
  const showSnippet = data.snippet.trim().length > 0
  const hasEventType = data.mailType.includes('event')
  const hasContactType = data.mailType.includes('contact')
  const isDraftsFolder = folderString.toLocaleLowerCase() === 'drafts'
  const recipient = to[0]
  const displayName = isDraftsFolder
    ? recipient?.name || recipient?.email || ''
    : from.name || from.email
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const allDrafts = useAppSelector(selectAllDrafts)

  const [triggerGetEditMessage] = useLazyGetEditMessageQuery()

  return (
    <>
      <div
        className={cn(
          'group hover:bg-secondary flex min-h-10 cursor-pointer flex-row items-center gap-2 p-2 transition-colors duration-75',
          isSelectedClass,
          data.seen ? '' : 'bg-primary/15 font-semibold',
          data.deleted && 'opacity-60'
        )}
        onClick={async () => {
          if (isDraftsFolder) {
            const existingDraftId = openDraftIds.find(
              (draftId) => allDrafts[draftId]?.mailKey === id
            )
            if (existingDraftId) {
              dispatch(setActiveDraft(existingDraftId))
              return
            }

            const result = await triggerGetEditMessage({
              folder: folderString,
              mailId: id,
              accountId: accountString,
            })
            const draftId =
              typeof crypto !== 'undefined' &&
              typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
            dispatch(
              createDraft({
                draftId,
                initialData: apiDataToMailComposeDraft(draftId, {
                  ...result.data,
                }),
              })
            )
          } else {
            push(
              `/u/${accountString}/${encodeURIComponent(folderString)}/${id}`
            )
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
          {displayName}
        </div>

        <div className="flex w-3/5 min-w-0 flex-col gap-0.5">
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

          {onMoveToInbox ? (
            <TooltipWrapper content={tBar('move_to_inbox.string')} side="top">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveToInbox(data.id)
                }}
                className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
              >
                <Inbox size={16} />
              </button>
            </TooltipWrapper>
          ) : null}
          {onSpam ? (
            <TooltipWrapper content={tBar('report_spam.string')} side="top">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSpam(data.id)
                }}
                className="hover:bg-background cursor-pointer rounded p-1 transition-colors"
              >
                <Flame size={16} />
              </button>
            </TooltipWrapper>
          ) : null}
        </div>
      </div>
      <Separator className="m-0" />
    </>
  )
}

export default memo(ListItemDesktop)
