'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ListRowProps } from 'react-virtualized'
import { AutoSizer, List } from 'react-virtualized'
import 'react-virtualized/styles.css'
import type { TimezoneSelectProps } from './types'
import { getTimezones } from './utils'

export function TimezoneSelect({
  value,
  onValueChange,
  placeholder = 'Select timezone...',
  className,
  disabled = false,
}: TimezoneSelectProps) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const listRef = useRef<List>(null)

  // Generate timezones based on current locale
  const timezones = useMemo(() => getTimezones(locale), [locale])

  // Filter timezones based on search term
  const filteredTimezones = useMemo(() => {
    if (!searchTerm.trim()) return timezones
    const lowerSearchTerm = searchTerm.toLowerCase()
    return timezones.filter(
      (tz) =>
        tz.label.toLowerCase().includes(lowerSearchTerm) ||
        tz.value.toLowerCase().includes(lowerSearchTerm)
    )
  }, [timezones, searchTerm])

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (open && value && listRef.current) {
      const index = filteredTimezones.findIndex((tz) => tz.value === value)
      if (index !== -1) {
        listRef.current.scrollToRow(index)
      }
    }
  }, [open, value, filteredTimezones])

  // Handle open state change
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchTerm('')
    }
  }

  // Find the selected timezone label for display
  const selectedTimezoneLabel = useMemo(() => {
    if (!value) return placeholder
    const selected = timezones.find((tz) => tz.value === value)
    return selected?.label || value
  }, [value, timezones, placeholder])

  const rowRenderer = ({ index, key, style }: ListRowProps) => {
    const timezone = filteredTimezones[index]
    const isSelected = value === timezone.value
    const checkmark = '✓'

    return (
      <div
        key={key}
        style={style}
        className={cn(
          'hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        onClick={() => {
          onValueChange?.(timezone.value)
          handleOpenChange(false)
        }}
        role="option"
        aria-selected={isSelected}
      >
        {timezone.label}
        {isSelected && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            {checkmark}
          </span>
        )}
      </div>
    )
  }

  return (
    <Select
      value={value}
      disabled={disabled}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedTimezoneLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[400px] p-0">
        <div className="border-input sticky top-0 z-10 border-b p-2">
          <Input
            placeholder="Search timezones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <SelectGroup>
          {filteredTimezones.length > 0 ? (
            <div style={{ height: '280px', width: '100%' }}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    rowCount={filteredTimezones.length}
                    rowHeight={32}
                    rowRenderer={rowRenderer}
                    overscanRowCount={10}
                  />
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">
              No timezones found
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default TimezoneSelect
