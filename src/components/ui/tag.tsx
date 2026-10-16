import { cn, tagDismissButtonClassName } from '@/lib/utils'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

interface TagProps {
  value: string
  tooltip?: string
  details?: React.ReactNode // Rich content shown on hover or click
  icon?: IconName
  action?: () => void
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

const HOVER_OPEN_DELAY = 300
const HOVER_CLOSE_DELAY = 150

const Tag: React.FC<TagProps> = ({
  value,
  tooltip,
  details,
  action,
  icon,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  const [open, setOpen] = useState(false)
  // Pointer type and open state when the press started: Radix closes the
  // tooltip/popover on pointerdown (outside its content) before the click
  // lands.
  const pressRef = useRef({ pointerType: '', wasOpen: false })
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  const tag = (
    <div
      className={cn(
        'tag bg-muted flex h-9 max-w-[200px] items-center rounded-full text-sm',
        icon ? 'gap-2 pr-1 pl-3' : 'px-3',
        details && 'cursor-pointer',
        className
      )}
      role="listitem"
      data-testid={dataTestId}
    >
      <span className="truncate">{value}</span>
      {icon && (
        <button
          type="button"
          onClick={(event) => {
            // Removing the tag must not open its details.
            event.stopPropagation()
            if (action) action()
          }}
          aria-label={ariaLabel}
          className={tagDismissButtonClassName('h-7 w-7')}
        >
          <DynamicIcon size="16" name={icon} />
        </button>
      )}
    </div>
  )

  const onPointerDown = (event: React.PointerEvent) => {
    pressRef.current = { pointerType: event.pointerType, wasOpen: open }
  }

  if (details) {
    const scheduleOpen = (next: boolean, delay: number) => {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => setOpen(next), delay)
    }
    const onHoverStart = (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') scheduleOpen(true, HOVER_OPEN_DELAY)
    }
    const onHoverEnd = (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') scheduleOpen(false, HOVER_CLOSE_DELAY)
    }

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          clearTimeout(hoverTimerRef.current)
          setOpen(next)
        }}
      >
        <PopoverTrigger
          asChild
          onPointerDown={onPointerDown}
          onPointerEnter={onHoverStart}
          onPointerLeave={onHoverEnd}
          onClick={(event) => {
            // Radix toggles on click, but may already have closed it on
            // pointerdown: decide from the state at press time.
            event.preventDefault()
            clearTimeout(hoverTimerRef.current)
            setOpen(!pressRef.current.wasOpen)
          }}
        >
          {tag}
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          className="w-80 max-w-[calc(100vw-2rem)] p-3"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={onHoverStart}
          onPointerLeave={onHoverEnd}
        >
          {details}
        </PopoverContent>
      </Popover>
    )
  }

  if (!tooltip) return tag

  // Radix tooltips only open on hover/focus, so a tap toggles it on touch
  // screens.
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onPointerDown={onPointerDown}
          onClick={(event) => {
            if (pressRef.current.pointerType !== 'touch') return
            // Keeps Radix from closing it right away.
            event.preventDefault()
            setOpen(!pressRef.current.wasOpen)
          }}
        >
          {tag}
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Tag
