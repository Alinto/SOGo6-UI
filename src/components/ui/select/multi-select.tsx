import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import * as React from 'react'

interface MultiSelectProps {
  options: { value: string; label: string }[]
  value?: string[]
  onChange?: (_value: string[]) => void
  placeholder?: string
  multiple: true
  maxItems?: number
  className?: string
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder,
  maxItems,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selectedValue: string) => {
    if (!onChange) return

    const newValue = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : maxItems && value.length >= maxItems
        ? value
        : [...value, selectedValue]

    onChange(newValue)
  }

  const removeItem = (valueToRemove: string) => {
    if (!onChange) return
    onChange(value.filter((v) => v !== valueToRemove))
  }

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  )

  return (
    <div className={cn('w-full', className)}>
      <Select open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="bg-secondary inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                >
                  {option.label}
                  <X
                    className="hover:text-destructive h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(option.value)
                    }}
                  />
                </span>
              ))
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const isSelected = value.includes(option.value)
            const isDisabled = maxItems
              ? value.length >= maxItems && !isSelected
              : false

            return (
              <SelectItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                disabled={isDisabled}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-4 w-4" />}
                  <span className={isSelected ? 'font-medium' : ''}>
                    {option.label}
                  </span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
