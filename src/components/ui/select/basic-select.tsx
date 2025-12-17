import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as React from 'react'

interface BasicSelectProps {
  options: { value: string; label: string }[]
  value?: string
  onChange?: (_value: string) => void
  placeholder?: string
  multiple?: false
}

export const BasicSelect: React.FC<BasicSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
