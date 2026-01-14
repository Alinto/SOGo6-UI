import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Paperclip, Star } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { memo, useCallback, useRef } from 'react'
import { ImapMessagesList } from '../mails-types'
import { useMoveToTrashMutation } from '../store'
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
  const pathname = usePathname()
  const { mail_id, folder } = useParams()
  const [onDelete] = useMoveToTrashMutation()
  const { id, from, flagged, hasAttachment } = data
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
    onDelete({ folder: folder as string, mailId: id })
  }, [id, onDelete, folder])

  const handleMarkAsSeen = useCallback(() => {
    //todo implement mark as seen mutation
  }, [])

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
            className={`flex cursor-pointer flex-col gap-1 p-2 transition-transform duration-75 select-none ${
              isSelectedClass
            } ${data.seen ? '' : 'bg-primary/15 font-semibold'} `}
            onClick={() => {
              // Don't navigate if we were swiping
              if (isSwipingRef.current) return
              if (mail_id) {
                const newPath = `${pathname}/${id}`
                push(newPath)
              } else {
                push(`${pathname}/${id}`)
              }
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
                  {from.name.length
                    ? from.name[0].toUpperCase()
                    : from.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Content on the right */}
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className={`text-md truncate select-none ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
                    >
                      {from.name || from.email}
                    </div>
                  </div>
                  <span className="text-muted-foreground select-none">
                    {hasAttachment && (
                      <Paperclip className="mr-2 inline h-4 w-4" />
                    )}
                    {formatDate(data.date)}
                  </span>
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <span
                    className={`w-full select-none ${data.seen ? 'text-muted-foreground' : 'font-semibold'}`}
                  >
                    {data.subject}
                  </span>
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
