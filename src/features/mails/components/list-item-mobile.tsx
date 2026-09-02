import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { TooltipWrapper } from '@/components/ui/tooltip'
import MailListItemCheckbox from '@/features/mails/components/mail-list-item-checkbox'
import MailListLabels from '@/features/mails/components/mail/mail-list-labels'
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useOpenDraftOnClick } from '@/features/mails/hooks/use-open-draft-on-click'
import { MAIL_PRIORITY_HIGHEST } from '@/features/mails/store/mail-compose-slice'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { getListDisplayContact } from '@/features/mails/utils/folder-type-helpers'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  ChevronsUp,
  Forward,
  Paperclip,
  Reply,
  Star,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { memo, useCallback, useRef } from 'react'
import { ImapMessagesList } from '../mails-types'
import { useMailActionMutation, useMoveToTrashMutation } from '../store'
import { formatDate } from './list-item-utils'
import SwipeableMailItem from './swipeable-mail-item'

interface ListItemMobileProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
  onOpenMail?: (id: string) => void | Promise<void>
  onDelete?: (id: string) => void
}

const ListItemMobile: React.FC<ListItemMobileProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
  onOpenMail,
  onDelete: onDeleteOverride,
}) => {
  const t = useTranslations('MAILS_LIST')
  const { push } = useRouter()
  const { account, folder } = useParams()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const [onDelete] = useMoveToTrashMutation()
  const [mailAction] = useMailActionMutation()
  const { folderType } = useCurrentFolder(folderString, accountString)
  const { openDraftIfNeeded } = useOpenDraftOnClick()
  const { id, from, flagged, hasAttachment } = data
  const showHighPriority = data.priority <= 2
  const priorityTitle =
    data.priority === MAIL_PRIORITY_HIGHEST
      ? t('priority.highest.string')
      : t('priority.high.string')
  const showSnippet = data.snippet.trim().length > 0
  const hasEventType = data.mailType.includes('event')
  const hasContactType = data.mailType.includes('contact')
  const displayName = getListDisplayContact(data, folderType)
  const containerRef = useRef<HTMLDivElement>(null)
  const isSelectedClass = isSelected ? 'bg-primary/20' : ''
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSwipingRef = useRef(false)

  const handleLongPress = () => {
    // Don't trigger long press if swiping
    if (isSwipingRef.current) return
    const mockEvent = new MouseEvent('click', { bubbles: true })
    onHandleCheckboxClick(mockEvent as unknown as React.MouseEvent, data)
  }

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress()
    }, 200)
  }

  const handleTouchMove = (_e: React.TouchEvent) => {
    // If touch move is detected, cancel long press
    // This prevents long press from triggering during slow swipes
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleSwipeStart = useCallback(() => {
    isSwipingRef.current = true
    // Cancel any pending long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleSwipeEnd = useCallback(() => {
    isSwipingRef.current = false
  }, [])

  const handleDelete = useCallback(() => {
    if (onDeleteOverride) {
      onDeleteOverride(id)
      return
    }
    onDelete({
      folder: folderString,
      mailId: id,
      accountId: accountString || '0',
    })
  }, [id, onDelete, onDeleteOverride, folderString, accountString])

  const handleMarkAsSeen = useCallback(() => {
    if (onDeleteOverride || data.seen) return
    mailAction({
      accountId: accountString || '0',
      folder: folderString,
      mailId: id,
      action: 'tag',
      data: ['\\Seen'],
    })
  }, [data.seen, mailAction, accountString, folderString, id, onDeleteOverride])

  const handleToggleFlag = useCallback(() => {
    mailAction({
      accountId: accountString || '0',
      folder: folderString,
      mailId: id,
      action: flagged ? 'untag' : 'tag',
      data: ['\\Flagged'],
    })
  }, [flagged, mailAction, accountString, folderString, id])

  return (
    <>
      <SwipeableMailItem
        onDelete={handleDelete}
        onMarkAsSeen={handleMarkAsSeen}
        onSwipeStart={handleSwipeStart}
        onSwipeEnd={handleSwipeEnd}
        disabled={isSelected || !onDeleteOverride}
      >
        <div className="relative overflow-hidden rounded">
          {/* Mobile content */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={cn(
              'flex cursor-pointer flex-col gap-1 p-2 transition-transform duration-75 select-none',
              isSelectedClass,
              data.seen ? '' : 'bg-primary/15 font-semibold',
              data.deleted && 'opacity-60'
            )}
            onClick={async () => {
              if (isSwipingRef.current) return

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

              push(
                `/u/${accountString}/${encodeURIComponent(folderString)}/${id}`
              )
            }}
          >
            <div className="flex min-w-0 flex-row items-center gap-2">
              {/* Avatar on the left */}
              {isSelected && (
                <MailListItemCheckbox
                  isSelected={isSelected}
                  data={data}
                  onHandleCheckboxClick={onHandleCheckboxClick}
                  checkboxClassName="h-7 w-7"
                />
              )}
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center',
                  isSelected ? 'hidden' : ''
                )}
              >
                <Avatar className="bg-secondary flex h-10 w-10 items-center justify-center">
                  <AvatarImage src="/images/account-avatar.svg" />
                  <AvatarFallback className="text-lg font-semibold">
                    {from.name && from.name.length > 0
                      ? from.name[0].toUpperCase()
                      : from.email && from.email.length > 0
                        ? from.email[0].toUpperCase()
                        : '?'}
                  </AvatarFallback>
                </Avatar>
              </span>
              {/* Content on the right */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 flex-row items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
                    <div
                      className={`text-md min-w-0 truncate select-none ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
                    >
                      {displayName}
                    </div>
                  </div>
                  <span className="text-muted-foreground shrink-0 select-none">
                    {hasAttachment && (
                      <Paperclip className="mr-2 inline h-4 w-4" />
                    )}
                    {formatDate(data.date)}
                  </span>
                </div>
                <div className="flex flex-row items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div
                      className={`flex min-w-0 items-center gap-1 select-none ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
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
                      <MailListLabels flags={data.flags} />
                    </div>
                    {showSnippet && (
                      <p className="text-muted-foreground truncate text-sm select-none">
                        {data.snippet}
                      </p>
                    )}
                  </div>
                  <div>
                    <Star
                      fill={flagged ? 'yellow' : 'white'}
                      className="h-5 w-5 shrink-0 cursor-pointer transition-all duration-200 hover:h-5 hover:w-5"
                      strokeWidth={1}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFlag()
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwipeableMailItem>
      <Separator className="m-0" />
    </>
  )
}

export default memo(ListItemMobile)
