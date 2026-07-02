import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'

interface SelectFormProps {
  options: {
    value: string
    label: string
    labelRight?: string
    disabled?: boolean
  }[]
  onValueChange: (_value: string) => void
  value: string
  disabled?: boolean
}

const SelectForm: React.FC<SelectFormProps> = ({
  options,
  onValueChange,
  value,
  disabled = false,
}) => {
  // Ensure value is always defined and matches an option
  const selectedValue = value || options[0]?.value || undefined

  const isValidValue = options.some((opt) => opt.value === selectedValue)
  const finalValue = isValidValue
    ? selectedValue
    : options[0]?.value || undefined

  if (
    process.env.NODE_ENV === 'development' &&
    value &&
    !options.some((opt) => opt.value === value)
  ) {
    console.warn(
      `[SelectForm] Value "${value}" does not match any option. Falling back to "${finalValue ?? 'undefined'}".`
    )
  }

  return (
    <Select onValueChange={onValueChange} value={finalValue} disabled={disabled}>
      <FormControl>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            labelRight={option.labelRight}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectForm
