import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
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
import { useParams } from 'next/navigation'
import React, { memo, useCallback, useRef } from 'react'
import { ImapMessagesList } from '../mails-types'
import {
  createDraft,
  selectAllDrafts,
  selectOpenDraftIds,
  setActiveDraft,
  useLazyGetEditMessageQuery,
  useMailActionMutation,
  useMoveToTrashMutation,
} from '../store'
import { apiDataToMailComposeDraft } from '../utils/mail-compose-from-api'
import { formatDate } from './list-item-utils'
import SwipeableMailItem from './swipeable-mail-item'

interface ListItemMobileProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
}

const ListItemMobile: React.FC<ListItemMobileProps> = ({
  data,
  isSelected,
  onHandleCheckboxClick,
}) => {
  const { push } = useRouter()
  const { account, folder } = useParams()
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const folderString = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const [onDelete] = useMoveToTrashMutation()
  const [mailAction] = useMailActionMutation()
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const allDrafts = useAppSelector(selectAllDrafts)
  const [triggerGetEditMessage] = useLazyGetEditMessageQuery()
  const { id, from, to, flagged, hasAttachment } = data
  const showHighPriority = data.priority <= 2
  const showSnippet = data.snippet.trim().length > 0
  const hasEventType = data.mailType.includes('event')
  const hasContactType = data.mailType.includes('contact')
  const isDraftsFolder = folderString.toLocaleLowerCase() === 'drafts'
  const recipient = to[0]
  const displayName = isDraftsFolder
    ? recipient?.name || recipient?.email || ''
    : from.name || from.email
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
    onDelete({
      folder: folderString,
      mailId: id,
      accountId: accountString || '0',
    })
  }, [id, onDelete, folderString, accountString])

  const handleMarkAsSeen = useCallback(() => {
    if (data.seen) return
    mailAction({
      accountId: accountString || '0',
      folder: folderString,
      mailId: id,
      action: 'tag',
      data: ['\\Seen'],
    })
  }, [data.seen, mailAction, accountString, folderString, id])

  return (
    <>
      <SwipeableMailItem
        onDelete={handleDelete}
        onMarkAsSeen={handleMarkAsSeen}
        onSwipeStart={handleSwipeStart}
        onSwipeEnd={handleSwipeEnd}
        disabled={isSelected}
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
              // Don't navigate if we were swiping
              if (isSwipingRef.current) return

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
                return
              }

              push(
                `/u/${accountString}/${encodeURIComponent(folderString)}/${id}`
              )
            }}
          >
            <div className="flex flex-row items-center gap-2">
              {/* Avatar on the left */}
              {isSelected && (
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                  <Checkbox
                    className="h-7 w-7 shrink-0 cursor-pointer bg-white"
                    checked={isSelected}
                    onClick={(e) => {
                      onHandleCheckboxClick(e, data)
                    }}
                  />
                </span>
              )}
              <Avatar
                className={
                  !isSelected
                    ? 'bg-secondary flex h-10 w-10 shrink-0 items-center justify-center'
                    : 'hidden'
                }
              >
                <AvatarImage src="/images/account-avatar.svg" />
                <AvatarFallback className="text-lg font-semibold">
                  {from.name && from.name.length > 0
                    ? from.name[0].toUpperCase()
                    : from.email && from.email.length > 0
                      ? from.email[0].toUpperCase()
                      : '?'}
                </AvatarFallback>
              </Avatar>
              {/* Content on the right */}
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className={`text-md truncate select-none ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
                    >
                      {displayName}
                    </div>
                  </div>
                  <span className="text-muted-foreground select-none">
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
