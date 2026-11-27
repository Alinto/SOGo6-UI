'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type Option = {
  value: string
  label: string
  /** Shows a colored dot before the label. */
  color?: string
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      data-testid="multi-select-color-dot"
      className="h-3 w-3 shrink-0 rounded-full border"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  emptyText = 'No options found.',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (value: string) => {
      const updatedSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
      onChange(updatedSelected)
    },
    [selected, onChange]
  )

  const selectedOptions = React.useMemo(
    () =>
      selected
        .map((value) => options.find((option) => option.value === value))
        .filter((option): option is Option => Boolean(option)),
    [selected, options]
  )
  const hasColors = selectedOptions.some((option) => option.color)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selected.length === 0 ? (
            <span className="truncate">{placeholder}</span>
          ) : hasColors ? (
            <span className="flex min-w-0 items-center gap-2 overflow-hidden">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="flex shrink-0 items-center gap-1"
                >
                  {option.color && <ColorDot color={option.color} />}
                  {option.label}
                </span>
              ))}
            </span>
          ) : (
            <span className="truncate">
              {selectedOptions.map((option) => option.label).join(', ')}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search options..." className="h-9" />
          {/* Radix Dialog's scroll lock (react-remove-scroll) blocks wheel
              events on elements outside its own portal subtree — this
              popover renders in a separate portal, so without stopping
              propagation here, scrolling this list is silently prevented
              whenever the select is opened from inside a Dialog. */}
          <CommandList onWheel={(e) => e.stopPropagation()}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.color && <ColorDot color={option.color} />}
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selected.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
