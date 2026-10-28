'use client'

import { useHover } from '@/hooks/useHover'
import { Grid2X2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import NavigationToggler from './navigation-toggler'

const NavigationMenuToggler: React.FC = () => {
  const t = useTranslations('COMMONS')
  const navigationRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dismissedWhileHovered = useRef(false)
  const isNavigationHovered = useHover<HTMLButtonElement>(
    navigationRef as React.RefObject<HTMLButtonElement>
  )
  const [isContentHovered, setIsContentHovered] = useState(false)
  const [isContentFocused, setIsContentFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const pointerOver = isNavigationHovered || isContentHovered
    if (dismissedWhileHovered.current && pointerOver) return
    if (!pointerOver) dismissedWhileHovered.current = false

    if (pointerOver || isContentFocused) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      const openTimer = window.setTimeout(() => setIsOpen(true), 0)
      return () => window.clearTimeout(openTimer)
    }

    if (pinned) return

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300)

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [isNavigationHovered, isContentHovered, isContentFocused, pinned])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      setPinned(false)
      dismissedWhileHovered.current = true
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const toggleFromClick = () => {
    setIsOpen((current) => {
      const next = !current
      setPinned(next)
      if (!next) dismissedWhileHovered.current = true
      return next
    })
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        setPinned(open)
        if (!open) dismissedWhileHovered.current = true
      }}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label={t('open_menu.string')}
          aria-expanded={isOpen}
          className="p-0"
          ref={navigationRef}
          onClick={toggleFromClick}
        >
          <Grid2X2 className="h-7 w-7" data-sidebar="menu-button" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-fit p-0">
        <div
          ref={contentRef}
          className="h-full w-full"
          onMouseEnter={() => setIsContentHovered(true)}
          onMouseLeave={() => setIsContentHovered(false)}
          onFocus={() => setIsContentFocused(true)}
          onBlur={(event) => {
            if (!contentRef.current?.contains(event.relatedTarget)) {
              setIsContentFocused(false)
            }
          }}
        >
          <NavigationToggler className="flex gap-2 border-none" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NavigationMenuToggler
