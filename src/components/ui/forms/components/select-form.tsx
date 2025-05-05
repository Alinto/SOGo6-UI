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
  options: { value: string; label: string }[]
  onValueChange: (_value: string) => void
  value: string
}

const SelectForm: React.FC<SelectFormProps> = ({
  options,
  onValueChange,
  value,
}) => {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="" />
        </SelectTrigger>
      </FormControl>
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

export default SelectForm
