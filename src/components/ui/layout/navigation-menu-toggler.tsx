'use client'

import { useHover } from '@/hooks/useHover'
import { Grid2X2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import NavigationToggler from './navigation-toggler'

const NavigationMenuToggler: React.FC = () => {
  const navigationRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isNavigationHovered = useHover<HTMLButtonElement>(
    navigationRef as React.RefObject<HTMLButtonElement>
  )
  const [isContentHovered, setIsContentHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // eslint-disable-next-line no-undef
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isNavigationHovered || isContentHovered) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true)
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    } else {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 300)
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [isNavigationHovered, isContentHovered])

  const handleContentMouseEnter = () => setIsContentHovered(true)
  const handleContentMouseLeave = () => setIsContentHovered(false)

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <Button aria-label="Open menu" className="p-0" ref={navigationRef}>
          <Grid2X2 className="h-7 w-7" data-sidebar="menu-button" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-fit p-0">
        <div
          ref={contentRef}
          className="h-full w-full"
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          <NavigationToggler className="flex gap-2 border-none" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NavigationMenuToggler
