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
  options: { value: string; label: string; labelRight?: string }[]
  onValueChange: (_value: string) => void
  value: string
}

const SelectForm: React.FC<SelectFormProps> = ({
  options,
  onValueChange,
  value,
}) => {
  // Ensure value is always defined and matches an option
  const selectedValue = value || options[0]?.value || undefined

  // If value doesn't match any option, use the first option
  const isValidValue = options.some((opt) => opt.value === selectedValue)
  const finalValue = isValidValue
    ? selectedValue
    : options[0]?.value || undefined

  return (
    <Select onValueChange={onValueChange} value={finalValue}>
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
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectForm
